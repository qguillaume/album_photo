<?php

namespace App\Repository;

use App\Entity\Photo;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Photo|null find($id, $lockMode = null, $lockVersion = null)
 * @method Photo|null findOneBy(array $criteria, array $orderBy = null)
 * @method Photo[]    findAll()
 * @method Photo[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class PhotoRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Photo::class);
    }

    public function findTopLikedPhotos(int $limit = 10)
    {
        return $this->createQueryBuilder('p')
            ->select('p', 'COUNT(l) AS HIDDEN likes_count') // Compte le nombre de likes pour chaque photo
            ->leftJoin('p.likes', 'l')  // Jointure avec la table des likes
            ->groupBy('p.id')  // On groupe par photo
            ->orderBy('likes_count', 'DESC')  // On trie par le nombre de likes
            ->setMaxResults($limit)  // Limite les résultats
            ->getQuery()
            ->getResult();
    }

    public function findPhotosWithCommentsAndLikes(): array
    {
        return $this->createQueryBuilder('p')
            ->select('p', 'COUNT(c) AS comments_count', 'COUNT(l) AS likes_count')
            ->leftJoin('p.comments', 'c') // Jointure pour les commentaires
            ->leftJoin('p.likes', 'l')    // Jointure pour les likes
            ->groupBy('p.id')            // Groupement par photo
            ->orderBy('likes_count', 'DESC') // Trier par likes décroissants
            ->getQuery()
            ->getResult();
    }

    public function findAllPhotosForUser($user)
    {
        $qb = $this->createQueryBuilder('p');
        $roles = $user->getRoles();
        $userId = $user->getId();

        // Si l'utilisateur est SuperAdmin
        if (in_array('ROLE_SUPER_ADMIN', $roles)) {
            // Le superadmin voit toutes les photos, visibles ou non, approuvées ou non
            return $qb->getQuery()->getResult();
        }

        // Si l'utilisateur est Admin
        if (in_array('ROLE_ADMIN', $roles)) {
            return $qb
                ->leftJoin('p.album', 'a')
                ->leftJoin('a.creator', 'ac')
                ->where(
                    // Voir les photos des autres utilisateurs visibles et approuvées
                    'p.isVisible = :visible AND p.isApproved = :approved'
                )
                // Voir ses propres photos (même non visibles ou non approuvées)
                ->orWhere('ac.id = :userId')
                // Voir les photos des utilisateurs avec seulement le rôle ROLE_USER (pas de ROLE_ADMIN ni ROLE_SUPER_ADMIN)
                ->orWhere('ac.id IN (SELECT u.id FROM App\Entity\User u WHERE SIZE(u.roles) = 1 AND u.id != :userId)')
                ->setParameter('visible', true)
                ->setParameter('approved', true)
                ->setParameter('userId', $userId)
                ->getQuery()
                ->getResult();
        }

        // Si l'utilisateur est un simple User
        return $qb
            ->leftJoin('p.album', 'a')
            ->leftJoin('a.creator', 'ac')
            ->where(
                // Voir les photos visibles et approuvées des autres utilisateurs
                'p.isVisible = :visible AND p.isApproved = :approved'
            )
            // Voir ses propres photos (même non visibles ou non approuvées)
            ->orWhere('ac.id = :userId')
            ->setParameter('visible', true)
            ->setParameter('approved', true)
            ->setParameter('userId', $userId)
            ->getQuery()
            ->getResult();
    }
}
