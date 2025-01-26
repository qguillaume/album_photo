<?php

// src/Controller/RegistrationController.php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\UserRepository;
use Symfony\Component\Security\Core\Security;

class RegistrationController extends AbstractController
{
    private $passwordHasher;

    // Injection du service de hachage du mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * @Route("/register", name="register")
     */
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

            // Envoi de l'email de confirmation
            $email = (new Email())
                ->from('noreply@gqportfolio.com') // L'expéditeur
                ->to($user->getEmail()) // L'adresse de l'utilisateur
                ->subject('Merci pour votre inscription !')
                ->text('Bonjour ' . $user->getUsername() . ', merci pour votre inscription sur notre site.')
                ->html('<p>Bonjour ' . $user->getUsername() . ',</p><p>Merci pour votre inscription sur notre site.</p>');

            $mailer->send($email);

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
     * @Route("/api/register", name="api_register", methods={"POST"})
     */
    public function apiRegister(Request $request, UserRepository $userRepository, MailerInterface $mailer): Response
    {
        // Récupérer les données envoyées par le frontend
        $data = json_decode($request->getContent(), true);

        $username = $data['username'] ?? null;
        $email = $data['email'] ?? null;
        $password = $data['password'] ?? null;

        // Validation basique des données
        if (!$username || !$email || !$password) {
            return new Response('Tous les champs sont requis.', Response::HTTP_BAD_REQUEST);
        }

        // Vérifier si l'utilisateur existe déjà
        $existingUser = $userRepository->findOneBy(['email' => $email]);
        if ($existingUser) {
            return new Response('Un utilisateur avec cet email existe déjà.', Response::HTTP_CONFLICT);
        }

        // Créer un nouvel utilisateur
        $user = new User();
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setPassword($this->passwordHasher->hashPassword($user, $password));

        // Sauvegarder l'utilisateur dans la base de données
        $entityManager = $this->getDoctrine()->getManager();
        $entityManager->persist($user);
        $entityManager->flush();

        // Envoi de l'email de confirmation
        $emailAdress = (new Email())
            ->from('noreply@gqportfolio.com') // L'expéditeur
            ->to($user->getEmail()) // L'adresse de l'utilisateur
            ->subject('Merci pour votre inscription !')
            ->text('Bonjour ' . $user->getUsername() . ', merci pour votre inscription sur notre site.')
            ->html('<p>Bonjour ' . $user->getUsername() . ',</p><p>Merci pour votre inscription sur notre site.</p>');

        $mailer->send($emailAdress);

        // Réponse de succès
        return new Response('Utilisateur enregistré avec succès', Response::HTTP_CREATED);
    }
}