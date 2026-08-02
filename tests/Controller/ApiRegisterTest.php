<?php

namespace App\Tests\Controller;

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Vérifie les garde-fous de l'endpoint public /api/register : validation côté
 * serveur et limite de débit par adresse IP. Ces tests ne touchent pas la base
 * de données — tous les cas couverts sont rejetés avant le moindre accès aux
 * entités.
 *
 * Chaque test utilise une adresse IP unique : le compteur de débit est stocké
 * dans le cache applicatif, qui survit d'une exécution de la suite à l'autre.
 */
class ApiRegisterTest extends WebTestCase
{
    public function testMalformedJsonIsRejected(): void
    {
        $client = static::createClient();
        $this->postRegistration($client, 'pas du json');

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('invalid_payload', $this->responseCode($client));
    }

    public function testMissingFieldsAreRejected(): void
    {
        $client = static::createClient();
        $this->postRegistration($client, (string) json_encode(['username' => 'guillaume']));

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('missing_fields', $this->responseCode($client));
    }

    /**
     * La validation du composant React étant contournable, le serveur doit
     * refuser lui-même une adresse email malformée.
     */
    public function testInvalidEmailIsRejected(): void
    {
        $client = static::createClient();
        $this->postRegistration($client, (string) json_encode([
            'username' => 'guillaume',
            'email' => 'pas-une-adresse',
            'password' => 'motdepasse-solide',
        ]));

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('invalid_fields', $this->responseCode($client));
    }

    public function testShortPasswordIsRejected(): void
    {
        $client = static::createClient();
        $this->postRegistration($client, (string) json_encode([
            'username' => 'guillaume',
            'email' => 'guillaume@example.com',
            'password' => 'court',
        ]));

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('invalid_fields', $this->responseCode($client));
    }

    /**
     * Le scénario du bot : des appels répétés depuis la même adresse doivent
     * finir par être bloqués, faute de quoi chaque appel déclenche deux emails.
     */
    public function testRepeatedAttemptsFromSameIpAreRateLimited(): void
    {
        $client = static::createClient();
        $ip = $this->uniqueIp();
        $payload = (string) json_encode(['username' => 'guillaume', 'email' => 'pas-une-adresse', 'password' => 'court']);

        // Les 5 premières tentatives sont refusées sur le fond (400), pas sur le débit.
        for ($i = 0; $i < 5; ++$i) {
            $this->postRegistration($client, $payload, $ip);
            $this->assertResponseStatusCodeSame(400, sprintf('La tentative n°%d ne doit pas être limitée.', $i + 1));
        }

        $this->postRegistration($client, $payload, $ip);

        $this->assertResponseStatusCodeSame(429);
        $this->assertSame('rate_limited', $this->responseCode($client));
        $this->assertNotEmpty(
            $client->getResponse()->headers->get('Retry-After'),
            'Une réponse 429 doit indiquer au client quand réessayer.'
        );
    }

    private function postRegistration(KernelBrowser $client, string $body, ?string $ip = null): void
    {
        $client->request(
            'POST',
            '/api/register',
            [],
            [],
            [
                'CONTENT_TYPE' => 'application/json',
                'REMOTE_ADDR' => $ip ?? $this->uniqueIp(),
            ],
            $body
        );
    }

    private function responseCode(KernelBrowser $client): ?string
    {
        $payload = json_decode($client->getResponse()->getContent(), true);

        return is_array($payload) ? ($payload['code'] ?? null) : null;
    }

    /**
     * Adresse privée tirée au hasard dans 10.0.0.0/8 : le tirage sur trois octets
     * rend une collision avec un compteur laissé par une exécution précédente
     * négligeable.
     */
    private function uniqueIp(): string
    {
        return sprintf('10.%d.%d.%d', random_int(0, 255), random_int(0, 255), random_int(1, 254));
    }
}
