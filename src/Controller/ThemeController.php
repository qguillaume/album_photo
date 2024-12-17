<?php
// src/Controller/ThemeController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\Routing\Annotation\Route;

class ThemeController extends AbstractController
{
    /**
     * @Route("/set-theme", name="set_theme", methods={"POST"})
     */
    public function setTheme(Request $request)
    {
        // Récupérer la donnée envoyée par JavaScript
        $data = json_decode($request->getContent(), true);

        // Enregistrer le thème dans la session
        $this->get('session')->set('theme', $data['theme']);

        return $this->json(['status' => 'success']);
    }
}