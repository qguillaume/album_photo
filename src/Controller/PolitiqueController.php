<?php

// src/Controller/PolitiqueController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class PolitiqueController extends AbstractController
{
    /**
     * @Route("/politique-confidentialite", name="politique_confidentialite")
     */
    public function index()
    {
        return $this->render('politique/index.html.twig');
    }
}