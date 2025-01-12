<?php

// src/Entity/Theme.php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;

/**
 * @ORM\Entity(repositoryClass="App\Repository\ThemeRepository")
 * @ORM\Table(name="theme", uniqueConstraints={@ORM\UniqueConstraint(name="unique_theme_name", columns={"name"})})
 */
class Theme
{
    // Id du thème
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private $id;

    // Nom du thème
    /**
     * @ORM\Column(type="string", length=30)
     * @Assert\Length(max=30, maxMessage="Le nom du thème ne peut pas dépasser 30 caractères.")
     */
    private $name;

    // Getters et setters
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = trim($name);
        return $this;
    }

    // Pour afficher le nom du thème dans un select
    public function __toString(): string
    {
        return $this->name;
    }
}
