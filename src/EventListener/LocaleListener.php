<?php

namespace App\EventListener;

use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Contracts\Translation\TranslatorInterface;

class LocaleListener
{
    public function __construct(
        private TranslatorInterface $translator,
        private string $defaultLocale = 'fr',
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
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
