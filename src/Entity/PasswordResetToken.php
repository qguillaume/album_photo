<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Ramsey\Uuid\Uuid;

/**
 * @ORM\Entity
 */
class PasswordResetToken
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", unique=true)
     */
    private $token;

    /**
     * @ORM\Column(type="datetime")
     */
    private $expiresAt;

    /**
     * @ORM\Column(type="string")
     */
    private $email;

    public function __construct(string $email)
    {
        $this->email = $email;
        $this->token = Uuid::uuid4()->toString(); // Génération d'un UUID v4
        $this->expiresAt = new \DateTime('+1 hour');
    }

    public function getToken(): string
    {
        return $this->token;
    }

    public function isExpired(): bool
    {
        return $this->expiresAt < new \DateTime();
    }

    public function getEmail(): string
    {
        return $this->email;
    }
}
