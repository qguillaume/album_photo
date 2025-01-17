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

    /**
     * @Route("/album/delete/{id}", name="delete_album", requirements={"id"="\d+"})
     */
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