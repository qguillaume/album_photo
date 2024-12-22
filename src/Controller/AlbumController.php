<?php

// src/Controller/AlbumController.php
namespace App\Controller;

use App\Entity\Album;
use App\Form\AlbumType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AlbumController extends AbstractController
{
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
                $album->setImagePath(null);
            }

            // Persister l'album dans la base de données
            $em->persist($album);
            $em->flush();

            return $this->redirectToRoute('album_show', ['id' => $album->getId()]);
        }

        return $this->render('album/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    public function show(int $id, EntityManagerInterface $em): Response
    {
        // Récupérer l'album par son ID
        $album = $em->getRepository(Album::class)->find($id);

        // Si l'album n'existe pas, renvoyer une page 404
        if (!$album) {
            throw $this->createNotFoundException('L\'album n\'existe pas.');
        }

        // Rendre la vue avec les informations de l'album
        return $this->render('album/show.html.twig', [
            'album' => $album
        ]);
    }
}