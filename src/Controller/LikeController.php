<?php

namespace App\Controller;

use App\Entity\Like;
use App\Entity\Photo;
use App\Repository\LikeRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\Request;

class LikeController extends AbstractController
{
    /**
     * @Route("/photo/{id}/like", name="photo_like", methods={"POST"})
     */
    public function like(Photo $photo, EntityManagerInterface $entityManager, Request $request): JsonResponse
    {
        // Vérifier si l'utilisateur est connecté
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté pour liker une photo.'], 400);
        }

        // Vérifier si l'utilisateur a déjà liké la photo
        $existingLike = $entityManager->getRepository(Like::class)->findOneBy([
            'user' => $user,
            'photo' => $photo,
        ]);

        if ($existingLike) {
            return new JsonResponse(['error' => 'Vous avez déjà liké cette photo.'], 400);
        }

        // Créer et persister un nouveau like
        $like = new Like();
        $like->setUser($user);
        $like->setPhoto($photo);
        $like->setCreatedAt(new \DateTime());

        $entityManager->persist($like);
        $entityManager->flush();

        // Recalculer les likes de la photo après l'ajout
        $updatedLikesCount = count($photo->getLikes()); // On utilise getLikes() si relation bidirectionnelle

        // Retourner le nouveau nombre de likes
        return new JsonResponse(['likes' => $updatedLikesCount]);
    }
}
