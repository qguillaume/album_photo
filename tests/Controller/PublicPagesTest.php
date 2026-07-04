<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Smoke tests des pages publiques : elles doivent répondre 200 sans authentification.
 * Ces tests ne touchent pas la base de données (rendu de formulaires uniquement).
 */
class PublicPagesTest extends WebTestCase
{
    public function testHomePageIsSuccessful(): void
    {
        $client = static::createClient();
        $client->request('GET', '/');

        $this->assertResponseIsSuccessful();
    }

    public function testLoginPageShowsPasswordField(): void
    {
        $client = static::createClient();
        $client->request('GET', '/login');

        $this->assertResponseIsSuccessful();
        $this->assertSelectorExists('input[type="password"]', 'La page de login doit contenir un champ mot de passe.');
    }

    public function testRegisterPageIsSuccessful(): void
    {
        $client = static::createClient();
        $client->request('GET', '/register');

        $this->assertResponseIsSuccessful();
    }
}
