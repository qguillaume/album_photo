<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class LanguageController extends AbstractController
{
    /**
     * @Route("/switch-language", name="switch_language")
     */
    public function switchLanguage(Request $request): RedirectResponse
    {
        $lang = $request->get('lang'); // Récupère la langue depuis la requête
        if ($lang) {
            // Sauvegarde la langue dans la session
            $this->get('session')->set('_locale', $lang);
            // Change la langue du traducteur (pour les fichiers .yaml par exemple)
            $this->get('translator')->setLocale($lang);
        }

        return $this->redirectToRoute('login');
    }
}