<?php

namespace App\Tests\Entity;

use App\Entity\User;
use PHPUnit\Framework\TestCase;

/**
 * getRoles() est la source de vérité des permissions (AlbumVisibilityService
 * s'appuie dessus plutôt que sur le JSON stocké en base). Ces tests figent son
 * contrat : ROLE_USER toujours présent, aucun doublon, et un test d'appartenance
 * fiable via in_array().
 */
class UserTest extends TestCase
{
    public function testEveryUserHasRoleUser(): void
    {
        $this->assertContains(
            'ROLE_USER',
            (new User())->getRoles(),
            'Tout utilisateur doit avoir au moins ROLE_USER.'
        );
    }

    public function testGrantedRolesAreKept(): void
    {
        $roles = (new User())->setRoles(['ROLE_ADMIN'])->getRoles();

        $this->assertContains('ROLE_ADMIN', $roles, 'Le rôle attribué doit être conservé.');
        $this->assertContains('ROLE_USER', $roles, 'ROLE_USER doit rester ajouté automatiquement.');
    }

    public function testRolesAreNeverDuplicated(): void
    {
        $roles = (new User())->setRoles(['ROLE_USER', 'ROLE_ADMIN', 'ROLE_ADMIN'])->getRoles();

        $this->assertSame(
            array_values($roles),
            array_values(array_unique($roles)),
            'getRoles() ne doit jamais renvoyer de doublon.'
        );
    }

    public function testRoleCheckUsedByPermissionsIsReliable(): void
    {
        $admin = (new User())->setRoles(['ROLE_ADMIN']);

        $this->assertTrue(in_array('ROLE_ADMIN', $admin->getRoles(), true));
        $this->assertFalse(
            in_array('ROLE_SUPER_ADMIN', $admin->getRoles(), true),
            'Un admin ne doit pas être confondu avec un super-admin.'
        );
    }

    public function testSettingRolesIsIdempotent(): void
    {
        $user = (new User())->setRoles(['ROLE_ADMIN'])->setRoles(['ROLE_SUPER_ADMIN']);

        $this->assertContains('ROLE_SUPER_ADMIN', $user->getRoles(), 'Le dernier rôle défini doit s\'appliquer.');
        $this->assertNotContains('ROLE_ADMIN', $user->getRoles(), 'L\'ancien rôle ne doit pas persister.');
    }
}
