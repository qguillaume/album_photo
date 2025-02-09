<?php

// src/Controller/SecurityController.php

namespace App\Controller;

use App\Entity\User;
use App\Form\LoginFormType;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\HttpFoundation\RedirectResponse;
use VictorPrdh\RecaptchaBundle\Validator\Constraints\RecaptchaValidator;

class SecurityController extends AbstractController
{
    private $passwordHasher;

    // Injection du service de hachage du mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * @Route("/login", name="login")
     */
    public function login(AuthenticationUtils $authenticationUtils, Request $request): Response
    {
        // Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
        if ($this->getUser()) {
            return $this->redirectToRoute('portfolio_home');
        }

        // Récupère les erreurs de connexion (si présentes)
        $error = $authenticationUtils->getLastAuthenticationError();
        // Récupère le dernier nom d'utilisateur soumis (pour préremplir le champ)
        $lastUsername = $authenticationUtils->getLastUsername();

        // Créer un objet User vide
        $user = new User();
        $user->setUsername($lastUsername);  // On préremplir avec le dernier nom d'utilisateur

        // Créer le formulaire de connexion en liant l'entité User
        $form = $this->createForm(LoginFormType::class, $user, [
            'method' => 'POST'
        ]);

        // Si le formulaire est soumis et valide
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Validation du reCAPTCHA
            $captchaResponse = $form->get('captcha')->getData();
            if (!$captchaResponse || !$this->isCaptchaValid($captchaResponse)) {
                // Si le reCAPTCHA n'est pas valide, on affiche une erreur
                $this->addFlash('error', 'Veuillez valider le reCAPTCHA.');
                return $this->redirectToRoute('login');
            }

            // Recherche utilisateur dans la base de données
            $userRepository = $this->getDoctrine()->getRepository(User::class);
            $user = $userRepository->findOneBy(['username' => $form->get('username')->getData()]);

            if ($user && $this->passwordHasher->isPasswordValid($user, $form->get('password')->getData())) {
                // Authentification réussie
                return $this->redirectToRoute('portfolio_home');
            }

            // Si l'utilisateur ou le mot de passe est incorrect
            $error = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }

        // Afficher la page de connexion
        return $this->render('security/login.html.twig', [
            'loginForm' => $form->createView(),
            'error' => $error,
            'last_username' => $lastUsername,
        ]);
    }

    // Fonction pour valider le reCAPTCHA
    private function isCaptchaValid(string $captchaResponse): bool
    {
        // Utilisation du service recaptcha fourni par le bundle
        $recaptchaService = $this->container->get('recaptcha');
        return $recaptchaService->verify($captchaResponse);
    }

    // Endpoint pour tester un mot de passe avec son hashage.
    /**
     * @Route("/test-password", name="test_password")
     */
    public function testPassword(Request $request): Response
    {
        // Récupère l'utilisateur avec son nom d'utilisateur
        $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['username' => 'Guillaume']);

        // Récupérer le mot de passe en clair que tu veux tester
        $plainPassword = $request->query->get('password'); // Par exemple, /test-password?password=monmotdepasse

        if ($user) {
            // Vérifie si le mot de passe en clair correspond au mot de passe haché
            $isValid = $this->passwordHasher->isPasswordValid($user, $plainPassword);

            if ($isValid) {
                return new Response('Le mot de passe est valide !');
            } else {
                return new Response('Le mot de passe est invalide.');
            }
        }

        return new Response('Utilisateur non trouvé.', Response::HTTP_NOT_FOUND);
    }

    /**
     * @Route("/logout", name="logout")
     */
    public function logout(): void
    {
        // Symfony se charge de la déconnexion automatiquement.
    }

    /**
     * @Route("/generate-password", name="generate_password")
     */
    public function generatePassword(): Response
    {
        // Générer un mot de passe avec bcrypt (12 rounds)
        $hashedPassword = password_hash('toto', PASSWORD_BCRYPT);

        // Affiche le mot de passe haché
        return new Response('Mot de passe haché : ' . $hashedPassword);
    }

    /**
     * @Route("/access-denied", name="access_denied_redirect")
     */
    public function accessDenied(): RedirectResponse
    {
        return $this->redirectToRoute('portfolio_home');
    }
}