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
    public function getUsers()
    {
        $users = $this->entityManager->getRepository(User::class)->findAll();
        return $this->json($users);
        // Transformation des utilisateurs en tableau associatif
        // $userData = [];
        // foreach ($users as $user) {
        //     $userData[] = [
        //         'id' => $user->getId(),
        //         'username' => $user->getUsername(),
        //         'email' => $user->getEmail(),
        //     ];
        // }

        // return new JsonResponse($userData);
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

        $data = json_decode($request->getContent(), true);

        if (isset($data['roles']) && is_array($data['roles'])) {
            $user->setRoles($data['roles']);

            $entityManager = $this->getDoctrine()->getManager();
            $entityManager->flush();

            return new JsonResponse(['message' => 'Rôles mis à jour avec succès']);
        }

        return new JsonResponse(['error' => 'Données invalides'], 400);
    }
}
