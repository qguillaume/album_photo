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
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;

class ForgotPasswordController extends AbstractController
{
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
                    ->from('no-reply@monalbumphotoxxx.com')
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

    /**
     * @Route("/reset_password/{token}'", name="reset_password")
     */
    public function resetPassword(string $token, Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher): Response
    {
        $tokenEntity = $entityManager->getRepository(PasswordResetToken::class)->findOneBy(['token' => $token]);

        if (!$tokenEntity || $tokenEntity->isExpired()) {
            throw $this->createNotFoundException('Le lien de réinitialisation est invalide ou a expiré.');
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $tokenEntity->getEmail()]);
        if (!$user) {
            throw $this->createNotFoundException('Utilisateur introuvable.');
        }

        $form = $this->createFormBuilder()
            ->add('password', PasswordType::class, [
                'label' => false,
                'attr' => ['placeholder' => 'Nouveau mot de passe']
            ])
            ->add('reinit', SubmitType::class, [
                'label' => 'Réinitialiser',
            ])
            ->getForm();

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword($passwordHasher->hashPassword($user, $form->get('password')->getData()));
            $entityManager->flush();

            $this->addFlash('success', 'Votre mot de passe a été réinitialisé.');
            return $this->redirectToRoute('login');
        }

        return $this->render('security/reset_password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}