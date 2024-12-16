<?php

namespace App\Controller;

use App\Repository\PhotoRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Routing\Annotation\Route;

class AlbumController extends AbstractController
{
    public function index(PhotoRepository $photoRepository)
    {
        /*
        // Récupérer toutes les photos
        $photos = $photoRepository->findAll();*/

        // Récupérer les photos
        $photos = $photoRepository->findAllOrderedByTitle();

        // Afficher la vue avec les photos
        return $this->render('album/index.html.twig', [
            'photos' => $photos,
        ]);
    }
}
