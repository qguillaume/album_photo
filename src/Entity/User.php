<?php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\User\PasswordAuthenticatedUserInterface;
use Symfony\Component\Validator\Constraints as Assert; // Import des contraintes Symfony Validator

/**
 * @ORM\Entity(repositoryClass="App\Repository\UserRepository")
 */
class User implements UserInterface, PasswordAuthenticatedUserInterface
{
    public function __construct()
    {
        $this->roles = ['ROLE_USER']; // Rôle par défaut
        $this->isBanned = false; // Par défaut, l'utilisateur n'est pas banni
    }

    /**
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="AUTO")
     * @ORM\Column(type="integer")
     */
    private $id;

    /**
     * @ORM\Column(type="string", length=30, unique=true)
     * @Assert\NotBlank(message="Le nom d'utilisateur ne doit pas être vide.")
     * @Assert\Length(
     *     max=30,
     *     maxMessage="Le nom d'utilisateur ne doit pas dépasser {{ limit }} caractères."
     * )
     */
    private $username;

    /**
     * @ORM\Column(type="string")
     * @Assert\NotBlank(message="Le mot de passe ne doit pas être vide.")
     * @Assert\Length(
     *     min=8,
     *     max=64,
     *     minMessage="Le mot de passe doit comporter au moins {{ limit }} caractères.",
     *     maxMessage="Le mot de passe ne doit pas dépasser {{ limit }} caractères."
     * )
     */
    private $password;

    /**
     * @ORM\Column(type="string", length=180, unique=true)
     * @Assert\NotBlank(message="L'email ne doit pas être vide.")
     * @Assert\Email(message="Veuillez fournir une adresse email valide.")
     * @Assert\Length(
     *     max=180,
     *     maxMessage="L'adresse email ne doit pas dépasser {{ limit }} caractères."
     * )
     */
    private $email;

    /**
     * @ORM\Column(type="boolean")
     */
    private $isBanned = false; // Nouvelle propriété ajoutée pour l'état "banni"

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
    private array $roles = []; // Stockage des rôles utilisateur sous forme de tableau JSON

    // Getter
    public function getRoles(): array
    {
        $roles = $this->roles;
        // Chaque utilisateur a au moins ROLE_USER
        $roles[] = 'ROLE_USER';
        return array_unique($roles);
    }

    // Setter
    public function setRoles(array $roles): self
    {
        $this->roles = $roles;
        return $this;
    }

    // Getter pour l'état "banni"
    public function getIsBanned(): bool
    {
        return $this->isBanned;
    }

    // Setter pour l'état "banni"
    public function setIsBanned(bool $isBanned): self
    {
        $this->isBanned = $isBanned;
        return $this;
    }

    public function eraseCredentials()
    {
        // Aucune donnée sensible à effacer ici
    }

    public function getSalt(): ?string
    {
        return null; // bcrypt ne nécessite pas de salt
    }
}
