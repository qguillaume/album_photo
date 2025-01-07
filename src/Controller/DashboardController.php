<?php

// src/Controller/DashboardController.php
namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Response;
use App\Repository\AlbumRepository;
use App\Repository\PhotoRepository;

class DashboardController extends AbstractController
{
    public function index(AlbumRepository $albumRepository, PhotoRepository $photoRepository): Response
    {
        // Cette page est protégée, donc l'utilisateur doit être connecté en tant qu'admin uniquement !!!!!!!!
        $this->denyAccessUnlessGranted('ROLE_ADMIN');
        $albums = $albumRepository->findAll();  // Récupère tous les albums
        $photos = $photoRepository->findAll();  // Récupère toutes les photos
        $topLikedPhotos = $photoRepository->findTopLikedPhotos(); // Les photos avec le plus de likes

        // Calcul du nombre de photos par album
        $albumPhotosCount = [];
        foreach ($albums as $album) {
            $albumPhotosCount[$album->getId()] = $album->getPhotos() ? count($album->getPhotos()) : 0;
        }

        //$albumPhotosCount = $albumRepository->findAlbumsWithPhotoCounts();

        return $this->render('dashboard/index.html.twig', [
            'albums' => $albums,
            'photos' => $photos,
            'topLikedPhotos' => $topLikedPhotos,
            'albumPhotosCount' => $albumPhotosCount,
        ]);
    }
}
