<?php

// src/Controller/PhotoController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\Photo;
use App\Entity\Album;
use Doctrine\ORM\EntityManagerInterface;
use App\Form\PhotoType;
use Symfony\Component\HttpFoundation\JsonResponse;

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

        // Validation du formulaire
        if ($form->isSubmitted()) {
            if ($form->isValid()) {
                // Gestion du fichier uploadé
                $file = $form->get('file')->getData();
                if ($file) {
                    $filename = uniqid() . '.' . $file->guessExtension();
                    $file->move($this->getParameter('photos_directory'), $filename);

                    // Met à jour l'entité Photo avec le chemin du fichier
                    $photo->setFilePath($filename);
                    $em->persist($photo);
                    $em->flush();

                    // Redirige vers la liste des photos après succès
                    return $this->redirectToRoute('photo_index');
                }
            } else {
                // En cas de validation échouée, afficher les erreurs sur la vue actuelle
                $this->addFlash('error', 'Une erreur est survenue lors de l\'upload de votre photo.');
            }
        }

        // Retourne la vue si le formulaire n'est pas soumis ou invalide
        return $this->render('photo/upload.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    // Renommer un album
    public function renameAlbum(Request $request, EntityManagerInterface $em, int $id): JsonResponse
    {
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            return new JsonResponse(['message' => 'Album non trouvé'], 404);
        }

        $data = json_decode($request->getContent(), true);
        $album->setNomAlbum($data['name']);
        $em->flush();

        return new JsonResponse(['message' => 'Album renommé avec succès']);
    }

    // Supprimer un album
    public function deleteAlbum(EntityManagerInterface $em, int $id): JsonResponse
    {
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            return new JsonResponse(['message' => 'Album non trouvé'], 404);
        }

        $em->remove($album);
        $em->flush();

        return new JsonResponse(['message' => 'Album supprimé avec succès']);
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

        $em->remove($photo);
        $em->flush();

        return new JsonResponse(['message' => 'Photo supprimée avec succès']);
    }
}