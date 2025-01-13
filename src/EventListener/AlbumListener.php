<?php

namespace App\EventListener;

use App\Entity\Album;
use Doctrine\ORM\Event\LifecycleEventArgs;

class AlbumListener
{
    public function preRemove(Album $album, LifecycleEventArgs $event): void
    {
        $entityManager = $event->getEntityManager();

        foreach ($album->getPhotos() as $photo) {
            // Définir toutes les photos comme invisibles
            $photo->setIsVisible(false);
            $entityManager->persist($photo);
        }

        $entityManager->flush();
    }
}