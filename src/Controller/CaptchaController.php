<?php

// src/Controller/CaptchaController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Routing\Annotation\Route;
use App\Service\CaptchaGenerator;

class CaptchaController extends AbstractController
{
    #[Route('/captcha/generate', name: 'captcha_generate')]
    public function generateCaptcha(RequestStack $requestStack, CaptchaGenerator $captchaGenerator)
    {
        $captchaText = $captchaGenerator->generateCaptchaText();
        $requestStack->getSession()->set('captcha', $captchaText);

        // Retourner une réponse JSON ou une image, selon votre implémentation
        return $this->json(['captcha' => $captchaText]);
    }

    #[Route('/captcha/image', name: 'captcha_image')]
    public function captchaImage(RequestStack $requestStack, CaptchaGenerator $captchaGenerator): Response
    {
        $captchaText = $requestStack->getSession()->get('captcha', '');

        if (empty($captchaText)) {
            throw $this->createNotFoundException('Captcha non trouvé.');
        }

        $imageData = $captchaGenerator->generateCaptchaImage($captchaText);

        return new Response($imageData, 200, ['Content-Type' => 'image/png']);
    }
}