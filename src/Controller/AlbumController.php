<?php

// src/Controller/AlbumController.php
namespace App\Controller;

use App\Entity\Album;
use App\Entity\Photo;
use App\Form\AlbumFormType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use App\Repository\AlbumRepository;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Security\Core\Security;

class AlbumController extends AbstractController
{
    private $albumRepository;
    private $security;

    // Ajout du service de sécurité pour récupérer l'utilisateur connecté
    public function __construct(AlbumRepository $albumRepository, Security $security)
    {
        $this->albumRepository = $albumRepository;
        $this->security = $security;
    }

    /*
     * @IsGranted({"ROLE_ADMIN"})
     */
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $album = new Album();
        $form = $this->createForm(AlbumFormType::class, $album);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Récupérer l'image téléchargée si elle existe
            /** @var UploadedFile $imageFile */
            $imageFile = $form->get('image_path')->getData();

            if ($imageFile) {
                try {
                    // Générer un nom unique pour l'image et déplacer le fichier
                    $newFilename = uniqid() . '.' . $imageFile->guessExtension();
                    $imageFile->move(
                        $this->getParameter('albums_directory'), // Définir le répertoire de destination
                        $newFilename
                    );

                    // Définir le chemin de l'image dans l'entité Album
                    $album->setImagePath($newFilename);
                } catch (\Exception $e) {
                    if ($this->getParameter('kernel.environment') === 'dev') {
                        // Afficher l'erreur détaillée en mode développement
                        $this->addFlash('error', 'Erreur lors du téléchargement de l\'image : ' . $e->getMessage());
                    } else {
                        // Afficher un message générique en mode production
                        $this->addFlash('error', 'Une erreur est survenue lors du téléchargement de l\'image.');
                    }

                    return $this->redirectToRoute('album_new');
                }
            } else {
                // Utiliser l'image par défaut si aucune image n'est fournie
                $album->setImagePath(NULL);
            }

            // Associer l'album à l'utilisateur connecté
            $user = $this->security->getUser();
            if ($user) {
                $album->setCreator($user); // Lier l'album à l'utilisateur
            }

            // Persister l'album dans la base de données
            $em->persist($album);
            $em->flush();

            return $this->redirectToRoute('photo_albums');
        }

        return $this->render('album/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    /**
     * @Route("/albums_list", name="albums_list", methods={"GET"})
     */
    public function list()
    {
        // Récupérer tous les albums depuis la base de données
        $albums = $this->albumRepository->findAll();

        // Convertir les albums en tableau associatif ou en un tableau d'objets
        $albumsData = [];
        foreach ($albums as $album) {
            $albumsData[] = [
                'id' => $album->getId(),
                'nom' => $album->getNomAlbum(),
                'photos' => array_map(function ($photo) {
                    return [
                        'id' => $photo->getId(),
                        'title' => $photo->getTitle(),
                        // Ajoute les autres attributs de la photo si nécessaire
                    ];
                }, $album->getPhotos()->toArray()), // Assure-toi que getPhotos() retourne un tableau ou une collection
            ];
        }

        // Retourner la réponse JSON avec les albums
        return new JsonResponse($albumsData);
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
}