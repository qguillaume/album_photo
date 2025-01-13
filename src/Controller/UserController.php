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

class UserController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
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
}
