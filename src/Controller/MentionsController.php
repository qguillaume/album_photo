<?php

// src/Controller/MentionsController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class MentionsController extends AbstractController
{
    /**
     * @Route("/mentions-legales", name="mentions_legales")
     */
    public function index()
    {
        return $this->render('mentions/index.html.twig');
    }
}