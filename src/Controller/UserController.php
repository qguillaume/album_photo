<?php

// src/Controller/UserController.php
namespace App\Controller;

use App\Entity\User;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Response;
use Psr\Log\LoggerInterface;

class UserController extends AbstractController
{
    private $entityManager;
    private LoggerInterface $logger;

    public function __construct(EntityManagerInterface $entityManager, LoggerInterface $logger)
    {
        $this->entityManager = $entityManager;
        $this->logger = $logger;
    }

    /**
     * @Route("/api/user", name="api_user", methods={"GET"})
     */
    public function getUserInfo(): JsonResponse
    {
        $user = $this->getUser();

        if (!$user) {
            $this->logger->error('Aucun utilisateur authentifié trouvé.');
            return new JsonResponse(['error' => 'Utilisateur non authentifié'], Response::HTTP_UNAUTHORIZED);
        }

        // Log des informations utilisateur
        $this->logger->info('Utilisateur authentifié :', [
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles()
        ]);

        return new JsonResponse([
            'id' => $user->getId(),
            'username' => $user->getUsername(),
            'roles' => $user->getRoles(),
        ]);
    }

    /**
     * @Route("/users_list", name="users_list", methods={"GET"})
     */
    public function getUsers(UserRepository $userRepository)
    {
        // Récupérer toutes les users
        $users = $userRepository->findAll();

        // Convertir les users en un tableau JSON
        $usersData = [];
        foreach ($users as $user) {
            $usersData[] = [
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
                'isBanned' => $user->getIsBanned(),
            ];
        }

        // Retourner une réponse JSON
        return new JsonResponse($usersData);
    }

    /**
     * @Route("/api/users/{id}", name="update_user_roles", methods={"PUT"})
     */
    public function updateUserRoles(int $id, Request $request, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Vérification de l'état "banni"
        if ($user->getIsBanned()) {
            return new JsonResponse(['error' => 'Utilisateur banni et ne peut pas effectuer cette action.'], 403);
        }

        $data = json_decode($request->getContent(), true);

        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->setRoles($data['roles']);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->flush();

            return new JsonResponse(['message' => 'Rôles mis à jour avec succès']);
        }

        return new JsonResponse(['error' => 'Données invalides'], 400);
    }

    /**
     * @Route("/api/users/{id}/ban", name="ban_user", methods={"PUT"})
     */
    public function banUser(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Mettre à jour l'état "banni"
        $user->setIsBanned(true);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur banni avec succès']);
    }

    /**
     * @Route("/api/users/{id}/unban", name="unban_user", methods={"PUT"})
     */
    public function unbanUser(int $id, UserRepository $userRepository): JsonResponse
    {
        $user = $userRepository->find($id);

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non trouvé'], 404);
        }

        // Mettre à jour l'état "banni" à false (débanir)
        $user->setIsBanned(false);
        $this->entityManager->flush();

        return new JsonResponse(['message' => 'Utilisateur débanni avec succès']);
    }

    /**
     * @Route("/api/current_user", name="current_user", methods={"GET"})
     */
    public function getCurrentUser(): JsonResponse
    {
        try {
            $user = $this->getUser();

            if (!$user) {
                throw new \Exception('Utilisateur non authentifié');
            }

            return new JsonResponse([
                'id' => $user->getId(),
                'username' => $user->getUsername(),
                'email' => $user->getEmail(),
                'roles' => $user->getRoles(),
            ]);
        } catch (\Exception $e) {
            $this->get('logger')->error('Erreur lors de la récupération de l\'utilisateur: ' . $e->getMessage());
            return new JsonResponse(['error' => 'Erreur serveur'], 500);
        }
    }

}
