<?php

// src/Controller/RegistrationController.php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Doctrine\DBAL\Exception\UniqueConstraintViolationException;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Cache\CacheItemPoolInterface;
use Psr\Log\LoggerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Validator\Validator\ValidatorInterface;
use App\Repository\UserRepository;
use Symfony\Component\Security\Core\Security;

class RegistrationController extends AbstractController
{
    /**
     * Nombre d'inscriptions autorisées par adresse IP et par fenêtre de temps.
     * Assez large pour ne jamais gêner un visiteur légitime (y compris derrière
     * une IP partagée), assez bas pour rendre la création de comptes en masse
     * inutilisable.
     */
    private const REGISTRATION_MAX_ATTEMPTS = 5;
    private const REGISTRATION_WINDOW_SECONDS = 3600;

    private UserPasswordHasherInterface $passwordHasher;

    // Injection du service de hachage du mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    #[Route('/register', name: 'register')]
    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer, Security $security): Response
    {
        // Vérifier si l'utilisateur est déjà connecté
        if ($security->getUser()) {
            // Rediriger vers la page d'accueil
            return $this->redirectToRoute('portfolio_home');
        }

        $user = new User();

        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        // Variable pour vérifier si le formulaire a des erreurs
        $error = 0;

        // Vérifie si le formulaire est soumis et valide
        if ($form->isSubmitted() && !$form->isValid()) {
            $error = 1; // Définit la variable error à 1 si des erreurs existent
            $this->addFlash('error', 'Veuillez corriger les erreurs ci-dessous.');
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword(
                $passwordHasher->hashPassword($user, $form->get('password')->getData())
            );

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            $this->sendRegistrationEmails($mailer, $user, $request->getClientIp() ?? 'inconnue', null);

            // Ajouter un message flash de succès, on fait ca ici pour afficher un message de succès sur une autre page (page de login par exemple)
            $this->addFlash('success', 'inscription_successful');

            return $this->redirectToRoute('login');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
            'error' => $error
        ]);
    }

    /**
     * Endpoint JSON utilisé par le formulaire React (assets/components/RegisterForm.tsx).
     *
     * La validation faite dans le composant React est purement côté client : elle est
     * contournable par n'importe quel client HTTP (curl, script). Tout est donc
     * revalidé ici, et l'endpoint est limité en débit — sans cette limite, chaque
     * appel fait partir deux emails, ce qui permet de se servir du serveur comme
     * relais d'envoi.
     */
    #[Route('/api/register', name: 'api_register', methods: ['POST'])]
    public function apiRegister(
        Request $request,
        UserRepository $userRepository,
        EntityManagerInterface $entityManager,
        MailerInterface $mailer,
        ValidatorInterface $validator,
        CacheItemPoolInterface $cache,
        LoggerInterface $logger
    ): JsonResponse {
        $clientIp = $request->getClientIp() ?? 'inconnue';

        $retryAfter = $this->registrationRateLimitDelay($cache, $clientIp);
        if ($retryAfter > 0) {
            $logger->warning("Inscription refusée : limite de débit atteinte.", ['ip' => $clientIp]);

            return $this->registrationError(
                'rate_limited',
                'Trop de tentatives d\'inscription depuis cette adresse. Réessayez plus tard.',
                Response::HTTP_TOO_MANY_REQUESTS,
                ['Retry-After' => (string) $retryAfter]
            );
        }

        // Récupérer les données envoyées par le frontend
        $data = json_decode($request->getContent(), true);
        if (!is_array($data)) {
            return $this->registrationError('invalid_payload', 'Requête invalide.', Response::HTTP_BAD_REQUEST);
        }

        $username = is_string($data['username'] ?? null) ? trim($data['username']) : '';
        $email = is_string($data['email'] ?? null) ? trim($data['email']) : '';
        $password = is_string($data['password'] ?? null) ? $data['password'] : '';

        // Validation basique des données
        if ('' === $username || '' === $email || '' === $password) {
            return $this->registrationError('missing_fields', 'Tous les champs sont requis.', Response::HTTP_BAD_REQUEST);
        }

        $user = new User();
        $user->setUsername($username);
        $user->setEmail($email);
        // Le mot de passe est renseigné en clair pour la validation : les contraintes
        // de longueur de l'entité portent sur le mot de passe saisi, pas sur le hash.
        $user->setPassword($password);

        // Les contraintes sur l'email sont déclarées dans le groupe "registration"
        // (cf. App\Entity\User), il faut donc le demander explicitement.
        $violations = $validator->validate($user, null, ['Default', 'registration']);
        if (count($violations) > 0) {
            return $this->registrationError(
                'invalid_fields',
                (string) $violations->get(0)->getMessage(),
                Response::HTTP_BAD_REQUEST
            );
        }

        // Vérifier si l'utilisateur existe déjà
        if ($userRepository->findOneBy(['email' => $email])) {
            return $this->registrationError('email_taken', 'Un utilisateur avec cet email existe déjà.', Response::HTTP_CONFLICT);
        }

        if ($userRepository->findOneBy(['username' => $username])) {
            return $this->registrationError('username_taken', 'Ce nom d\'utilisateur est déjà pris.', Response::HTTP_CONFLICT);
        }

        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        // Sauvegarder l'utilisateur dans la base de données
        try {
            $entityManager->persist($user);
            $entityManager->flush();
        } catch (UniqueConstraintViolationException $e) {
            // Deux requêtes simultanées peuvent passer les contrôles d'unicité
            // ci-dessus avant que l'une des deux n'écrive : la base tranche.
            return $this->registrationError('email_taken', 'Un utilisateur avec ces identifiants existe déjà.', Response::HTTP_CONFLICT);
        }

        $this->sendRegistrationEmails($mailer, $user, $clientIp, $logger);

        // Réponse de succès
        return new JsonResponse(['status' => 'created'], Response::HTTP_CREATED);
    }

    /**
     * Compteur à fenêtre fixe par adresse IP, stocké dans le cache applicatif.
     * Le projet n'embarque pas symfony/rate-limiter : ce compteur évite d'ajouter
     * une dépendance pour un besoin ponctuel.
     *
     * @return int 0 si la requête est autorisée, sinon le nombre de secondes à attendre
     */
    private function registrationRateLimitDelay(CacheItemPoolInterface $cache, string $clientIp): int
    {
        $item = $cache->getItem('registration_attempts_' . sha1($clientIp));
        $now = time();
        $bucket = $item->isHit() ? $item->get() : null;

        // Nouvelle fenêtre si aucun compteur en cours ou si le précédent est expiré.
        if (!is_array($bucket) || ($bucket['reset'] ?? 0) <= $now) {
            $bucket = ['count' => 0, 'reset' => $now + self::REGISTRATION_WINDOW_SECONDS];
        }

        ++$bucket['count'];

        $item->set($bucket);
        // L'expiration est recalculée à chaque écriture pour rester alignée sur la
        // fenêtre d'origine, sinon celle-ci glisserait à chaque tentative.
        $item->expiresAfter($bucket['reset'] - $now);
        $cache->save($item);

        return $bucket['count'] > self::REGISTRATION_MAX_ATTEMPTS ? $bucket['reset'] - $now : 0;
    }

    /**
     * @param array<string, string> $headers
     */
    private function registrationError(string $code, string $message, int $status, array $headers = []): JsonResponse
    {
        return new JsonResponse(['code' => $code, 'message' => $message], $status, $headers);
    }

    /**
     * Envoie la confirmation à l'inscrit et la notification à l'administrateur.
     *
     * Le nom d'utilisateur vient de l'extérieur : il est échappé avant d'être
     * inséré dans le corps HTML des emails.
     */
    private function sendRegistrationEmails(MailerInterface $mailer, User $user, string $clientIp, ?LoggerInterface $logger): void
    {
        $safeUsername = htmlspecialchars($user->getUsername(), ENT_QUOTES, 'UTF-8');
        $safeEmail = htmlspecialchars($user->getEmail(), ENT_QUOTES, 'UTF-8');

        // Envoi de l'email de confirmation
        $confirmation = (new Email())
            ->from('noreply@guillaume-quesnel.com')
            ->to($user->getEmail()) // L'adresse de l'utilisateur
            ->subject('Merci pour votre inscription !')
            ->text('Bonjour ' . $user->getUsername() . ', merci pour votre inscription sur notre site.')
            ->html('<p>Bonjour ' . $safeUsername . ',</p><p>Merci pour votre inscription sur notre site.</p>');

        // Envoyer un mail après l'inscription d'un nouvel utilisateur
        $notification = (new Email())
            ->from('no-reply@guillaume-quesnel.com')
            ->to('admin@guillaume-quesnel.com')
            ->subject('Nouvel utilisateur ' . $user->getUsername())
            ->html(sprintf(
                "<p>Inscription d'un nouvel utilisateur %s (%s).</p><p>Adresse IP : %s</p>",
                $safeUsername,
                $safeEmail,
                htmlspecialchars($clientIp, ENT_QUOTES, 'UTF-8')
            ));

        // Un échec d'envoi ne doit pas renvoyer une erreur 500 alors que le compte
        // est déjà créé en base.
        try {
            $mailer->send($confirmation);
            $mailer->send($notification);
        } catch (TransportExceptionInterface $e) {
            $logger?->error("Envoi des emails d'inscription impossible.", ['exception' => $e]);
        }
    }
}
