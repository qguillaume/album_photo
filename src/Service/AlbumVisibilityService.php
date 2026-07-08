<?php

namespace App\Service;

use App\Entity\Album;
use App\Entity\Photo;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\User\UserInterface;

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

    /**
     * Renvoie la liste des albums qu'un utilisateur a le droit de voir.
     *
     * Remplace l'ancienne requête « roles LIKE '%"ROLE_USER"%' » : on filtre en
     * PHP sur getRoles() (source de vérité unique) plutôt que sur la
     * sérialisation JSON stockée en base, qui était fragile.
     *
     * NOTE : aucune role_hierarchy n'étant définie, tester getRoles() équivaut à
     * isGranted() pour ces rôles.
     */
    public function getVisibleAlbumsFor(?UserInterface $user): array
    {
        $albums = $this->entityManager->getRepository(Album::class)->findAll();

        // Comportement historique conservé : un visiteur non authentifié voit
        // tous les albums. (Voir la note de sécurité laissée à Guillaume.)
        if ($user === null) {
            return $albums;
        }

        return array_values(array_filter(
            $albums,
            fn (Album $album): bool => $this->isAlbumVisibleInListFor($album, $user)
        ));
    }

    /**
     * Un utilisateur a-t-il le droit d'ouvrir un album donné ?
     */
    public function canAccessAlbum(Album $album, ?UserInterface $user): bool
    {
        // Album public (visible ET approuvé) : accessible à tout le monde.
        if ($album->getIsVisible() && $album->getIsApproved()) {
            return true;
        }

        if ($user === null) {
            return false;
        }

        // Le propriétaire accède toujours à son album.
        if ($album->getCreator() === $user) {
            return true;
        }

        $roles = $user->getRoles();

        if (in_array('ROLE_SUPER_ADMIN', $roles, true)) {
            return true;
        }

        // Un admin peut ouvrir l'album d'un utilisateur simple.
        return in_array('ROLE_ADMIN', $roles, true) && $this->ownerIsPlainUser($album);
    }

    /**
     * Filtre les photos d'un album selon les droits de l'utilisateur.
     */
    public function getVisiblePhotosFor(Album $album, ?UserInterface $user): array
    {
        $roles = $user ? $user->getRoles() : [];

        return array_values(array_filter(
            $album->getPhotos()->toArray(),
            function (Photo $photo) use ($user, $roles): bool {
                // Super-admin : toutes les photos.
                if (in_array('ROLE_SUPER_ADMIN', $roles, true)) {
                    return true;
                }

                // Comportement historique : un admin voit toutes les photos de
                // l'album (la condition d'origine in_array('ROLE_USER', ownerRoles)
                // était toujours vraie, getRoles() ajoutant ROLE_USER).
                if (in_array('ROLE_ADMIN', $roles, true)) {
                    return true;
                }

                // Le propriétaire voit ses propres photos, même non publiées.
                if ($photo->getAlbum()->getCreator() === $user) {
                    return true;
                }

                // Sinon : uniquement les photos visibles et approuvées.
                return $photo->getIsVisible() && $photo->getIsApproved();
            }
        ));
    }

    /**
     * Règle d'affichage d'un album dans la liste (/photos) pour un utilisateur
     * authentifié.
     */
    private function isAlbumVisibleInListFor(Album $album, UserInterface $user): bool
    {
        $roles = $user->getRoles();

        // Super-admin : tout.
        if (in_array('ROLE_SUPER_ADMIN', $roles, true)) {
            return true;
        }

        // Ses propres albums, publiés ou non.
        if ($album->getCreator() === $user) {
            return true;
        }

        $isPublic = $album->getIsVisible() && $album->getIsApproved();

        // Admin : albums publics + albums des utilisateurs simples.
        if (in_array('ROLE_ADMIN', $roles, true)) {
            return $isPublic || $this->ownerIsPlainUser($album);
        }

        // Utilisateur simple : uniquement les albums publics.
        return $isPublic;
    }

    /**
     * Le créateur de l'album est-il un utilisateur simple (ni admin, ni
     * super-admin) ? Remplace le fragile « roles LIKE '%"ROLE_USER"%' ».
     */
    private function ownerIsPlainUser(Album $album): bool
    {
        $creator = $album->getCreator();

        if ($creator === null) {
            return false;
        }

        $roles = $creator->getRoles();

        return !in_array('ROLE_ADMIN', $roles, true)
            && !in_array('ROLE_SUPER_ADMIN', $roles, true);
    }
}
