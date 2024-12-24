<?php

// src/Controller/RegistrationController.php

namespace App\Controller;

use App\Entity\User;
use App\Form\RegistrationFormType;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;

class RegistrationController extends AbstractController
{

    public function register(Request $request, UserPasswordHasherInterface $passwordHasher, MailerInterface $mailer): Response
    {
        /*if ($this->getUser()) {
            return $this->redirectToRoute('portfolio_home');
        }*/

        $user = new User();

        $form = $this->createForm(RegistrationFormType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword(
                $passwordHasher->hashPassword($user, $form->get('password')->getData())
            );

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->persist($user);
            $entityManager->flush();

            // Envoi de l'email de confirmation
            $email = (new Email())
                ->from('noreply@monsitealbumphoto.com') // L'expéditeur
                ->to($user->getEmail()) // L'adresse de l'utilisateur
                ->subject('Merci pour votre inscription !')
                ->text('Bonjour ' . $user->getUsername() . ', merci pour votre inscription sur notre site.')
                ->html('<p>Bonjour ' . $user->getUsername() . ',</p><p>Merci pour votre inscription sur notre site.</p>');

            $mailer->send($email);

            return $this->redirectToRoute('login');
        }

        return $this->render('registration/register.html.twig', [
            'registrationForm' => $form->createView(),
        ]);
    }
}