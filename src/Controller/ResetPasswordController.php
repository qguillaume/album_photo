<?php

namespace App\Controller;

use App\Entity\PasswordResetToken;
use App\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\SubmitType;
use Symfony\Component\Security\Core\Security;

class ResetPasswordController extends AbstractController
{
    /**
     * @Route("/api/reset-password/{token}", name="api_reset_password", methods={"POST"})
     */
    public function apiResetPassword(
        string $token,
        Request $request,
        EntityManagerInterface $entityManager,
        UserPasswordHasherInterface $passwordHasher
    ): JsonResponse {
        // Vérifier si le token est valide
        $tokenEntity = $entityManager->getRepository(PasswordResetToken::class)->findOneBy(['token' => $token]);

        if (!$tokenEntity || $tokenEntity->isExpired()) {
            return new JsonResponse(['error' => 'Le lien de réinitialisation est invalide ou a expiré.'], 400);
        }

        // Trouver l'utilisateur lié au token
        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $tokenEntity->getEmail()]);
        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur introuvable.'], 404);
        }

        // Récupérer le mot de passe depuis le corps de la requête JSON
        $data = json_decode($request->getContent(), true);
        $newPassword = $data['password'] ?? '';

        if (empty($newPassword)) {
            return new JsonResponse(['error' => 'Le mot de passe ne peut pas être vide.'], 400);
        }

        // Hacher le mot de passe
        $hashedPassword = $passwordHasher->hashPassword($user, $newPassword);
        $user->setPassword($hashedPassword);

        // Sauvegarder l'utilisateur avec le nouveau mot de passe
        $entityManager->flush();

        // Supprimer le token de réinitialisation après utilisation
        $entityManager->remove($tokenEntity);
        $entityManager->flush();

        return new JsonResponse(['message' => 'Votre mot de passe a été réinitialisé avec succès.'], 200);
    }

    /**
     * @Route("/reset-password/{token}", name="reset_password")
     */
    public function resetPassword(string $token, Request $request, EntityManagerInterface $entityManager, UserPasswordHasherInterface $passwordHasher, Security $security): Response
    {
        // Vérifier si l'utilisateur est déjà connecté
        if ($security->getUser()) {
            // Rediriger vers la page d'accueil
            return $this->redirectToRoute('portfolio_home');
        }
        // Vérification du token
        $tokenEntity = $entityManager->getRepository(PasswordResetToken::class)->findOneBy(['token' => $token]);

        if (!$tokenEntity || $tokenEntity->isExpired()) {
            throw $this->createNotFoundException('Le lien de réinitialisation est invalide ou a expiré.');
        }

        $user = $entityManager->getRepository(User::class)->findOneBy(['email' => $tokenEntity->getEmail()]);
        if (!$user) {
            throw $this->createNotFoundException('Utilisateur introuvable.');
        }

        // Création du formulaire
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
            // Hacher le nouveau mot de passe
            $user->setPassword($passwordHasher->hashPassword($user, $form->get('password')->getData()));
            $entityManager->flush();

            $this->addFlash('success', 'Votre mot de passe a été réinitialisé.');

            // Rediriger vers la page de connexion
            return $this->redirectToRoute('login');
        }

        return $this->render('security/reset_password.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}
