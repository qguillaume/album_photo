<?php

namespace App\EventListener;

use App\Entity\Album;
use Doctrine\ORM\Event\PreRemoveEventArgs;

class AlbumListener
{
    public function preRemove(PreRemoveEventArgs $event): void
    {
        // Récupérer l'entité en cours de suppression
        $entity = $event->getObject();

        // Vérifier que l'entité est bien un Album
        if (!$entity instanceof Album) {
            return;
        }

        $entityManager = $event->getObjectManager();

        // Rendre toutes les photos associées invisibles
        foreach ($entity->getPhotos() as $photo) {
            $photo->setIsVisible(false);
            $entityManager->persist($photo);
        }

        $entityManager->flush();
    }
}