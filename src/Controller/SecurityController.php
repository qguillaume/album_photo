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
use Symfony\Component\Security\Core\Security;

class SecurityController extends AbstractController
{
    private $passwordHasher;

    // Injection du service de hachage du mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    /**
     * @Route("/api/login", name="api_login", methods={"POST"})
     */
    public function apiLogin(Request $request): Response
    {
        // Récupérer les données JSON envoyées par le frontend
        $data = json_decode($request->getContent(), true);
        $username = $data['username'] ?? null;
        $password = $data['password'] ?? null;

        if (!$username || !$password) {
            return new Response('Nom d\'utilisateur ou mot de passe manquant', Response::HTTP_BAD_REQUEST);
        }

        // Recherche de l'utilisateur dans la base de données
        $userRepository = $this->getDoctrine()->getRepository(User::class);
        $user = $userRepository->findOneBy(['username' => $username]);

        if ($user && $this->passwordHasher->isPasswordValid($user, $password)) {
            // Connexion réussie, retourne une réponse 200
            return new Response('Connexion réussie', Response::HTTP_OK);
        }

        // Erreur de connexion : nom d'utilisateur ou mot de passe incorrect
        return new Response('Nom d\'utilisateur ou mot de passe incorrect.', Response::HTTP_UNAUTHORIZED);
    }

    /**
     * @Route("/login", name="login")
     */
    public function login(AuthenticationUtils $authenticationUtils, Request $request, Security $security): Response
    {
        // Vérifier si l'utilisateur est déjà connecté
        if ($security->getUser()) {
            // Rediriger vers la page d'accueil
            return $this->redirectToRoute('portfolio_home');
        }

        // Récupère les erreurs de connexion
        $error = $authenticationUtils->getLastAuthenticationError();
        $lastUsername = $authenticationUtils->getLastUsername();

        $user = new User();
        $user->setUsername($lastUsername); // préremplir avec le dernier nom d'utilisateur

        $form = $this->createForm(LoginFormType::class, $user);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Recherche utilisateur et validation du mot de passe
            $userRepository = $this->getDoctrine()->getRepository(User::class);
            $user = $userRepository->findOneBy(['username' => $form->get('username')->getData()]);

            if ($user && $this->passwordHasher->isPasswordValid($user, $form->get('password')->getData())) {
                // Authentification réussie, Symfony gère la session automatiquement
                return $this->redirectToRoute('portfolio_home');
            }

            // Si utilisateur ou mot de passe incorrect
            $error = 'Nom d\'utilisateur ou mot de passe incorrect.';
        }

        return $this->render('security/login.html.twig', [
            'loginForm' => $form->createView(),
            'error' => $error,
            'last_username' => $lastUsername,
        ]);
    }

    /**
     * @Route("/logout", name="logout")
     */
    public function logout(): void
    {
        // Symfony se charge de la déconnexion automatiquement.
    }

    /**
     * @Route("/access-denied", name="access_denied_redirect")
     */
    public function accessDenied(): RedirectResponse
    {
        return $this->redirectToRoute('portfolio_home');
    }
}