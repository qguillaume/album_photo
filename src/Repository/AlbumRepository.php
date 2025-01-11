<?php

namespace App\Repository;

use App\Entity\Album;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @method Album|null find($id, $lockMode = null, $lockVersion = null)
 * @method Album|null findOneBy(array $criteria, array $orderBy = null)
 * @method Album[]    findAll()
 * @method Album[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class AlbumRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Album::class);
    }

    /**
     * Trouve tous les albums, triés par nom
     */
    public function findAllOrderedByName()
    {
        return $this->createQueryBuilder('a')
            ->orderBy('a.nom_album', 'ASC')
            ->getQuery()
            ->getResult();
    }

    public function findAlbumsWithPhotoCounts(): array
    {
        return $this->createQueryBuilder('a')
            ->select('a.id', 'COUNT(p.id) AS photo_count')
            ->leftJoin('a.photos', 'p')
            ->groupBy('a.id')
            ->getQuery()
            ->getResult();
    }

    /**
     * Récupère tous les albums d'un utilisateur.
     *
     * @param \App\Entity\User $user
     * @return \Doctrine\ORM\QueryBuilder
     */
    public function findByCreator($user)
    {
        return $this->createQueryBuilder('a')
            ->where('a.creator = :user') // Filtrer par l'utilisateur connecté
            ->setParameter('user', $user)
            ->orderBy('a.nom_album', 'ASC');
    }
}
