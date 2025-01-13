<?php

// src/Controller/ErrorController.php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;
use Symfony\Component\Routing\Annotation\Route;

class ErrorController extends AbstractController
{
    /**
     * @Route("/error", name="error_page")
     */
    public function showError()
    {
        // On vérifie si l'exception est une erreur 404 ou 403
        $exception = $this->get('request_stack')->getCurrentRequest()->get('exception');

        if ($exception instanceof NotFoundHttpException || $exception instanceof AccessDeniedHttpException) {
            // Afficher une page d'erreur générique pour 404 ou 403
            return $this->render('error/error.html.twig');
        }

        return new Response('', Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
