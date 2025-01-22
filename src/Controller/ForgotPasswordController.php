<?php

// src/Controller/ForgotPasswordController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Form\ForgotPasswordFormType;
use App\Entity\PasswordResetToken;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Entity\User;
use Symfony\Component\HttpFoundation\JsonResponse;

class ForgotPasswordController extends AbstractController
{
    /**
     * @Route("/api/forgot-password", name="api_forgot_password", methods={"POST"})
     */
    public function apiForgotPassword(Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): JsonResponse
    {
        $data = json_decode($request->getContent(), true);
        $email = $data['email'] ?? null;

        if (!$email) {
            return new JsonResponse(['error' => 'Email is required'], Response::HTTP_BAD_REQUEST);
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

        if ($user) {
            $token = new PasswordResetToken($email);
            $entityManager->persist($token);
            $entityManager->flush();

            // Envoyer un email
            $resetUrl = $this->generateUrl('reset_password', ['token' => $token->getToken()], true);

            $email = (new Email())
                ->from('no-reply@gqportfolio.com')
                ->to($user->getEmail())
                ->subject('Réinitialisation de votre mot de passe')
                ->text("Cliquez sur le lien suivant pour réinitialiser votre mot de passe : $resetUrl");

            $mailer->send($email);
        }

        return new JsonResponse(['message' => 'Si un compte existe avec cette adresse, un email a été envoyé.'], Response::HTTP_OK);
    }

    /**
     * @Route("/forgot_password", name="forgot_password")
     */
    public function forgotPassword(Request $request, EntityManagerInterface $entityManager, MailerInterface $mailer): Response
    {
        $form = $this->createForm(ForgotPasswordFormType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $email = $form->get('email')->getData();
            // Vérifiez si l'email existe dans la base de données (par exemple via UserRepository)
            $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $email]);

            if ($user) {
                $token = new PasswordResetToken($email);
                $entityManager->persist($token);
                $entityManager->flush();

                // Envoyer un email
                $resetUrl = $this->generateUrl('reset_password', ['token' => $token->getToken()], true);

                $email = (new Email())
                    ->from('no-reply@gqportfolio.com')
                    ->to($user->getEmail())
                    ->subject('Réinitialisation de votre mot de passe')
                    ->text("Cliquez sur le lien suivant pour réinitialiser votre mot de passe : $resetUrl");

                $mailer->send($email);
            }

            $this->addFlash('success', 'Si un compte existe avec cette adresse, un email a été envoyé.');
            return $this->redirectToRoute('login');
        }

        return $this->render('security/forgot_password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}