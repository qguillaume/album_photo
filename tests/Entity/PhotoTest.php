<?php

namespace App\Tests\Entity;

use App\Entity\Album;
use App\Entity\Comment;
use App\Entity\Like;
use App\Entity\Photo;
use PHPUnit\Framework\TestCase;

/**
 * Vérifie les relations bidirectionnelles de Photo (likes, commentaires, album)
 * et les compteurs affichés sur la galerie. Ces méthodes portent la logique
 * « ajouter deux fois ne compte qu'une fois » : sans elle, un double-clic sur
 * le bouton J'aime fausserait les compteurs.
 */
class PhotoTest extends TestCase
{
    public function testNewPhotoHasNoLikeAndNoComment(): void
    {
        $photo = new Photo();

        $this->assertSame(0, $photo->getLikesCount(), 'Une photo neuve n\'a aucun j\'aime.');
        $this->assertSame(0, $photo->getCommentsCount(), 'Une photo neuve n\'a aucun commentaire.');
    }

    public function testAddLikeSetsBothSidesOfRelation(): void
    {
        $photo = new Photo();
        $like  = new Like();

        $photo->addLike($like);

        $this->assertSame(1, $photo->getLikesCount(), 'Le j\'aime doit être compté.');
        $this->assertSame($photo, $like->getPhoto(), 'Le côté inverse de la relation doit être renseigné.');
    }

    public function testAddingSameLikeTwiceCountsOnce(): void
    {
        $photo = new Photo();
        $like  = new Like();

        $photo->addLike($like);
        $photo->addLike($like);

        $this->assertSame(1, $photo->getLikesCount(), 'Un même j\'aime ne doit jamais être compté deux fois.');
    }

    public function testRemoveLikeDetachesRelation(): void
    {
        $photo = new Photo();
        $like  = new Like();
        $photo->addLike($like);

        $photo->removeLike($like);

        $this->assertSame(0, $photo->getLikesCount(), 'Le j\'aime retiré ne doit plus être compté.');
        $this->assertNull($like->getPhoto(), 'Le côté inverse doit être remis à null.');
    }

    public function testRemovingUnknownLikeIsHarmless(): void
    {
        $photo = new Photo();
        $photo->addLike($known = new Like());

        $photo->removeLike(new Like());

        $this->assertSame(1, $photo->getLikesCount(), 'Retirer un j\'aime absent ne doit rien casser.');
        $this->assertSame($photo, $known->getPhoto(), 'Le j\'aime existant doit rester attaché.');
    }

    public function testAddCommentSetsBothSidesAndCountsOnce(): void
    {
        $photo   = new Photo();
        $comment = new Comment();

        $photo->addComment($comment);
        $photo->addComment($comment);

        $this->assertSame(1, $photo->getCommentsCount(), 'Un même commentaire ne doit être compté qu\'une fois.');
        $this->assertSame($photo, $comment->getPhoto(), 'Le côté inverse de la relation doit être renseigné.');
    }

    public function testRemoveCommentDetachesRelation(): void
    {
        $photo   = new Photo();
        $comment = new Comment();
        $photo->addComment($comment);

        $photo->removeComment($comment);

        $this->assertSame(0, $photo->getCommentsCount(), 'Le commentaire retiré ne doit plus être compté.');
        $this->assertNull($comment->getPhoto(), 'Le côté inverse doit être remis à null.');
    }

    public function testAlbumAddPhotoLinksBothSides(): void
    {
        $album = new Album();
        $photo = new Photo();

        $album->addPhoto($photo);
        $album->addPhoto($photo);

        $this->assertCount(1, $album->getPhotos(), 'La même photo ne doit pas être ajoutée deux fois à l\'album.');
        $this->assertSame($album, $photo->getAlbum(), 'La photo doit connaître son album.');
    }
}
