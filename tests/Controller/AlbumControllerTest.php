<?php
// tests/Controller/AlbumControllerTest.php
namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use App\Entity\Album;
use Doctrine\ORM\EntityManagerInterface;

class AlbumControllerTest extends WebTestCase
{
    public function testNewAlbumCreation()
    {
        /*$client = static::createClient();

        // Effectuer une requête GET pour afficher le formulaire de création
        $client->request('GET', '/album/new');
        $this->assertResponseIsSuccessful();
        $this->assertSelectorTextContains('h1', 'Créer un nouvel album');

        // Soumettre le formulaire
        $file = new UploadedFile(
            __DIR__ . '/../Fixtures/photo.jpg', // Remplacer par le chemin vers une image de test
            'photo.jpg',
            'image/jpeg',
            null,
            true
        );
        $client->submitForm('Créer l\'album', [
            'album[name]' => 'Album Test',
            'album[image_path]' => $file,
        ]);

        // Vérifier si l'album a été bien créé
        $em = self::$container->get(EntityManagerInterface::class);
        $album = $em->getRepository(Album::class)->findOneBy(['name' => 'Album Test']);
        $this->assertNotNull($album);
        $this->assertSame('Album Test', $album->getName());*/
    }
}