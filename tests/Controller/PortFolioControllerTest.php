<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

class PortFolioControllerTest extends WebTestCase
{

    public function testIndex(): void
    {
        // Crée un client pour simuler les requêtes HTTP
        $client = static::createClient();

        // Accède à la route de l'accueil
        $crawler = $client->request('GET', '/');

        // Dump de la réponse pour inspecter l'HTML
        dump($client->getResponse()->getContent());

        // Vérifie que la requête est réussie (200 OK)
        $this->assertResponseIsSuccessful();

        // Vérifie la présence du titre principal
        $this->assertSelectorTextContains('h2', 'Bienvenue sur mon site');

        // Vérifie que l'élément "Albums photos" est bien présent
        $link = $crawler->selectLink('Albums photos');
        $this->assertNotNull($link, 'Le lien "Albums photos" est introuvable dans la page.');

        // Vous pouvez aussi vérifier le lien et sa cible
        $this->assertSame('/photos', $link->link()->getUri());
    }


    /*public function testIndex(): void
    {
        // Crée un client pour simuler les requêtes HTTP
        $client = static::createClient();

        // Accède à la route de l'accueil (assurez-vous que la route est correcte)
        $crawler = $client->request('GET', '/');

        // Dump de la réponse pour inspecter l'HTML
        dump($client->getResponse()->getContent());

        // Vérifie que la requête est réussie (200 OK)
        $this->assertResponseIsSuccessful();
        /*
                // Vérifie le titre de la page
                $this->assertSelectorTextContains('title', 'Mon Album Photo');

                // Vérifie le message principal
                $this->assertSelectorTextContains('h2', 'Bienvenue sur mon site, cliquez sur le lien de votre choix');

                // Vérifie que la liste contient bien les liens attendus
                $this->assertCount(3, $crawler->filter('ul > li > a')); // Vérifie qu'il y a 3 liens
                $this->assertSelectorTextContains('ul > li > a', 'Albums photos'); // Exemple d'un lien
        * /
        // Vérifie la présence du titre principal
        $this->assertSelectorTextContains('h2', 'Bienvenue sur mon site');

        // Vérifie la présence d'un lien "Photos" dans la liste
        $this->assertCount(1, $crawler->filter('ul > li > a:contains("Photos")'));
    }*/
}
