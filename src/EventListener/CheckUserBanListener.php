<?php

// src/EventListener/CheckUserBanListener.php
namespace App\EventListener;

use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\Session\SessionInterface;

class CheckUserBanListener implements EventSubscriberInterface
{
    private $security;
    private $session;

    public function __construct(Security $security, SessionInterface $session)
    {
        $this->security = $security;
        $this->session = $session;
    }

    public function onKernelRequest(RequestEvent $event)
    {
        $user = $this->security->getUser();

        // Vérifier si l'utilisateur est banni et non déjà sur la page de connexion
        if ($user && $user->getIsBanned() && $event->getRequest()->getPathInfo() !== '/login') {
            // Invalider la session (supprime les données de session)
            $this->session->invalidate();

            // Détruire explicitement la session pour s'assurer qu'elle est complètement supprimée
            $this->session->getMetadataBag()->clear();
            session_destroy();

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