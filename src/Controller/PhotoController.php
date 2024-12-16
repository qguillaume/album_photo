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
use App\Form\PhotoType;

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

}