<?php
namespace App\Controller;

use App\Form\ContactFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Routing\Annotation\Route;

class ContactController extends AbstractController
{
    /**
     * @Route("/contact", name="contact")
     */
    public function index(Request $request, MailerInterface $mailer, TranslatorInterface $translator): Response
    {
        $form = $this->createForm(ContactFormType::class);
        $form->handleRequest($request);

        // if ($form->isSubmitted() && !$form->isValid()) {
        //     // Traduction du message d'erreur dans addFlash
        //     $this->addFlash('error', $translator->trans('Veuillez corriger les erreurs ci-dessous.'));
        // }

        // Variable pour vérifier si le formulaire a des erreurs
        $error = 0;

        if ($form->isSubmitted() && !$form->isValid()) {
            $error = 1;
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();

            $email = (new Email())
                ->from($data['email'])
                ->to('quesnel.guillaume.j@gmail.com')
                ->subject('[Formulaire de contact] Message reçu de : ' . $data['name'])
                ->text('Bonjour, vous avez reçu un message : ' . $data['message'])
                ->html('<p>' . $data['message'] . '</p>');

            $mailer->send($email);
            // Traduction du message de succès dans addFlash
            $this->addFlash('success', $translator->trans('message_success'));
            return $this->redirectToRoute('contact');
        }

        return $this->render('contact/index.html.twig', [
            'contactForm' => $form->createView(),
            'error' => $error,
        ]);
    }
}