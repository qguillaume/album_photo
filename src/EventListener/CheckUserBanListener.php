<?php

// src/EventListener/CheckUserBanListener.php
namespace App\EventListener;

use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;

class CheckUserBanListener implements EventSubscriberInterface
{
    private $security;

    public function __construct(Security $security)
    {
        $this->security = $security;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $user = $this->security->getUser();

        // Vérifier si l'utilisateur est banni et non déjà sur la page de connexion
        if ($user && $user->getIsBanned() && $event->getRequest()->getPathInfo() !== '/login') {
            // Déconnecter l'utilisateur
            $event->getRequest()->getSession()->invalidate();
            // Rediriger vers la page de connexion
            $event->setResponse(new RedirectResponse('/login'));
        }
    }

    public static function getSubscribedEvents()
    {
        return [
            KernelEvents::REQUEST => 'onKernelRequest',
        ];
    }
}

