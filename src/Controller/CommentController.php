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
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;


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
    public function addComment(Request $request, Photo $photo, EntityManagerInterface $em, MailerInterface $mailer): JsonResponse
    {
        // Décoder le JSON dans le corps de la requête
        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? null;

        if (!$content) {
            return $this->json(['error' => 'Le contenu du commentaire ne peut pas être vide.'], 400);
        }

        // Créer un nouveau commentaire
        $comment = new Comment();
        $comment->setContent($content);
        $comment->setPhoto($photo);
        $comment->setUser($this->getUser());

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

    /**
     * @Route("/photo/{id}/comments", name="photo_comments", methods={"GET"})
     */
    public function getCommentsForPhoto(Photo $photo)
    {
        // Récupérer tous les commentaires associés à cette photo
        $comments = $this->commentRepository->findBy(['photo' => $photo]);

        $commentsData = [];
        foreach ($comments as $comment) {
            $commentsData[] = [
                'id' => $comment->getId(),
                'content' => $comment->getContent(),
                'user' => [
                    'username' => $comment->getUser()->getUsername(),
                ],
                'photo' => [
                    'title' => $comment->getPhoto()->getTitle(),
                ],
                'createdAt' => $comment->getCreatedAt()->format('Y-m-d H:i:s'),
            ];
        }

        return new JsonResponse($commentsData);
    }
}