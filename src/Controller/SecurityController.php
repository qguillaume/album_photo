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
use Symfony\Component\Validator\Validator\ValidatorInterface;

class SecurityController extends AbstractController
{
    private $passwordHasher;
    private $validator;

    public function __construct(UserPasswordHasherInterface $passwordHasher, ValidatorInterface $validator)
    {
        $this->passwordHasher = $passwordHasher;
        $this->validator = $validator;
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

        $user = new User();
        $user->setUsername($lastUsername);

        $form = $this->createForm(LoginFormType::class, $user, ['method' => 'POST']);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Validation reCAPTCHA
            $captchaError = $this->validator->validate($form->get('captcha')->getData());
            if (count($captchaError) > 0) {
                $error = 'Veuillez confirmer que vous n\'êtes pas un robot.';
            } else {
                // Recherche utilisateur dans la base de données
                $userRepository = $this->getDoctrine()->getRepository(User::class);
                $user = $userRepository->findOneBy(['username' => $form->get('username')->getData()]);

                if ($user && $this->passwordHasher->isPasswordValid($user, $form->get('password')->getData())) {
                    return $this->redirectToRoute('portfolio_home');
                }

                $error = 'Nom d\'utilisateur ou mot de passe incorrect.';
            }
        }

        return $this->render('security/login.html.twig', [
            'loginForm' => $form->createView(),
            'error' => $error,
            'last_username' => $lastUsername,
        ]);
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