<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Vérifie que les zones protégées ne sont PAS accessibles à un visiteur anonyme :
 * il doit être redirigé vers la page de connexion. Couvre l'upload de photo et
 * l'accès aux espaces d'administration. Ne touche pas la base de données
 * (le contrôle d'accès du firewall agit avant tout accès aux entités).
 */
class AccessControlTest extends WebTestCase
{
    /**
     * @dataProvider protectedUrls
     */
    public function testAnonymousIsRedirectedToLogin(string $url): void
    {
        $client = static::createClient();
        $client->request('GET', $url);

        $this->assertResponseRedirects();

        $location = (string) $client->getResponse()->headers->get('Location');
        $this->assertStringContainsString(
            'login',
            $location,
            sprintf('Un anonyme sur "%s" doit être renvoyé vers la connexion (Location: %s).', $url, $location)
        );
    }

    public function protectedUrls(): array
    {
        return [
            'upload de photo (ROLE_USER)'   => ['/photo/upload'],
            'dashboard (ROLE_ADMIN)'        => ['/dashboard'],
            'références (ROLE_SUPER_ADMIN)' => ['/reference'],
        ];
    }
}
