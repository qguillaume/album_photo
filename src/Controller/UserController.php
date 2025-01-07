<?php

// src/Controller/UserController.php
namespace App\Controller;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;

class UserController extends AbstractController
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * @Route("/api/users", name="api_users", methods={"GET"})
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
}
