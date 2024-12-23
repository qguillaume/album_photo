<?php

// src/Controller/SecurityController.php

namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Security\Core\Encoder\UserPasswordEncoderInterface;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;

class SecurityController extends AbstractController
{
    private $passwordHasher;

    // Injection du service de hachage du mot de passe
    public function __construct(UserPasswordHasherInterface $passwordHasher)
    {
        $this->passwordHasher = $passwordHasher;
    }

    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // Récupère les erreurs de connexion (si présentes)
        $error = $authenticationUtils->getLastAuthenticationError();
        // Récupère le dernier nom d'utilisateur soumis (pour préremplir le champ)
        $lastUsername = $authenticationUtils->getLastUsername();

        // Log de l'erreur pour le débogage
        if ($error) {
            dump($error);
        }

        // Afficher la page de connexion
        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    /**
     * Endpoint pour tester un mot de passe avec son hashage.
     */
    public function testPassword(Request $request): Response
    {
        // Récupère l'utilisateur avec son nom d'utilisateur
        $user = $this->getDoctrine()->getRepository(User::class)->findOneBy(['username' => 'guillaume']);

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
        $hashedPassword = password_hash('pikachu84STORM', PASSWORD_BCRYPT);

        // Affiche le mot de passe haché
        return new Response('Mot de passe haché : ' . $hashedPassword);
    }
}
