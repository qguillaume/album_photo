<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 */
class User implements UserInterface, PasswordAuthenticatedUserInterface
{

    public function __construct()
    {
        $this->roles = ['ROLE_USER']; // Rôle par défaut
    }

    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $username;

    /**
     * @ORM\Column(type="string")
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     */
    private $email;

    public function getId(): ?int
    {
        return $this->id;
    }

    // Getters et Setters pour username, password, etc.

    public function getUsername(): string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    public function getPassword(): string
    {
        return $this->password;
    }

    public function setPassword(string $password): self
    {
        $this->password = $password;

        return $this;
    }

    public function getEmail(): string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    /**
     * @ORM\Column(type="json")
     */
    private array $roles = [];

    // Getter
    public function getRoles(): array
    {
        $roles = $this->roles;

        // Chaque utilisateur a au moins ROLE_USER (cela n'ajoute pas ROLE_USER dans les rôles mais les users auront quand même le role)
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    // Setter
    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function eraseCredentials()
    {
        // Aucune donnée sensible à effacer ici
    }

    public function getSalt(): ?string
    {
        // Retourne null car bcrypt ne nécessite pas de salt supplémentaire
        return null;
    }
}
