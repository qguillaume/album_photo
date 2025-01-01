<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Contracts\Translation\TranslatorInterface;

class LocaleListener
{
    private $defaultLocale;
    private $translator;

    public function __construct(string $defaultLocale = 'fr', TranslatorInterface $translator)
    {
        $this->defaultLocale = $defaultLocale;
        $this->translator = $translator;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $request = $event->getRequest();

        // Récupérer la locale de la session ou utiliser la locale par défaut
        $locale = $request->getSession()->get('_locale', $this->defaultLocale);

        // Appliquer la locale à la requête
        $request->setLocale($locale);

        // Appliquer la locale au traducteur
        $this->translator->setLocale($locale);
    }
}
