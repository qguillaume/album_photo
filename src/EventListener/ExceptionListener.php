<?php

namespace App\EventListener;

use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\Routing\RouterInterface;

class ExceptionListener
{
    private $router;

    public function __construct(RouterInterface $router)
    {
        $this->router = $router;
    }

    public function onKernelException(ExceptionEvent $event)
    {
        $exception = $event->getThrowable();

        if ($exception instanceof \Symfony\Component\Security\Core\Exception\AccessDeniedException) {
            $url = $this->router->generate('portfolio_home');
            $response = new RedirectResponse($url);
            $event->setResponse($response);
        }
    }
}
