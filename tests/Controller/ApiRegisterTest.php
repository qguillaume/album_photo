<?php

namespace App\Tests\Controller;

use Psr\Cache\CacheItemPoolInterface;
use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Vérifie les garde-fous de l'endpoint public /api/register : validation côté
 * serveur et limite de débit. Ces tests ne touchent pas la base de données —
 * tous les cas couverts sont rejetés avant le moindre accès aux entités.
 *
 * Les compteurs de débit vivent dans le cache applicatif, qui survit d'une
 * exécution à l'autre : chaque test repart donc d'un cache vidé.
 */
class ApiRegisterTest extends WebTestCase
{
    public function testMalformedJsonIsRejected(): void
    {
        $client = $this->createClientWithFreshCounters();
        $this->postRegistration($client, 'pas du json');

        $this->assertResponseStatusCodeSame(400);
        $this->assertSame('invalid_payload', $this->responseCode($client));
    }

    public function testMissingFieldsAreRejected(): void
    {
        $client = $this->createClientWithFreshCounters();
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
        $client = $this->createClientWithFreshCounters();
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
        $client = $this->createClientWithFreshCounters();
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
    public function testRepeatedAttemptsFromSameVisitorAreRateLimited(): void
    {
        $client = $this->createClientWithFreshCounters();

        // Les 5 premières tentatives sont refusées sur le fond (400), pas sur le débit.
        for ($i = 0; $i < 5; ++$i) {
            $this->postRegistration($client, $this->rejectedPayload(), '198.51.100.10');
            $this->assertResponseStatusCodeSame(400, sprintf('La tentative n°%d ne doit pas être limitée.', $i + 1));
        }

        $this->postRegistration($client, $this->rejectedPayload(), '198.51.100.10');

        $this->assertResponseStatusCodeSame(429);
        $this->assertSame('rate_limited', $this->responseCode($client));
        $this->assertNotEmpty(
            $client->getResponse()->headers->get('Retry-After'),
            'Une réponse 429 doit indiquer au client quand réessayer.'
        );
    }

    /**
     * Régression : sur l'hébergement mutualisé, toutes les requêtes arrivent
     * avec l'adresse du répartiteur de charge et la véritable adresse du
     * visiteur se trouve dans X-Forwarded-For. Si le compteur s'appuyait sur
     * l'adresse vue par PHP, le bot du premier visiteur fermerait le
     * formulaire à tous les autres.
     */
    public function testVisitorsBehindTheSameProxyDoNotBlockEachOther(): void
    {
        $client = $this->createClientWithFreshCounters();

        // Un premier visiteur épuise son quota.
        for ($i = 0; $i < 6; ++$i) {
            $this->postRegistration($client, $this->rejectedPayload(), '198.51.100.20');
        }
        $this->assertResponseStatusCodeSame(429, 'Le premier visiteur doit bien être bloqué.');

        // Un second visiteur, derrière le même répartiteur, doit rester libre.
        $this->postRegistration($client, $this->rejectedPayload(), '198.51.100.21');

        $this->assertResponseStatusCodeSame(
            400,
            "L'adresse du répartiteur est commune à tous : le blocage d'un visiteur ne doit pas atteindre les autres."
        );
    }

    /**
     * Charge utile toujours refusée sur le fond : aucun compte n'est créé et
     * aucun email n'est envoyé, seul le compteur de débit progresse.
     */
    private function rejectedPayload(): string
    {
        return (string) json_encode(['username' => 'guillaume']);
    }

    private function postRegistration(KernelBrowser $client, string $body, ?string $visitorIp = null): void
    {
        $server = ['CONTENT_TYPE' => 'application/json'];

        if (null !== $visitorIp) {
            // Reproduit ce que pose le répartiteur de charge de l'hébergeur :
            // REMOTE_ADDR reste son adresse à lui (127.0.0.1 par défaut ici).
            $server['HTTP_X_FORWARDED_FOR'] = $visitorIp;
        }

        $client->request('POST', '/api/register', [], [], $server, $body);
    }

    private function responseCode(KernelBrowser $client): ?string
    {
        $payload = json_decode((string) $client->getResponse()->getContent(), true);

        return is_array($payload) ? ($payload['code'] ?? null) : null;
    }

    private function createClientWithFreshCounters(): KernelBrowser
    {
        $client = static::createClient();

        /** @var CacheItemPoolInterface $cache */
        $cache = static::getContainer()->get('cache.app');
        $cache->clear();

        return $client;
    }
}
