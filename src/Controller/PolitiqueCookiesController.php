<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class PolitiqueCookiesController extends AbstractController
{
    /**
     * @Route("/politique-de-cookies", name="politique_cookies")
     */
    public function index()
    {
        return $this->render('politiquecookies/index.html.twig');
    }
}
