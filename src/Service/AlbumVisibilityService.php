<?php

namespace App\Service;

use App\Entity\Album;
use Doctrine\ORM\EntityManagerInterface;

class AlbumVisibilityService
{
    private EntityManagerInterface $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    /**
     * Met à jour la visibilité de l'album et de ses photos associées.
     */
    public function updateAlbumVisibility(Album $album, bool $isVisible): void
    {
        $album->setIsVisible($isVisible);

        foreach ($album->getPhotos() as $photo) {
            // Si l'album est invisible, toutes les photos deviennent invisibles
            if (!$isVisible) {
                $photo->setIsVisible(false);
            } else {
                // Si l'album devient visible, on vérifie si chaque photo est approuvée
                $photo->setIsVisible($photo->getIsApproved());
            }
        }

        // Sauvegarde les modifications dans la base de données
        $this->entityManager->flush();
    }
}
