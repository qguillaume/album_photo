<?php

// src/Controller/HelloWorldController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;

class HelloWorldController extends AbstractController
{
    public function index(): Response
    {
        return new Response('<html><body><h1>Hello, World!</h1></body></html>');
    }
}