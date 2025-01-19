<?php

namespace App\Controller;

use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends AbstractController
{
    /**
     * @Route("/contact", name="contact", methods={"GET"})
     */
    public function index(): Response
    {
        // Afficher le formulaire en utilisant Twig
        return $this->render('contact/index.html.twig');
    }

    /**
     * @Route("/api/contact", name="api_contact", methods={"POST"})
     */
    public function contact(Request $request, MailerInterface $mailer, TranslatorInterface $translator): JsonResponse
    {
        // Récupérer les données envoyées en JSON
        $data = json_decode($request->getContent(), true);

        // Vérifier si les données sont valides
        if (!$data || !isset($data['name'], $data['email'], $data['message'])) {
            return new JsonResponse(
                ['message' => $translator->trans('form.incomplete_data')],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Validation des données
        if (empty($data['name']) || empty($data['email']) || empty($data['message'])) {
            return new JsonResponse(
                ['message' => $translator->trans('form.all_fields_required')],
                JsonResponse::HTTP_BAD_REQUEST
            );
        }

        // Créer l'email à envoyer
        $email = (new Email())
            ->from($data['email'])
            ->to('quesnel.guillaume.j@gmail.com') // Destinataire
            ->subject('[Formulaire de contact] Message reçu de : ' . $data['name'])
            ->text('Bonjour, vous avez reçu un message : ' . $data['message'])
            ->html('<p>' . $data['message'] . '</p>');

        // Envoi de l'email
        try {
            $mailer->send($email);
            return new JsonResponse(['message' => $translator->trans('form.success_message')], JsonResponse::HTTP_OK);
        } catch (\Exception $e) {
            return new JsonResponse(
                ['message' => $translator->trans('form.error_message')],
                JsonResponse::HTTP_INTERNAL_SERVER_ERROR
            );
        }
    }
}