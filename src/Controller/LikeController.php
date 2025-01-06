<?php

namespace App\Controller;

use App\Entity\Like;
use App\Entity\Photo;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\PhotoRepository;
use Doctrine\ORM\EntityManagerInterface;

class LikeController extends AbstractController
{
    /**
     * @Route("/photo/{id}/like", name="photo_like", methods={"POST"})
     */
    public function like(int $id, PhotoRepository $photoRepository, EntityManagerInterface $entityManager): JsonResponse
    {
        $photo = $photoRepository->find($id);

        if (!$photo) {
            return new JsonResponse(['error' => 'Photo non trouvée.'], 404);
        }
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

        // Utiliser la méthode getLikesCount() pour obtenir le nombre de likes
        $updatedLikesCount = $photo->getLikesCount();

        // Retourner le nouveau nombre de likes
        return new JsonResponse(['likes' => $updatedLikesCount]);
    }
}
