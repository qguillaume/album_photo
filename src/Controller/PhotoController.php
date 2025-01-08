<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use App\Entity\Photo;
use App\Entity\Album;
use App\Entity\Like;
use Doctrine\ORM\EntityManagerInterface;
use App\Form\PhotoType;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\PhotoRepository;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Comment;
use App\Form\CommentType;

class PhotoController extends AbstractController
{
    // Afficher tous les albums
    public function albums(EntityManagerInterface $em): Response
    {
        // Récupérer tous les albums
        $albums = $em->getRepository(Album::class)->findAll();

        // Retourner la vue Twig avec les albums
        return $this->render('photo/albums.html.twig', [
            'albums' => $albums,
        ]);
    }

    // Afficher les photos d'un album
    public function photosByAlbum(EntityManagerInterface $em, int $id): Response
    {
        // Récupérer un album spécifique par son ID
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            throw $this->createNotFoundException('Album non trouvé');
        }

        // Retourner la vue Twig avec les photos de l'album
        return $this->render('photo/photos_by_album.html.twig', [
            'album' => $album,
            'photos' => $album->getPhotos(),
        ]);
    }

    // Méthode pour afficher toutes les photos
    public function index(EntityManagerInterface $em): Response
    {
        // Récupérer toutes les photos de la base de données
        $photos = $em->getRepository(Photo::class)->findAll();

        // Retourner la réponse avec la vue Twig
        return $this->render('photo/index.html.twig', [
            'photos' => $photos,
        ]);
    }

    public function upload(Request $request, EntityManagerInterface $em): Response
    {
        $photo = new Photo();
        $form = $this->createForm(PhotoType::class, $photo);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $file = $form->get('file')->getData();
            if ($file) {
                $filename = uniqid() . '.' . $file->guessExtension();
                $file->move($this->getParameter('photos_directory'), $filename);

                $photo->setFilePath($filename);

                // Récupérer l'album sélectionné dans le formulaire
                $album = $photo->getAlbum();

                if ($album) {
                    // Associer la photo à l'album
                    $album->addPhoto($photo);

                    // Mettre à jour le compteur de photos
                    $album->setPhotoCount($album->getPhotoCount() + 1);
                }

                $em->persist($photo);
                $em->flush();

                return $this->redirectToRoute('photo_albums');
            }
        } else {
            $this->addFlash('error', 'Une erreur est survenue lors de l\'upload de votre photo.');
        }

        return $this->render('photo/upload.html.twig', [
            'form' => $form->createView(),
        ]);
    }


    // Renommer une photo
    public function renamePhoto(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $photo->setTitle($data['name']);
        $em->flush();

        return new JsonResponse(['message' => 'Photo renommée avec succès']);
    }

    // Supprimer une photo
    public function deletePhoto(EntityManagerInterface $em, int $id): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        // Récupérer l'album associé à la photo
        $album = $photo->getAlbum(); // Suppose qu'il y a une relation bidirectionnelle entre Photo et Album
        $em->remove($photo);
        $em->flush();

        // Mettre à jour le compteur photoCount si l'album existe
        if ($album) {
            $album->setPhotoCount(count($album->getPhotos())); // Compte les photos restantes
            $em->flush();
        }

        return new JsonResponse(['message' => 'Photo supprimée avec succès']);
    }


    // Route pour gérer les likes
    public function like(Photo $photo, EntityManagerInterface $entityManager): JsonResponse
    {
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté pour liker une photo.'], 400);
        }

        $existingLike = $entityManager->getRepository(Like::class)->findOneBy([
            'user' => $user,
            'photo' => $photo,
        ]);

        if ($existingLike) {
            return new JsonResponse(['error' => 'Vous avez déjà liké cette photo.'], 400);
        }

        $like = new Like();
        $like->setUser($user);
        $like->setPhoto($photo);
        $like->setCreatedAt(new \DateTime());

        $entityManager->persist($like);
        $entityManager->flush();

        return new JsonResponse(['likes' => $photo->getLikesCount()]);
    }

    /**
     * @Route("/photos_list", name="photos_list", methods={"GET"})
     */
    public function listPhotos(PhotoRepository $photoRepository): JsonResponse
    {
        // Récupérer toutes les photos
        $photos = $photoRepository->findAll();

        // Convertir les photos en un tableau JSON
        $photosData = [];
        foreach ($photos as $photo) {
            $photosData[] = [
                'id' => $photo->getId(),
                'title' => $photo->getTitle(),
                'filePath' => $photo->getFilePath(),
                'album' => $photo->getAlbum() ? $photo->getAlbum()->getNomAlbum() : 'Sans album',
                'likesCount' => $photo->getLikesCount(),
                'commentsCount' => $photo->getCommentsCount(),
            ];
        }

        // Retourner une réponse JSON
        return new JsonResponse($photosData);
    }

    /**
     * @Route("/photo/{id}", name="photo_show", requirements={"id"="\d+"}, methods={"GET", "POST"})
     */
    public function show(int $id, Request $request, EntityManagerInterface $em): Response
    {
        // Récupérer la photo par son ID
        $photo = $em->getRepository(Photo::class)->find($id);

        // Si la photo n'existe pas, renvoyer une erreur 404
        if (!$photo) {
            throw $this->createNotFoundException('Photo non trouvée');
        }

        // Récupérer les commentaires associés à la photo
        $comments = $em->getRepository(Comment::class)->findBy(['photo' => $photo]);

        // Créer un nouvel objet Comment lié à la photo
        $comment = new Comment();
        $comment->setPhoto($photo);

        // Créer le formulaire pour ajouter un commentaire
        $form = $this->createForm(CommentType::class, $comment);

        // Gérer la soumission du formulaire
        $form->handleRequest($request);
        if ($form->isSubmitted() && $form->isValid()) {
            // Associer l'utilisateur connecté au commentaire
            $comment->setUser($this->getUser());

            // Sauvegarder le commentaire dans la base de données
            $em->persist($comment);
            $em->flush();

            // Rediriger pour éviter la resoumission du formulaire
            return $this->redirectToRoute('photo_show', ['id' => $photo->getId()]);
        }

        // Renvoyer la vue Twig avec les détails de la photo, ses commentaires et le formulaire
        return $this->render('photo/show.html.twig', [
            'photo' => $photo,
            'comments' => $comments,
            'commentForm' => $form->createView(),
        ]);
    }


    /**
     * @Route("/photo/{id}/comment", name="comment_add", methods={"POST"})
     */
    public function addComment(Request $request, int $id, EntityManagerInterface $em): RedirectResponse
    {
        // Récupérer l'utilisateur connecté
        $user = $this->getUser();
        if (!$user) {
            throw $this->createAccessDeniedException('Vous devez être connecté pour commenter.');
        }

        // Récupérer la photo
        $photo = $em->getRepository(Photo::class)->find($id);
        if (!$photo) {
            throw $this->createNotFoundException('Photo non trouvée.');
        }

        // Récupérer le contenu du commentaire depuis la requête POST
        $content = $request->request->get('content');
        if (empty($content)) {
            $this->addFlash('error', 'Le contenu du commentaire ne peut pas être vide.');
            return $this->redirectToRoute('photo_show', ['id' => $id]);
        }

        // Créer et persister un nouveau commentaire
        $comment = new Comment();
        $comment->setContent($content);
        $comment->setPhoto($photo);
        $comment->setUser($user);
        $comment->setCreatedAt(new \DateTime());

        $em->persist($comment);
        $em->flush();

        // Rediriger vers la page de la photo
        return $this->redirectToRoute('photo_show', ['id' => $id]);
    }
}
