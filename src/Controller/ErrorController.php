<?php

// src/Controller/ErrorController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Security\Core\Security;

class ErrorController extends AbstractController
{
    /**
     * Cette méthode va gérer les erreurs 404 (et autres erreurs HTTP)
     * Si l'utilisateur est connecté, il est redirigé vers l'accueil.
     * Sinon, il est redirigé vers la page de login.
     *
     * @Route("/error", name="error_page")
     */
    public function showError(Security $security): RedirectResponse
    {
        // Vérifie si l'utilisateur est connecté
        $user = $security->getUser();

        if ($user) {
            // Si l'utilisateur est connecté, redirige vers l'accueil
            return $this->redirectToRoute('portfolio_home');
        }

        // Si l'utilisateur n'est pas connecté, redirige vers la page de connexion
        return $this->redirectToRoute('login');
    }
}
