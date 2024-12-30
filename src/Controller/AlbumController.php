<?php

// src/Controller/AlbumController.php
namespace App\Controller;

use App\Entity\Album;
use App\Entity\Photo;
use App\Form\AlbumType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AlbumController extends AbstractController
{
    /*
     * @IsGranted({"ROLE_ADMIN"})
     */
    public function new(Request $request, EntityManagerInterface $em): Response
    {
        $album = new Album();
        $form = $this->createForm(AlbumType::class, $album);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            // Récupérer l'image téléchargée si elle existe
            /** @var UploadedFile $imageFile */
            $imageFile = $form->get('image_path')->getData();

            if ($imageFile) {
                // Générer un nom unique pour l'image et déplacer le fichier
                $newFilename = uniqid() . '.' . $imageFile->guessExtension();
                $imageFile->move(
                    $this->getParameter('albums_directory'), // Définir le répertoire de destination
                    $newFilename
                );

                // Définir le chemin de l'image dans l'entité Album
                $album->setImagePath($newFilename);
            } else {
                // Utiliser l'image par défaut si aucune image n'est fournie
                $album->setImagePath(NULL);
            }

            // Persister l'album dans la base de données
            $em->persist($album);

            // Ajouter une photo par défaut si l'album n'a pas de photo
            if (!$album->getPhotos()->count()) {
                $defaultPhoto = new Photo();
                $defaultPhoto->setTitle('Image par défaut');
                $defaultPhoto->setFilePath('default-album.png'); // Nom du fichier générique
                $defaultPhoto->setAlbum($album);

                $em->persist($defaultPhoto);
            }

            $em->flush();

            return $this->redirectToRoute('photo_albums');
        }

        return $this->render('album/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }
}