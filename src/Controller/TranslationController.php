<?php

// src/Controller/TranslationController.php
namespace App\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

class TranslationController
{
    private $translator;

    // Injection du service TranslatorInterface dans le contrôleur
    public function __construct(TranslatorInterface $translator)
    {
        $this->translator = $translator;
    }

    /**
     * @Route("/translations/{locale}", name="translations", methods={"GET"})
     */
    public function getTranslations(string $locale)
    {
        // On peut gérer les traductions ici
        $translations = [
            'contact_me' => $this->translator->trans('contact_me', [], 'messages', $locale),
        ];

        return new JsonResponse($translations);
    }
}

