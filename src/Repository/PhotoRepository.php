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
}
