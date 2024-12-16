<?php

// src/Controller/PhotoController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\Filesystem\Filesystem;
use App\Entity\Photo;
use Doctrine\ORM\EntityManagerInterface;

class PhotoController extends AbstractController
{
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
    public function upload(Request $request, EntityManagerInterface $em)
    {
        $photo = new Photo();

        // Supposons que le formulaire ait un champ "file"
        $file = $request->files->get('file');

        if ($file instanceof UploadedFile) {
            // Définir un chemin pour enregistrer le fichier (par exemple dans "uploads/photos")
            $filename = uniqid() . '.' . $file->guessExtension();
            $file->move($this->getParameter('uploads_directory'), $filename);

            // Mettre à jour les propriétés de l'entité
            $photo->setFilePath('uploads/photos/' . $filename);
            $photo->setTitle('Nom de la photo'); // Exemple, tu devrais probablement récupérer ce nom depuis le formulaire

            // Sauvegarder dans la base de données
            $em->persist($photo);
            $em->flush();
        }

        return $this->redirectToRoute('photo_index');
    }
}