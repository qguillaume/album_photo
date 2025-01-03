<?php

// src/Controller/ContactController.php

namespace App\Controller;

use App\Form\ContactFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class ContactController extends AbstractController
{

    public function index(Request $request, MailerInterface $mailer): Response
    {
        $form = $this->createForm(ContactFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && !$form->isValid()) {
            // Si le formulaire est soumis mais invalide, nous affichons les erreurs
            $this->addFlash('error', 'Veuillez corriger les erreurs ci-dessous.');
        }

        // Variable pour vérifier si le formulaire a des erreurs
        $error = 0;

        // Vérifiez si le formulaire est soumis et valide
        if ($form->isSubmitted() && !$form->isValid()) {
            $error = 1; // Définit la variable error à 1 si des erreurs existent
        }

        if ($form->isSubmitted() && $form->isValid()) {
            $data = $form->getData();

            $email = (new Email())
                ->from($data['email']) // L'expéditeur
                ->to('admin@monsitealbumphotoxxxx.com') // L'adresse de l'utilisateur
                ->subject('[Formulaire de contact] Message reçu de : ' . $data['name'])
                ->text('Bonjour, vous avez reçu un message : ' . $data['message'])
                ->html('<p>' . $data['message'] . '</p>');

            $mailer->send($email);

            $this->addFlash('success', 'Votre message a été envoyé avec succès !');
            return $this->redirectToRoute('contact');
        }

        return $this->render('contact/index.html.twig', [
            'contactForm' => $form->createView(),
            'error' => $error,
        ]);
    }
}