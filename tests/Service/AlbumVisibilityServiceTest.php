<?php

namespace App\Tests\Service;

use App\Entity\Album;
use App\Entity\Photo;
use App\Entity\User;
use App\Service\AlbumVisibilityService;
use Doctrine\ORM\EntityManagerInterface;
use Doctrine\ORM\EntityRepository;
use PHPUnit\Framework\TestCase;

/**
 * Couvre la matrice de permissions du site : qui a le droit de voir quel album
 * et quelles photos. C'est le cœur sécurité de l'application — une régression
 * ici exposerait des albums privés à des visiteurs anonymes.
 *
 * Aucun accès à la base : l'EntityManager est simulé, les entités sont
 * construites à la main.
 */
class AlbumVisibilityServiceTest extends TestCase
{
    /* ------------------------------------------------------------------
       canAccessAlbum() — ouverture d'un album précis
       ------------------------------------------------------------------ */

    public function testPublicAlbumIsAccessibleToAnonymous(): void
    {
        $album = $this->makeAlbum($this->makeUser(), true, true);

        $this->assertTrue(
            $this->service()->canAccessAlbum($album, null),
            'Un album visible ET approuvé doit être ouvert à tout le monde.'
        );
    }

    /**
     * @dataProvider nonPublicAlbumStates
     */
    public function testNonPublicAlbumIsClosedToAnonymous(bool $isVisible, bool $isApproved): void
    {
        $album = $this->makeAlbum($this->makeUser(), $isVisible, $isApproved);

        $this->assertFalse(
            $this->service()->canAccessAlbum($album, null),
            'Un anonyme ne doit jamais ouvrir un album non public.'
        );
    }

    public function nonPublicAlbumStates(): array
    {
        return [
            'non visible mais approuvé' => [false, true],
            'visible mais non approuvé' => [true, false],
            'ni visible ni approuvé'    => [false, false],
        ];
    }

    public function testOwnerAlwaysAccessesOwnAlbum(): void
    {
        $owner = $this->makeUser();
        $album = $this->makeAlbum($owner, false, false);

        $this->assertTrue(
            $this->service()->canAccessAlbum($album, $owner),
            'Le propriétaire doit accéder à son album même non publié.'
        );
    }

    public function testPlainUserCannotAccessSomeoneElsePrivateAlbum(): void
    {
        $album = $this->makeAlbum($this->makeUser(), false, false);

        $this->assertFalse(
            $this->service()->canAccessAlbum($album, $this->makeUser()),
            'Un utilisateur simple ne doit pas ouvrir l\'album privé d\'un autre.'
        );
    }

    public function testSuperAdminAccessesEverything(): void
    {
        $album = $this->makeAlbum($this->makeUser(['ROLE_ADMIN']), false, false);

        $this->assertTrue(
            $this->service()->canAccessAlbum($album, $this->makeUser(['ROLE_SUPER_ADMIN'])),
            'Le super-admin doit tout ouvrir, y compris l\'album privé d\'un admin.'
        );
    }

    public function testAdminAccessesPlainUserAlbumButNotAnotherAdminAlbum(): void
    {
        $admin = $this->makeUser(['ROLE_ADMIN']);
        $service = $this->service();

        $this->assertTrue(
            $service->canAccessAlbum($this->makeAlbum($this->makeUser(), false, false), $admin),
            'Un admin doit pouvoir ouvrir l\'album privé d\'un utilisateur simple.'
        );

        $this->assertFalse(
            $service->canAccessAlbum($this->makeAlbum($this->makeUser(['ROLE_ADMIN']), false, false), $admin),
            'Un admin ne doit pas ouvrir l\'album privé d\'un autre admin.'
        );
    }

    /* ------------------------------------------------------------------
       getVisibleAlbumsFor() — liste des albums (/photos)
       ------------------------------------------------------------------ */

    public function testAnonymousListContainsOnlyPublicAlbums(): void
    {
        $public  = $this->makeAlbum($this->makeUser(), true, true);
        $private = $this->makeAlbum($this->makeUser(), false, true);

        $visible = $this->serviceWithAlbums([$public, $private])->getVisibleAlbumsFor(null);

        $this->assertSame([$public], $visible, 'Un anonyme ne doit voir que les albums publics.');
    }

    public function testPlainUserSeesPublicAlbumsPlusHisOwn(): void
    {
        $user    = $this->makeUser();
        $public  = $this->makeAlbum($this->makeUser(), true, true);
        $mine    = $this->makeAlbum($user, false, false);
        $other   = $this->makeAlbum($this->makeUser(), false, false);

        $visible = $this->serviceWithAlbums([$public, $mine, $other])->getVisibleAlbumsFor($user);

        $this->assertContains($public, $visible, 'Les albums publics restent visibles.');
        $this->assertContains($mine, $visible, 'Ses propres albums non publiés doivent apparaître.');
        $this->assertNotContains($other, $visible, 'Les albums privés des autres doivent rester cachés.');
    }

    public function testReturnedListIsReindexed(): void
    {
        $public  = $this->makeAlbum($this->makeUser(), true, true);
        $private = $this->makeAlbum($this->makeUser(), false, false);

        // L'album filtré est en première position : sans array_values() les clés
        // seraient trouées et le JSON produirait un objet au lieu d'un tableau.
        $visible = $this->serviceWithAlbums([$private, $public])->getVisibleAlbumsFor(null);

        $this->assertSame([0], array_keys($visible), 'La liste doit être réindexée à partir de 0.');
    }

    /* ------------------------------------------------------------------
       getVisiblePhotosFor() — photos d'un album
       ------------------------------------------------------------------ */

    public function testAnonymousSeesOnlyApprovedAndVisiblePhotos(): void
    {
        $album     = $this->makeAlbum($this->makeUser(), true, true);
        $published = $this->addPhoto($album, true, true);
        $pending   = $this->addPhoto($album, true, false);
        $hidden    = $this->addPhoto($album, false, true);

        $photos = $this->service()->getVisiblePhotosFor($album, null);

        $this->assertSame([$published], $photos, 'Seule la photo visible ET approuvée doit sortir.');
        $this->assertNotContains($pending, $photos);
        $this->assertNotContains($hidden, $photos);
    }

    public function testOwnerSeesHisUnpublishedPhotos(): void
    {
        $owner = $this->makeUser();
        $album = $this->makeAlbum($owner, true, true);
        $this->addPhoto($album, false, false);

        $this->assertCount(
            1,
            $this->service()->getVisiblePhotosFor($album, $owner),
            'Le propriétaire doit voir ses photos même non publiées.'
        );
    }

    /**
     * Régression : la comparaison « creator === user » valait « null === null »
     * pour un album sans créateur consulté par un anonyme, ce qui exposait
     * toutes les photos non approuvées.
     */
    public function testAnonymousSeesNothingHiddenInAlbumWithoutCreator(): void
    {
        $album = new Album();          // aucun créateur défini
        $album->setIsVisible(true)->setIsApproved(true);
        $published = $this->addPhoto($album, true, true);
        $this->addPhoto($album, false, false);

        $photos = $this->service()->getVisiblePhotosFor($album, null);

        $this->assertSame(
            [$published],
            $photos,
            'Un album sans créateur ne doit jamais exposer ses photos non publiées à un anonyme.'
        );
    }

    public function testPhotoWithoutAlbumDoesNotCrashForAnonymous(): void
    {
        $album = $this->makeAlbum($this->makeUser(), true, true);
        $orphan = $this->addPhoto($album, false, false);
        $orphan->setAlbum(null);       // photo détachée de son album

        $this->assertSame(
            [],
            $this->service()->getVisiblePhotosFor($album, null),
            'Une photo détachée ne doit ni planter ni être exposée.'
        );
    }

    public function testSuperAdminSeesAllPhotos(): void
    {
        $album = $this->makeAlbum($this->makeUser(), true, true);
        $this->addPhoto($album, false, false);
        $this->addPhoto($album, true, true);

        $this->assertCount(
            2,
            $this->service()->getVisiblePhotosFor($album, $this->makeUser(['ROLE_SUPER_ADMIN'])),
            'Le super-admin doit voir toutes les photos de l\'album.'
        );
    }

    /* ------------------------------------------------------------------
       updateAlbumVisibility() — cascade album -> photos
       ------------------------------------------------------------------ */

    public function testHidingAlbumHidesEveryPhoto(): void
    {
        $album    = $this->makeAlbum($this->makeUser(), true, true);
        $approved = $this->addPhoto($album, true, true);
        $pending  = $this->addPhoto($album, true, false);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->expects($this->once())->method('flush');

        (new AlbumVisibilityService($em))->updateAlbumVisibility($album, false);

        $this->assertFalse($album->getIsVisible(), 'L\'album doit devenir invisible.');
        $this->assertFalse($approved->getIsVisible(), 'Masquer l\'album masque ses photos approuvées.');
        $this->assertFalse($pending->getIsVisible(), 'Masquer l\'album masque aussi les photos en attente.');
    }

    public function testShowingAlbumRepublishesOnlyApprovedPhotos(): void
    {
        $album    = $this->makeAlbum($this->makeUser(), false, true);
        $approved = $this->addPhoto($album, false, true);
        $pending  = $this->addPhoto($album, false, false);

        $this->service()->updateAlbumVisibility($album, true);

        $this->assertTrue($album->getIsVisible(), 'L\'album doit redevenir visible.');
        $this->assertTrue($approved->getIsVisible(), 'Une photo approuvée doit être republiée.');
        $this->assertFalse(
            $pending->getIsVisible(),
            'Une photo non approuvée ne doit JAMAIS être republiée en rendant l\'album visible.'
        );
    }

    /* ------------------------------------------------------------------
       Fabriques
       ------------------------------------------------------------------ */

    private function service(): AlbumVisibilityService
    {
        return new AlbumVisibilityService($this->createMock(EntityManagerInterface::class));
    }

    /**
     * Service dont le dépôt d'albums renvoie la liste fournie.
     *
     * @param Album[] $albums
     */
    private function serviceWithAlbums(array $albums): AlbumVisibilityService
    {
        $repository = $this->createMock(EntityRepository::class);
        $repository->method('findAll')->willReturn($albums);

        $em = $this->createMock(EntityManagerInterface::class);
        $em->method('getRepository')->willReturn($repository);

        return new AlbumVisibilityService($em);
    }

    private function makeUser(array $roles = []): User
    {
        return (new User())->setRoles($roles);
    }

    private function makeAlbum(User $creator, bool $isVisible, bool $isApproved): Album
    {
        return (new Album())
            ->setCreator($creator)
            ->setIsVisible($isVisible)
            ->setIsApproved($isApproved);
    }

    private function addPhoto(Album $album, bool $isVisible, bool $isApproved): Photo
    {
        $photo = (new Photo())
            ->setIsVisible($isVisible)
            ->setIsApproved($isApproved);

        $album->addPhoto($photo);

        return $photo;
    }
}
