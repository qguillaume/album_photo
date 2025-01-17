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
use App\Form\PhotoFormType;
use Symfony\Component\HttpFoundation\JsonResponse;
use App\Repository\PhotoRepository;
use Symfony\Component\Routing\Annotation\Route;
use App\Entity\Comment;
use App\Form\CommentFormType;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;
use Symfony\Component\HttpKernel\KernelInterface;

class PhotoController extends AbstractController
{
    private $projectDir;

    public function __construct(KernelInterface $kernel)
    {
        $this->projectDir = $kernel->getProjectDir();
    }

    // Afficher tous les albums
    /**
     * @Route("/photos", name="photo_albums")
     */
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
    /**
     * @Route("/album/{id}", name="photos_by_album", requirements={"id"="\d+"})
     */
    public function photosByAlbum(EntityManagerInterface $em, int $id): Response
    {
        // Récupérer un album spécifique par son ID
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            throw $this->createNotFoundException('Album non trouvé');
        }

        $user = $this->getUser();

        // Vérifier si l'utilisateur est le créateur de l'album
        $isOwner = $album->getCreator() === $user;

        // Vérifier si l'album est visible et approuvé ou si l'utilisateur est le créateur
        if ((!$album->getIsVisible() || !$album->getIsApproved()) && !$isOwner) {
            throw new AccessDeniedException('Vous n\'avez pas l\'autorisation d\'accéder à cet album');
        }

        // Retourner la vue Twig avec les photos de l'album
        return $this->render('photo/photos_by_album.html.twig', [
            'album' => $album,
            'photos' => array_filter($album->getPhotos()->toArray(), function ($photo) use ($user) {
                return $photo->getIsVisible() && $photo->getIsApproved() || $photo->getAlbum()->getCreator() === $user;
            }),
            'is_owner' => $isOwner,
        ]);
    }

    /**
     * @Route("photo/upload/{albumId}", name="photo_upload", defaults={"albumId"=null})
     */
    public function upload(Request $request, EntityManagerInterface $em, $albumId = null): Response
    {
        $photo = new Photo();
        $user = $this->getUser(); // Récupérer l'utilisateur connecté

        // Si un albumId est passé en paramètre, on pré-sélectionne l'album
        if ($albumId) {
            $album = $em->getRepository(Album::class)->find($albumId);
            if ($album && $album->getCreator() === $user) {
                // Pré-sélectionner l'album dans le formulaire
                $photo->setAlbum($album);
            }
        }

        // Créer le formulaire avec l'utilisateur passé comme option
        $form = $this->createForm(PhotoFormType::class, $photo, [
            'user' => $user,
            'album_id' => $albumId, // Passer l'albumId à l'option du formulaire
        ]);

        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $file = $form->get('file')->getData();
            $album = $form->get('album')->getData(); // Récupérer l'album sélectionné à partir du formulaire

            // Si l'album a été modifié par l'utilisateur, mettre à jour l'album de la photo
            if ($album) {
                // Vérifie que l'album appartient bien à l'utilisateur
                if ($album->getCreator() !== $user) {
                    $this->addFlash('error', 'Vous ne pouvez pas ajouter une photo dans un album qui ne vous appartient pas.');
                    return $this->redirectToRoute('photo_upload');
                }
                $photo->setAlbum($album); // Mettre à jour l'album de la photo
            }

            // Si aucun album n'est sélectionné et qu'un album pré-sélectionné est disponible, le garder
            if (!$album && $photo->getAlbum()) {
                $album = $photo->getAlbum(); // Récupère l'album pré-sélectionné si rien n'est choisi
            }

            // Gérer le fichier téléchargé
            if ($file) {
                $userDir = $this->getParameter('photos_directory') . '/' . $user->getId();
                $albumName = $album->getNomAlbum();
                $albumDir = $userDir . '/' . $albumName;
                $coverDir = $albumDir . '/cover_photo';

                // Créer les répertoires si nécessaires
                if (!file_exists($userDir)) {
                    mkdir($userDir, 0777, true);
                }
                if (!file_exists($albumDir)) {
                    mkdir($albumDir, 0777, true);
                }
                if (!file_exists($coverDir)) {
                    mkdir($coverDir, 0777, true);
                }

                // Générer un nom unique pour l'image et déplacer le fichier
                $filename = uniqid() . '.' . $file->guessExtension();
                $file->move($albumDir, $filename);

                $photo->setFilePath($filename);

                // Vérifier si l'album appartient à l'utilisateur
                if ($album->getCreator() !== $user) {
                    $this->addFlash('error', 'Vous ne pouvez pas ajouter une photo dans un album qui ne vous appartient pas.');
                    return $this->redirectToRoute('photo_upload');
                }

                $album->addPhoto($photo);
                $album->setPhotoCount($album->getPhotoCount() + 1); // Mettre à jour le compteur de photos

                $em->persist($photo);
                $em->persist($album);
                $em->flush();

                return $this->redirectToRoute('photo_albums');
            }
        }

        return $this->render('photo/upload.html.twig', [
            'form' => $form->createView(),
        ]);
    }


    /**
     * @Route("/photo/rename/{id}", name="rename_photo", requirements={"id"="\d+"})
     */
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

    /**
     * @Route("/photo/delete/{id}", name="delete_photo", requirements={"id"="\d+"})
     */
    public function deletePhoto(KernelInterface $kernel, EntityManagerInterface $em, int $id): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        // Récupérer l'album associé à la photo
        $album = $photo->getAlbum(); // Suppose qu'il y a une relation bidirectionnelle entre Photo et Album

        $uploadDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $photo->getAlbum()->getCreator()->getId() . '/' . $photo->getAlbum()->getNomAlbum() . '/';
        $photoPath = $uploadDir . $photo->getFilePath();

        // Vérifier si le fichier existe avant de le supprimer
        if (file_exists($photoPath)) {
            unlink($photoPath); // Supprimer le fichier
        } else {
            error_log("Le fichier n'existe pas à ce chemin : " . $photoPath);
        }

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
        // Récupérer l'utilisateur connecté
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Utilisateur non connecté'], 401);
        }

        // Récupérer toutes les photos
        $photos = $photoRepository->findAll();

        // Convertir les photos en un tableau JSON
        $photosData = [];
        foreach ($photos as $photo) {
            // Vérifier si l'utilisateur est le propriétaire de la photo
            $isOwner = $photo->getAlbum() && $photo->getAlbum()->getCreator() === $user;

            // Vérifier si la photo est visible et approuvée
            if (!$photo->getIsVisible() || !$photo->getIsApproved()) {
                if (!$isOwner) {
                    continue;  // Si l'utilisateur n'est pas le propriétaire, on passe à la suivante
                }
            }

            $photosData[] = [
                'id' => $photo->getId(),
                'title' => $photo->getTitle(),
                'filePath' => $photo->getFilePath(),
                'album' => $photo->getAlbum() ? $photo->getAlbum()->getNomAlbum() : 'Sans album',
                'likesCount' => $photo->getLikesCount(),
                'commentsCount' => $photo->getCommentsCount(),
                'isVisible' => $photo->getIsVisible(),
                'isApproved' => $photo->getIsApproved(),
                'isOwner' => $isOwner,  // Ajouter la vérification du propriétaire
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

        // Vérifier si la photo est visible, approuvée ou appartient à l'utilisateur
        $isOwner = $photo->getAlbum() && $photo->getAlbum()->getCreator() === $this->getUser();
        if (!$photo->getIsVisible() || !$photo->getIsApproved()) {
            if (!$isOwner) {
                throw new AccessDeniedException('Vous n\'avez pas l\'autorisation d\'accéder à cette photo');
            }
        }



        // Récupérer les commentaires associés à la photo
        $comments = $em->getRepository(Comment::class)->findBy(['photo' => $photo]);

        // Créer un nouvel objet Comment lié à la photo
        $comment = new Comment();
        $comment->setPhoto($photo);

        // Créer le formulaire pour ajouter un commentaire
        $form = $this->createForm(CommentFormType::class, $comment);

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

    /**
     * @Route("/photo/{id}/visibility", name="photo_visibility", methods={"POST"})
     */
    public function updateVisibility(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        // Récupérer la nouvelle visibilité à partir de la requête
        $data = json_decode($request->getContent(), true);
        if (!isset($data['isVisible'])) {
            return new JsonResponse(['message' => 'Aucune visibilité spécifiée'], 400);
        }

        // Mettre à jour la visibilité de la photo
        $photo->setIsVisible($data['isVisible']);
        $em->flush();

        return new JsonResponse(['message' => 'Visibilité mise à jour avec succès']);
    }

    /**
     * @Route("/photo/{id}/approval", name="photo_approval", methods={"POST"})
     */
    public function updateApproval(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        // Récupérer la nouvelle approbation à partir de la requête
        $data = json_decode($request->getContent(), true);
        if (!isset($data['isApproved'])) {
            return new JsonResponse(['message' => 'Aucune Approbation spécifiée'], 400);
        }

        // Mettre à jour l'approbation de la photo
        $photo->setIsApproved($data['isApproved']);
        $em->flush();

        return new JsonResponse(['message' => 'Approbation mise à jour avec succès']);
    }
}
