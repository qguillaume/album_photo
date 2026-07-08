<?php

// src/EventListener/CheckUserBanListener.php
namespace App\EventListener;

use Symfony\Component\Security\Core\Security;
use Symfony\Component\HttpKernel\Event\RequestEvent;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;

class CheckUserBanListener implements EventSubscriberInterface
{
    public function __construct(
        private Security $security,
        private RequestStack $requestStack,
    ) {
    }

    public function onKernelRequest(RequestEvent $event): void
    {
        $user = $this->security->getUser();

        // Vérifier si l'utilisateur est banni et non déjà sur la page de connexion
        if ($user && $user->getIsBanned() && $event->getRequest()->getPathInfo() !== '/login') {
            $session = $this->requestStack->getSession();

            // Invalider la session (supprime les données de session)
            $session->invalidate();

            // Détruire explicitement la session pour s'assurer qu'elle est complètement supprimée
            $session->getMetadataBag()->clear();
            session_destroy();

            // Rediriger vers la page de connexion
            $event->setResponse(new RedirectResponse('/login'));
        }
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::REQUEST => 'onKernelRequest',
        ];
    }
}