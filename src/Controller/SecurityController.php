<?php

// src/Controller/SecurityController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Session\SessionInterface;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Security\Http\Authentication\UserAuthenticatorInterface;
use App\Security\LoginFormAuthenticator;
use App\Entity\User;
use App\Form\LoginFormType;
use App\Service\CaptchaGenerator;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Contracts\Translation\TranslatorInterface;

class SecurityController extends AbstractController
{
    private $passwordHasher;
    private $captchaGenerator;

    public function __construct(UserPasswordHasherInterface $passwordHasher, CaptchaGenerator $captchaGenerator)
    {
        $this->passwordHasher = $passwordHasher;
        $this->captchaGenerator = $captchaGenerator;
    }

    /**
     * @Route("/login", name="login")
     */
    public function login(
        AuthenticationUtils $authenticationUtils,
        Request $request,
        SessionInterface $session,
        UserAuthenticatorInterface $userAuthenticator,
        LoginFormAuthenticator $authenticator,
        TranslatorInterface $translator
    ): Response {
        // Si l'utilisateur est déjà connecté, on le redirige vers l'accueil
        if ($this->getUser()) {
            return $this->redirectToRoute('portfolio_home');
        }

        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        $user = new User();
        $user->setUsername($lastUsername);

        // Génération du Captcha uniquement si le formulaire n'est pas soumis
        if (!$request->isMethod('POST')) {
            $captchaText = $this->captchaGenerator->generateCaptchaText();
            $session->set('captcha', $captchaText); // Stocke le captcha généré dans la session
        } else {
            $captchaText = $session->get('captcha'); // Récupère le captcha existant
        }

        // Crée le formulaire
        $form = $this->createForm(LoginFormType::class, $user, [
            'method' => 'POST',
            'captcha' => $captchaText, // Passe le captcha généré au formulaire
        ]);

        // Manipuler la soumission du formulaire
        $form->handleRequest($request);

        // Vérifie si le formulaire est soumis
        if ($form->isSubmitted() && $form->isValid()) {
            // Récupérer le captcha soumis
            $submittedCaptcha = $form->get('captcha')->getData();
            // Récupérer le captcha stocké dans la session
            $storedCaptcha = $session->get('captcha');

            // Valider le captcha avant de procéder à l'authentification
            if ($submittedCaptcha !== $storedCaptcha) {
                $this->addFlash('error', $translator->trans('invalid_captcha', [], 'messages'));
                return $this->redirectToRoute('login');
            }

            // Si le captcha est correct, procéder à la vérification du nom d'utilisateur et du mot de passe
            $userRepository = $this->getDoctrine()->getRepository(User::class);
            $user = $userRepository->findOneBy(['username' => $form->get('username')->getData()]);

            if ($user && $this->passwordHasher->isPasswordValid($user, $form->get('password')->getData())) {
                // Authentifier l'utilisateur
                return $userAuthenticator->authenticateUser(
                    $user,
                    $authenticator,
                    $request
                );
            }

            // Si les identifiants sont incorrects, afficher une erreur
            $this->addFlash('error', $translator->trans('invalid_credentials', [], 'messages'));

            return $this->redirectToRoute('login');
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