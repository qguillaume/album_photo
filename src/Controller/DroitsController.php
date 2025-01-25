<?php

// src/Controller/DroitsController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class DroitsController extends AbstractController
{
    /**
     * @Route("/droits-auteur", name="droits_auteur")
     */
    public function index()
    {
        return $this->render('droits/index.html.twig');
    }
}