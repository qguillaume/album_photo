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
use App\Service\AlbumVisibilityService;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\ParamConverter;
use Symfony\Component\HttpKernel\KernelInterface;


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

    /**
     * @Route("/api/albums", name="api_get_albums", methods={"GET"})
     */
    public function getAlbums(EntityManagerInterface $em): JsonResponse
    {
        // Récupérer l'utilisateur courant
        $user = $this->getUser();

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les albums de l'utilisateur courant
        $albums = $em->getRepository(Album::class)->findBy(['creator' => $user]);

        if (empty($albums)) {
            return new JsonResponse(['error' => 'No albums found'], Response::HTTP_NOT_FOUND);
        }

        // Mapper les albums et récupérer les photos
        $albumData = array_map(function ($album) use ($em, $user) {
            // Récupérer les photos de l'album
            $photos = $em->getRepository(Photo::class)->findBy(['album' => $album]);

            // Préparer les données des photos
            $photoData = array_map(function ($photo) use ($user) {
                return [
                    'id' => $photo->getId(),
                    'title' => $photo->getTitle(),
                    'url' => $photo->getFilePath(),
                    'likesCount' => $photo->getLikesCount(),
                    'isOwner' => $photo->getAlbum()->getCreator() === $user,  // Vérifie si l'utilisateur courant est le créateur de l'album
                ];
            }, $photos);

            return [
                'id' => $album->getId(),
                'nomAlbum' => $album->getNomAlbum(),
                'photos' => $photoData,
            ];
        }, $albums);

        return new JsonResponse(['albums' => $albumData], Response::HTTP_OK);
    }

    // Cette route est pour l'API (POST)
    /**
     * @Route("/api/create-album", name="api_create_album", methods={"POST"})
     */
    public function createAlbumApi(Request $request, EntityManagerInterface $em): JsonResponse
    {
        // Vérifier si l'utilisateur est authentifié
        if (!$this->getUser()) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les données du formulaire
        $albumName = $request->request->get('albumName');
        $imagePath = $request->files->get('imagePath');

        // Validation du nom de l'album
        if (empty($albumName)) {
            return new JsonResponse(['error' => 'Album name is required'], Response::HTTP_BAD_REQUEST);
        }

        // Créer l'album
        $album = new Album();
        $album->setNomAlbum($albumName);

        // Récupérer l'utilisateur connecté
        $user = $this->getUser();
        if ($user) {
            $album->setCreator($user); // Lier l'album à l'utilisateur
        }

        // Gérer l'image si présente
        if ($imagePath) {
            try {
                // Récupérer le chemin du répertoire de l'utilisateur
                $userDir = $this->getParameter('photos_directory') . '/' . $user->getId();
                $albumDir = $userDir . '/' . $albumName;
                $coverDir = $albumDir . '/cover_photo';

                // Créer les répertoires nécessaires si non existants
                if (!file_exists($userDir)) {
                    mkdir($userDir, 0777, true); // Créer le dossier de l'utilisateur
                }

                if (!file_exists($albumDir)) {
                    mkdir($albumDir, 0777, true); // Créer le dossier de l'album
                }

                if (!file_exists($coverDir)) {
                    mkdir($coverDir, 0777, true); // Créer le dossier cover_photo
                }

                // Générer un nom unique pour l'image de couverture et déplacer le fichier
                $newFilename = uniqid() . '.' . $imagePath->guessExtension();
                $imagePath->move($coverDir, $newFilename);

                // Définir le chemin de l'image dans l'entité Album
                $album->setImagePath($newFilename);

            } catch (\Exception $e) {
                if ($this->getParameter('kernel.environment') === 'dev') {
                    // Afficher l'erreur détaillée en mode développement
                    return new JsonResponse(['error' => 'Erreur lors du téléchargement de l\'image : ' . $e->getMessage()], Response::HTTP_INTERNAL_SERVER_ERROR);
                } else {
                    // Afficher un message générique en mode production
                    return new JsonResponse(['error' => 'Une erreur est survenue lors du téléchargement de l\'image.'], Response::HTTP_INTERNAL_SERVER_ERROR);
                }
            }
        } else {
            // Utiliser l'image par défaut si aucune image n'est fournie
            $album->setImagePath(NULL);
        }

        // Persister l'album dans la base de données
        $em->persist($album);
        $em->flush();

        // Retourner la réponse au client
        return new JsonResponse(['message' => 'Album created successfully'], Response::HTTP_OK);
    }


    /**
     * @Route("/album/new", name="album_new")
     */
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        // Vérifier si l'utilisateur a le rôle 'ROLE_USER'
        $this->denyAccessUnlessGranted('ROLE_USER');
        $album = new Album();
        $form = $this->createForm(AlbumFormType::class, $album);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Récupérer l'image téléchargée si elle existe
            /** @var UploadedFile $imageFile */
            $imageFile = $form->get('image_path')->getData();

            if ($imageFile) {
                try {
                    // Récupérer le chemin du répertoire de l'utilisateur
                    $user = $this->getUser();
                    $userDir = $this->getParameter('photos_directory') . '/' . $user->getId();
                    $albumName = $album->getNomAlbum();
                    $albumDir = $userDir . '/' . $albumName;
                    $coverDir = $albumDir . '/cover_photo';

                    // Créer les répertoires nécessaires si non existants
                    if (!file_exists($userDir)) {
                        mkdir($userDir, 0777, true); // Créer le dossier de l'utilisateur
                    }

                    if (!file_exists($albumDir)) {
                        mkdir($albumDir, 0777, true); // Créer le dossier de l'album
                    }

                    if (!file_exists($coverDir)) {
                        mkdir($coverDir, 0777, true); // Créer le dossier cover_photo
                    }

                    // Générer un nom unique pour l'image de couverture et déplacer le fichier
                    $newFilename = uniqid() . '.' . $imageFile->guessExtension();
                    $imageFile->move($coverDir, $newFilename);

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
            $user = $this->getUser();
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
                'nomAlbum' => $album->getNomAlbum(),
                'photos' => array_map(function ($photo) {
                    return [
                        'id' => $photo->getId(),
                        'title' => $photo->getTitle(),
                    ];
                }, $album->getPhotos()->toArray()),
                'isVisible' => $album->getIsVisible(),
                'isApproved' => $album->getIsApproved(),
                'creator' => $album->getCreator()->getId(),
            ];
        }

        // Retourner la réponse JSON avec les albums
        return new JsonResponse($albumsData);
    }

    /**
     * @Route("/album/rename/{id}", name="rename_album", requirements={"id"="\d+"})
     */
    public function renameAlbum(Request $request, EntityManagerInterface $em, int $id, KernelInterface $kernel): JsonResponse
    {
        $album = $em->getRepository(Album::class)->find($id);
        if (!$album) {
            return new JsonResponse(['message' => 'Album non trouvé'], 404);
        }

        // Récupérer les données envoyées dans la requête (nouveau nom)
        $data = json_decode($request->getContent(), true);
        $newAlbumName = $data['name'];

        // Récupérer le chemin du dossier actuel de l'album
        $user = $album->getCreator();
        $userDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $user->getId();
        $albumDir = $userDir . '/' . $album->getNomAlbum();

        // Vérifier si le dossier existe
        if (is_dir($albumDir)) {
            $newAlbumDir = $userDir . '/' . $newAlbumName;
            rename($albumDir, $newAlbumDir);
        }

        $album->setNomAlbum($newAlbumName);
        $em->flush();
        return new JsonResponse(['message' => 'Album renommé avec succès']);
    }

    /**
     * @Route("/album/delete/{id}", name="delete_album", requirements={"id"="\d+"})
     */
    public function deleteAlbum(EntityManagerInterface $em, int $id, KernelInterface $kernel): JsonResponse
    {
        try {
            // Étape 1 : Récupérer l'album
            $album = $em->getRepository(Album::class)->find($id);
            if (!$album) {
                return new JsonResponse(['message' => 'Album non trouvé'], 404);
            }

            // Étape 2 : Supprimer les photos associées (fichiers + base de données)
            $photos = $album->getPhotos();
            foreach ($photos as $photo) {
                // Supprimer le fichier physique de la photo
                $uploadDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $album->getCreator()->getId() . '/' . $album->getNomAlbum() . '/';
                $photoPath = $uploadDir . $photo->getFilePath();

                if (file_exists($photoPath)) {
                    unlink($photoPath);
                }

                // Supprimer la photo de la base de données
                $em->remove($photo);
            }

            // Flusher après suppression des photos pour éviter des conflits
            $em->flush();

            // Étape 3 : Supprimer le dossier `cover_photo`
            $coverDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $album->getCreator()->getId() . '/' . $album->getNomAlbum() . '/cover_photo';
            if (is_dir($coverDir)) {
                $this->deleteDirectory($coverDir);
            }

            // Étape 4 : Supprimer le dossier principal de l'album
            $albumDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $album->getCreator()->getId() . '/' . $album->getNomAlbum();
            if (is_dir($albumDir)) {
                $this->deleteDirectory($albumDir);
            }

            // Étape 5 : Supprimer l'album lui-même de la base de données
            $em->remove($album);
            $em->flush();

            return new JsonResponse(['message' => 'Album et photos supprimés avec succès']);

        } catch (\Exception $e) {
            return new JsonResponse(['message' => 'Erreur serveur : ' . $e->getMessage()], 500);
        }
    }

    /**
     * Fonction pour supprimer un répertoire et son contenu
     */
    private function deleteDirectory($dir)
    {
        if (!file_exists($dir)) {
            return;
        }

        $files = array_diff(scandir($dir), array('.', '..'));
        foreach ($files as $file) {
            $filePath = $dir . '/' . $file;
            is_dir($filePath) ? $this->deleteDirectory($filePath) : unlink($filePath);
        }

        rmdir($dir);
    }

    /**
     * @Route("/album/{id}/visibility", name="update_album_visibility", methods={"POST"})
     * @ParamConverter("album", class="App\Entity\Album")
     */
    public function updateVisibility(
        Album $album,
        AlbumVisibilityService $albumVisibilityService,
        EntityManagerInterface $entityManager,
        Request $request
    ): JsonResponse {
        $user = $this->getUser();

        // Vérifie si l'utilisateur est bien le créateur de l'album ou admin
        if ($album->getCreator() !== $user && !$this->isGranted('ROLE_ADMIN')) {
            return $this->json(['error' => 'Vous n\'êtes pas autorisé à modifier cet album.'], 403);
        }

        // Récupérer le paramètre `isVisible` de la requête
        $isVisible = json_decode($request->getContent(), true)['isVisible'] ?? false;

        // Utilisation du service pour mettre à jour la visibilité
        $albumVisibilityService->updateAlbumVisibility($album, $isVisible);

        return $this->json(['message' => 'Visibilité mise à jour avec succès !']);
    }

    /**
     * @Route("/album/{id}/approval", name="album_approval", methods={"POST"})
     */
    public function updateApproval(int $id, Request $request, EntityManagerInterface $em): JsonResponse
    {
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            return new JsonResponse(['message' => 'Album non trouvé'], 404);
        }

        // Récupérer la nouvelle approbation à partir de la requête
        $data = json_decode($request->getContent(), true);
        if (!isset($data['isApproved'])) {
            return new JsonResponse(['message' => 'Aucune Approbation spécifiée'], 400);
        }

        // Mettre à jour l'approbation de la photo
        $album->setIsApproved($data['isApproved']);
        $em->flush();

        return new JsonResponse(['message' => 'Approbation mise à jour avec succès']);
    }
}