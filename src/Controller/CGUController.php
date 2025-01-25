<?php

// src/Controller/CGUController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class CGUController extends AbstractController
{
    /**
     * @Route("/cgu", name="cgu")
     */
    public function index()
    {
        return $this->render('cgu/index.html.twig');
    }
}