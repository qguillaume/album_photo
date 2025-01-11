<?php

// src/Entity/Theme.php

namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;

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
     * @ORM\Column(type="string", length=255)
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
        $this->name = $name;

        return $this;
    }

    // Pour afficher le nom du thème dans un select
    public function __toString(): string
    {
        return $this->name;
    }
}
