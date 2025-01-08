<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Photo;
use App\Form\CommentType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class CommentController extends AbstractController
{
    /**
     * @Route("/photo/{id}/comment", name="comment_add", methods={"POST"})
     */
    public function addComment(Request $request, Photo $photo, EntityManagerInterface $em): Response
    {
        // Récupérer le contenu du commentaire depuis la requête
        $content = $request->request->get('content');

        if (!$content) {
            return $this->json(['error' => 'Le contenu du commentaire ne peut pas être vide.'], 400);
        }

        // Créer un nouveau commentaire
        $comment = new Comment();
        $comment->setContent($content);
        $comment->setPhoto($photo);

        // Sauvegarder dans la base de données
        $em->persist($comment);
        $em->flush();

        // Retourner une réponse JSON
        return $this->json([
            'message' => 'Commentaire ajouté avec succès.',
            'comment' => [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'createdAt' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            ],
        ]);
    }

}
