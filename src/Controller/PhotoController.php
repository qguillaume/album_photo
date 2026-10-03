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
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Email;
use App\Service\ImageOptimizer;
use App\Service\AlbumVisibilityService;

class PhotoController extends AbstractController
{
    private PhotoRepository $photoRepository;
    private string $projectDir;

    public function __construct(PhotoRepository $photoRepository, KernelInterface $kernel)
    {
        $this->photoRepository = $photoRepository;
        $this->projectDir = $kernel->getProjectDir();
    }

    #[Route('/photos', name: 'photo_albums')]
    public function albums(AlbumVisibilityService $albumVisibility): Response
    {
        return $this->render('photo/albums.html.twig', [
            'albums' => $albumVisibility->getVisibleAlbumsFor($this->getUser()),
        ]);
    }

    // Afficher les photos d'un album
    #[Route('/album/{id}', name: 'photos_by_album', requirements: ['id' => '\d+'])]
    public function photosByAlbum(EntityManagerInterface $em, AlbumVisibilityService $albumVisibility, int $id): Response
    {
        // Récupérer un album spécifique par son ID
        $album = $em->getRepository(Album::class)->find($id);

        if (!$album) {
            throw $this->createNotFoundException('Album non trouvé');
        }

        $user = $this->getUser();

        if (!$albumVisibility->canAccessAlbum($album, $user)) {
            throw new AccessDeniedException('Vous n\'avez pas l\'autorisation d\'accéder à cet album');
        }

        return $this->render('photo/photos_by_album.html.twig', [
            'album' => $album,
            'photos' => $albumVisibility->getVisiblePhotosFor($album, $user),
            'is_owner' => $album->getCreator() === $user,
        ]);
    }

    #[Route('/api/photo', name: 'create_photo', methods: ['POST'])]
    public function createPhoto(Request $request, EntityManagerInterface $em, MailerInterface $mailer, ImageOptimizer $imageOptimizer): JsonResponse
    {
        $user = $this->getUser();  // Récupérer l'utilisateur courant

        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        // Récupérer les données de la requête
        $title = $request->get('title');
        $albumId = $request->get('album');  // L'album choisi
        $file = $request->files->get('file');  // Fichier photo

        // Trouver l'album
        $album = $em->getRepository(Album::class)->find($albumId);

        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'album appartient à l'utilisateur courant
        if ($album->getCreator() !== $user) {
            return new JsonResponse(['error' => 'Unauthorized access to this album'], Response::HTTP_UNAUTHORIZED);
        }

        // Créer la photo
        $photo = new Photo();
        $photo->setTitle($title);

        // Si un album est sélectionné, mettre à jour l'album de la photo
        if ($album) {
            // Vérifie que l'album appartient bien à l'utilisateur
            if ($album->getCreator() !== $user) {
                return new JsonResponse(['error' => 'You cannot add a photo to an album that doesn\'t belong to you.'], Response::HTTP_UNAUTHORIZED);
            }
            $photo->setAlbum($album);  // Mettre à jour l'album de la photo
        }

        // Si aucun album n'est sélectionné et qu'un album pré-sélectionné est disponible, le garder
        if (!$album && $photo->getAlbum()) {
            $album = $photo->getAlbum(); // Récupère l'album pré-sélectionné si rien n'est choisi
        }

        // Gérer le fichier téléchargé
        if ($file) {
            // Créer le répertoire pour l'utilisateur et l'album
            $userDir = $this->getParameter('photos_directory') . '/' . $user->getId();
            $albumName = $album->getNomAlbum();  // Utiliser le nom de l'album
            $albumDir = $userDir . '/' . $albumName;
            $coverDir = $albumDir . '/cover_photo';

            // Créer les répertoires si nécessaires
            if (!file_exists($userDir)) {
                mkdir($userDir, 0755, true);
            }
            if (!file_exists($albumDir)) {
                mkdir($albumDir, 0755, true);
            }
            if (!file_exists($coverDir)) {
                mkdir($coverDir, 0755, true);
            }

            // Générer un nom unique pour l'image et déplacer le fichier
            $filename = uniqid() . '.' . $file->guessExtension();
            $file->move($albumDir, $filename);

            // Générer la miniature (grille d'album) — l'original n'est jamais modifié
            $imageOptimizer->generateThumbnail($albumDir . '/' . $filename);

            // Mettre à jour le chemin du fichier dans l'objet Photo
            $photo->setFilePath($filename);
        }

        // Ajouter la photo à l'album et mettre à jour le nombre de photos
        $album->addPhoto($photo);
        $album->setPhotoCount($album->getPhotoCount() + 1); // Mettre à jour le compteur de photos

        // Sauvegarder la photo et l'album
        $em->persist($photo);
        $em->persist($album);
        $em->flush();

        // Envoyer un mail après l'upload d'une photo
        if ($user->getUserIdentifier() !== "GuillaumeQuesnel") {
            $email = (new Email())
                ->from('no-reply@guillaume-quesnel.com')
                ->to('admin@guillaume-quesnel.com')
                ->subject('Nouvelle photo ajoutée')
                ->html("
                    <p>Une nouvelle photo a été ajoutée par {$user->getUsername()}.</p>
                    <p>Titre : {$photo->getTitle()}</p>
                    <p>Album : {$album->getNomAlbum()}</p>
                    <p><a href='https://guillaume-quesnel.com/photo/{$photo->getId()}'>Voir la photo</a></p>
                    ");

            $mailer->send($email);
        }


        // Retourner une réponse JSON avec un message de succès
        return new JsonResponse(['message' => 'Photo created successfully!'], Response::HTTP_OK);
    }

    /**
     * Renvoie les limites d'upload RÉELLEMENT appliquées par le serveur.
     *
     * Le navigateur s'en sert pour découper l'envoi en lots qui passent à coup
     * sûr, quelle que soit la configuration de l'hébergeur. Sans cela, une
     * valeur codée en dur dans le JS finit toujours par diverger de la config
     * PHP — c'est ce qui limitait silencieusement le multipostage à 20 photos.
     */
    #[Route('/api/upload-limits', name: 'upload_limits', methods: ['GET'])]
    public function uploadLimits(): JsonResponse
    {
        $this->denyAccessUnlessGranted('ROLE_USER');

        return new JsonResponse([
            'maxFileUploads' => (int) ini_get('max_file_uploads'),
            'postMaxSize' => $this->iniBytes('post_max_size'),
            'uploadMaxFilesize' => $this->iniBytes('upload_max_filesize'),
        ]);
    }

    /**
     * Convertit une directive de taille PHP ("8M", "24M", "512K") en octets.
     * Renvoie 0 si la valeur est absente ou illimitée.
     */
    private function iniBytes(string $directive): int
    {
        $raw = trim((string) ini_get($directive));
        if ($raw === '' || $raw === '-1') {
            return 0;
        }

        $value = (int) $raw;
        switch (strtolower(substr($raw, -1))) {
            case 'g':
                $value *= 1024;
                // no break
            case 'm':
                $value *= 1024;
                // no break
            case 'k':
                $value *= 1024;
        }

        return $value;
    }

    /**
     * Multipostage : envoi de plusieurs photos d'un coup dans un même album.
     *
     * Réservé au superadmin. Pour ouvrir la fonctionnalité à d'autres rôles plus tard,
     * il suffit de remplacer 'ROLE_SUPER_ADMIN' ci-dessous par 'ROLE_ADMIN' ou 'ROLE_USER'
     * (et de faire la même modification côté React dans PhotoForm.tsx).
     */
    #[Route('/api/photos/batch', name: 'create_photos_batch', methods: ['POST'])]
    public function createPhotosBatch(Request $request, EntityManagerInterface $em, ImageOptimizer $imageOptimizer): JsonResponse
    {
        // Garde-fou de rôle : c'est ICI que se décide qui a le droit au multipostage.
        $this->denyAccessUnlessGranted('ROLE_SUPER_ADMIN');

        $user = $this->getUser();

        // Nombre maximum de photos par envoi (garde-fou anti-abus)
        $maxFiles = 30;

        $albumId = $request->get('album');
        $files = $request->files->get('files'); // Tableau de fichiers

        if (!is_array($files) || count($files) === 0) {
            return new JsonResponse(['error' => 'Aucun fichier reçu.'], Response::HTTP_BAD_REQUEST);
        }

        if (count($files) > $maxFiles) {
            return new JsonResponse(
                ['error' => "Vous ne pouvez pas envoyer plus de {$maxFiles} photos à la fois."],
                Response::HTTP_BAD_REQUEST
            );
        }

        // Détection de la troncature silencieuse : au-delà de max_file_uploads,
        // PHP supprime les fichiers en trop SANS lever d'erreur. On compare donc
        // ce qui est arrivé à ce que le navigateur dit avoir envoyé, pour
        // transformer cette panne invisible en message explicite.
        $expected = (int) $request->get('expected');
        if ($expected > 0 && count($files) < $expected) {
            $limit = (int) ini_get('max_file_uploads');

            return new JsonResponse([
                'error' => sprintf(
                    'Le serveur n\'a reçu que %d photo(s) sur %d : la limite PHP max_file_uploads (%d) '
                    . 'les a supprimées silencieusement. Vérifiez le fichier .user.ini de la racine web.',
                    count($files),
                    $expected,
                    $limit
                ),
            ], Response::HTTP_BAD_REQUEST);
        }

        $album = $em->getRepository(Album::class)->find($albumId);
        if (!$album) {
            return new JsonResponse(['error' => 'Album not found'], Response::HTTP_NOT_FOUND);
        }

        // Vérifier que l'album appartient bien à l'utilisateur courant
        if ($album->getCreator() !== $user) {
            return new JsonResponse(
                ['error' => "Vous ne pouvez pas ajouter des photos dans un album qui ne vous appartient pas."],
                Response::HTTP_UNAUTHORIZED
            );
        }

        // Préparer les répertoires (une seule fois, même album pour tout le lot)
        $userDir = $this->getParameter('photos_directory') . '/' . $user->getId();
        $albumDir = $userDir . '/' . $album->getNomAlbum();
        $coverDir = $albumDir . '/cover_photo';

        foreach ([$userDir, $albumDir, $coverDir] as $dir) {
            if (!file_exists($dir)) {
                mkdir($dir, 0755, true);
            }
        }

        $allowedMimeTypes = ['image/jpeg', 'image/png'];
        $created = 0;
        $skipped = [];

        foreach ($files as $file) {
            if (!$file) {
                continue;
            }

            // Une photo refusée par PHP lui-même (dépassement de
            // upload_max_filesize, envoi interrompu…) arrive ICI à l'état
            // « invalide » : son fichier temporaire n'existe pas.
            //
            // Ce test est indispensable AVANT toute autre lecture : getSize()
            // renvoie alors 0 (le test de taille ci-dessous ne la rattrape donc
            // pas) et getMimeType() lève une exception sur ce fichier fantôme,
            // ce qui faisait échouer TOUT le lot — message « Batch upload
            // failed » — au lieu de n'écarter que cette photo.
            if (!$file->isValid()) {
                $reason = match ($file->getError()) {
                    UPLOAD_ERR_INI_SIZE, UPLOAD_ERR_FORM_SIZE => 'trop volumineuse, limite ' . ini_get('upload_max_filesize'),
                    UPLOAD_ERR_PARTIAL => 'envoi interrompu',
                    UPLOAD_ERR_NO_FILE => 'fichier vide',
                    default => 'refusée par le serveur',
                };
                $skipped[] = $file->getClientOriginalName() . ' (' . $reason . ')';
                continue;
            }

            // Ignorer les fichiers trop lourds ou d'un format non autorisé
            if ($file->getSize() > 8 * 1024 * 1024 || !in_array($file->getMimeType(), $allowedMimeTypes, true)) {
                $skipped[] = $file->getClientOriginalName();
                continue;
            }

            // Nom unique + déplacement du fichier
            $filename = uniqid() . '.' . $file->guessExtension();
            $file->move($albumDir, $filename);

            // Miniature (l'original n'est jamais modifié)
            $imageOptimizer->generateThumbnail($albumDir . '/' . $filename);

            // Titre : basé sur le nom du fichier d'origine (sans extension), tronqué à 30 caractères
            $originalName = pathinfo($file->getClientOriginalName(), PATHINFO_FILENAME);
            $title = mb_substr($originalName, 0, 30);

            $photo = new Photo();
            $photo->setTitle($title !== '' ? $title : 'photo');
            $photo->setAlbum($album);
            $photo->setFilePath($filename);

            $album->addPhoto($photo);
            $album->setPhotoCount($album->getPhotoCount() + 1);

            $em->persist($photo);
            $created++;
        }

        $em->persist($album);
        $em->flush(); // Un seul flush pour tout le lot

        return new JsonResponse([
            'message' => "{$created} photo(s) ajoutée(s) avec succès.",
            'created' => $created,
            'skipped' => $skipped,
        ], Response::HTTP_OK);
    }

    #[Route('photo/upload/{albumId}', name: 'photo_upload', defaults: ['albumId' => null])]
    public function upload(Request $request, EntityManagerInterface $em, ImageOptimizer $imageOptimizer, $albumId = null): Response
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
                    mkdir($userDir, 0755, true);
                }
                if (!file_exists($albumDir)) {
                    mkdir($albumDir, 0755, true);
                }
                if (!file_exists($coverDir)) {
                    mkdir($coverDir, 0755, true);
                }

                // Générer un nom unique pour l'image et déplacer le fichier
                $filename = uniqid() . '.' . $file->guessExtension();
                $file->move($albumDir, $filename);

                // Générer la miniature (grille d'album) — l'original n'est jamais modifié
                $imageOptimizer->generateThumbnail($albumDir . '/' . $filename);

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


    #[Route('/photo/rename/{id}', name: 'rename_photo', requirements: ['id' => '\d+'])]
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

    #[Route('/photo/delete/{id}', name: 'delete_photo', requirements: ['id' => '\d+'])]
    public function deletePhoto(KernelInterface $kernel, EntityManagerInterface $em, int $id): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            return new JsonResponse(['message' => 'Photo non trouvée'], 404);
        }

        // Récupérer l'album associé à la photo
        $album = $photo->getAlbum(); // Suppose qu'il y a une relation bidirectionnelle entre Photo et Album
        $creator = $album?->getCreator();

        // Le chemin des fichiers se reconstruit à partir de l'album et de son
        // propriétaire : si l'un des deux manque (photo orpheline), on ne peut
        // pas le calculer. On supprime alors uniquement l'enregistrement, sans
        // laisser une erreur fatale interrompre la suppression.
        if ($album !== null && $creator !== null) {
            $uploadDir = $kernel->getProjectDir() . $this->getParameter('public_directory') . '/uploads/photos/' . $creator->getId() . '/' . $album->getNomAlbum() . '/';
            $photoPath = $uploadDir . $photo->getFilePath();

            // Vérifier si le fichier existe avant de le supprimer
            if (file_exists($photoPath)) {
                unlink($photoPath); // Supprimer le fichier
            } else {
                error_log("Le fichier n'existe pas à ce chemin : " . $photoPath);
            }

            // Supprimer également la miniature associée si elle existe
            $thumbPath = $uploadDir . ImageOptimizer::THUMBNAIL_DIR . '/' . $photo->getFilePath();
            if (file_exists($thumbPath)) {
                unlink($thumbPath);
            }
        } else {
            error_log('Photo #' . $id . ' sans album ou sans propriétaire : suppression du seul enregistrement.');
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

    /**
     * Fait pivoter une photo de 90, 180 ou 270 degrés (sens horaire).
     * Accessible au propriétaire de la photo, au superadmin, et à un admin
     * si le propriétaire est un simple utilisateur (mêmes règles que la
     * modération du dashboard).
     */
    #[Route('/photo/{id}/rotate', name: 'photo_rotate', requirements: ['id' => '\d+'], methods: ['POST'])]
    public function rotatePhoto(int $id, Request $request, EntityManagerInterface $em, ImageOptimizer $imageOptimizer): JsonResponse
    {
        $photo = $em->getRepository(Photo::class)->find($id);
        if (!$photo) {
            return new JsonResponse(['error' => 'Photo non trouvée'], Response::HTTP_NOT_FOUND);
        }

        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Unauthorized'], Response::HTTP_UNAUTHORIZED);
        }

        $album = $photo->getAlbum();
        $owner = $album ? $album->getCreator() : null;
        if (!$owner) {
            return new JsonResponse(['error' => 'Photo sans album associé'], Response::HTTP_BAD_REQUEST);
        }

        // Mêmes règles que le dashboard : propriétaire, superadmin, ou admin
        // sur les photos d'un simple utilisateur.
        $ownerRoles = $owner->getRoles();
        $ownerIsPlainUser = !\in_array('ROLE_ADMIN', $ownerRoles, true) && !\in_array('ROLE_SUPER_ADMIN', $ownerRoles, true);
        $canRotate = $owner === $user
            || $this->isGranted('ROLE_SUPER_ADMIN')
            || ($this->isGranted('ROLE_ADMIN') && $ownerIsPlainUser);

        if (!$canRotate) {
            return new JsonResponse(['error' => 'Accès refusé'], Response::HTTP_FORBIDDEN);
        }

        $data = json_decode($request->getContent(), true);
        $degrees = (int) ($data['degrees'] ?? 0);
        if (!\in_array($degrees, [90, 180, 270], true)) {
            return new JsonResponse(['error' => 'Angle invalide : 90, 180 ou 270 attendu.'], Response::HTTP_BAD_REQUEST);
        }

        // Reconstruire le chemin du fichier (même logique que deletePhoto)
        $uploadDir = $this->projectDir . $this->getParameter('public_directory') . '/uploads/photos/' . $owner->getId() . '/' . $album->getNomAlbum() . '/';
        $photoPath = $uploadDir . $photo->getFilePath();

        if (!$imageOptimizer->rotate($photoPath, $degrees)) {
            return new JsonResponse(['error' => 'Impossible de faire pivoter cette photo.'], Response::HTTP_INTERNAL_SERVER_ERROR);
        }

        return new JsonResponse(['message' => "Photo pivotée de {$degrees}°."]);
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

    #[Route('/photos_list', name: 'photos_list', methods: ['GET'])]
    public function list(PhotoRepository $photoRepository): JsonResponse
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
                'isVisible' => $photo->getIsVisible(),
                'isApproved' => $photo->getIsApproved()
            ];
        }

        // Retourner la réponse JSON avec les photos
        return new JsonResponse($photosData);
    }

    #[Route('/photo/{id}', name: 'photo_show', requirements: ['id' => '\d+'], methods: ['GET', 'POST'])]
    public function show(int $id, Request $request, EntityManagerInterface $em): Response
    {
        $photo = $em->getRepository(Photo::class)->find($id);

        if (!$photo) {
            throw $this->createNotFoundException('Photo non trouvée');
        }

        $isOwner = $photo->getAlbum() && $photo->getAlbum()->getCreator() === $this->getUser();
        if (!$photo->getIsVisible() || !$photo->getIsApproved()) {
            if (!$isOwner && !$this->isGranted('ROLE_SUPER_ADMIN')) {
                throw new AccessDeniedException('Vous n\'avez pas l\'autorisation d\'accéder à cette photo');
            }
        }

        // 🔁 Récupérer toutes les photos de l'album triées par ID (ou createdAt si tu préfères)
        $albumPhotos = $em->getRepository(Photo::class)->findBy(
            ['album' => $photo->getAlbum()],
            ['id' => 'ASC']
        );

        // 🔍 Trouver la précédente et la suivante
        $prevPhoto = null;
        $nextPhoto = null;
        foreach ($albumPhotos as $index => $p) {
            if ($p->getId() === $photo->getId()) {
                if ($index > 0) {
                    $prevPhoto = $albumPhotos[$index - 1];
                }
                if ($index < count($albumPhotos) - 1) {
                    $nextPhoto = $albumPhotos[$index + 1];
                }
                break;
            }
        }

        $comments = $em->getRepository(Comment::class)->findBy(['photo' => $photo]);

        $comment = new Comment();
        $comment->setPhoto($photo);
        $form = $this->createForm(CommentFormType::class, $comment);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $comment->setUser($this->getUser());
            $em->persist($comment);
            $em->flush();

            return $this->redirectToRoute('photo_show', ['id' => $photo->getId()]);
        }

        return $this->render('photo/show.html.twig', [
            'photo' => $photo,
            'comments' => $comments,
            'commentForm' => $form->createView(),
            'prevPhoto' => $prevPhoto,
            'nextPhoto' => $nextPhoto,
        ]);
    }


    #[Route('/photo/{id}/comment', name: 'comment_add', methods: ['POST'])]
    public function addComment(Request $request, int $id, EntityManagerInterface $em): JsonResponse
    {
        // Récupérer l'utilisateur connecté
        $user = $this->getUser();
        if (!$user) {
            return new JsonResponse(['error' => 'Vous devez être connecté pour commenter.'], 403);
        }

        // Récupérer la photo
        $photo = $em->getRepository(Photo::class)->find($id);
        if (!$photo) {
            return new JsonResponse(['error' => 'Photo non trouvée.'], 404);
        }

        // Récupérer le contenu du commentaire depuis la requête JSON
        $data = json_decode($request->getContent(), true);
        $content = $data['content'] ?? '';

        // Validation : contenu vide
        if (empty($content)) {
            return new JsonResponse(['error' => 'Le contenu du commentaire ne peut pas être vide.'], 400);
        }

        // Créer et persister un nouveau commentaire
        $comment = new Comment();
        $comment->setContent($content);
        $comment->setPhoto($photo);
        $comment->setUser($user);
        $comment->setCreatedAt(new \DateTime());

        $em->persist($comment);
        $em->flush();

        // Retourner le commentaire créé dans la réponse JSON
        return new JsonResponse(['success' => true, 'comment' => $comment], 201);
    }

    #[Route('/photo/{id}/visibility', name: 'photo_visibility', methods: ['POST'])]
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

    #[Route('/photo/{id}/approval', name: 'photo_approval', methods: ['POST'])]
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