<?php

namespace App\Controller;

use App\Entity\Comment;
use App\Entity\Photo;
use App\Repository\CommentRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\HttpFoundation\JsonResponse;

class CommentController extends AbstractController
{

    private $commentRepository;
    private $entityManager;

    public function __construct(CommentRepository $commentRepository, EntityManagerInterface $entityManager)
    {
        $this->commentRepository = $commentRepository;
        $this->entityManager = $entityManager;
    }

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

    /**
     * @Route("/comments_list", name="comments_list", methods={"GET"})
     */
    public function list()
    {
        // Récupérer tous les commentaires depuis la base de données
        $commentaires = $this->commentRepository->findAll();

        $commentairesData = [];
        foreach ($commentaires as $commentaire) {
            $commentairesData[] =
                [
                    'id' => $commentaire->getId(),
                    'content' => $commentaire->getContent(),
                    'user' => [
                        'username' => $commentaire->getUser()->getUsername(),
                    ],
                    'photo' => [
                        'title' => $commentaire->getPhoto()->getTitle(),
                    ],
                    'createdAt' => $commentaire->getCreatedAt()->format('Y-m-d H:i:s'),
                ];
        }

        return new JsonResponse($commentairesData);
    }

    /**
     * @Route("/comment/{id}/edit_dashboard", name="comment_edit_dashboard", methods={"PUT"})
     */
    public function editFromDashboard(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $comment = $em->getRepository(Comment::class)->find($id);

        if (!$comment) {
            return new JsonResponse(['message' => 'Commentaire non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $comment->setContent($data['content']);
        $em->flush();

        return new JsonResponse(['message' => 'Commentaire modifié avec succès']);
    }

    /**
     * @Route("/comment/{id}/delete_dashboard", name="comment_delete_dashboard", methods={"DELETE"})
     */
    public function deleteFromDashboard(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $comment = $em->getRepository(Comment::class)->find($id);

        if (!$comment) {
            return new JsonResponse(['message' => 'Commentaire non trouvé'], 404);
        }

        $em->remove($comment);
        $em->flush();

        return new JsonResponse(['message' => 'Commentaire supprimé avec succès']);
    }
}