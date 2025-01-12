<?php

// src/Entity/Article.php
namespace App\Entity;

use Doctrine\ORM\Mapping as ORM;
use Symfony\Component\Validator\Constraints as Assert;
use Symfony\Component\HttpFoundation\File\File;
use Symfony\Component\Serializer\Annotation\Groups;
use App\Repository\ArticleRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Entity(repositoryClass=ArticleRepository::class)
 */
class Article
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     * @Groups("article_read")
     */
    private ?int $id = null;

    /**
     * @ORM\Column(type="string", length=60)
     * @Assert\NotBlank(message="Le titre ne peut pas être vide.")
     * @Assert\Length(max=60, maxMessage="Le titre ne peut pas excéder 60 caractères.")
     * @Groups("article_read")
     */
    private string $title;

    /**
     * @ORM\Column(type="text")
     * @Assert\NotBlank(message="Le contenu ne peut pas être vide.")
     * @Assert\Length(max=20000, maxMessage="Le contenu de l'article ne peut pas dépasser 20 000 caractères.")
     * @Groups("article_read")
     */
    private string $content;

    /**
     * @ORM\Column(type="boolean")
     * @Groups("article_read")
     */
    private bool $published;

    /**
     * @ORM\Column(type="datetime")
     * @Groups("article_read")
     */
    private \DateTimeInterface $createdAt;

    /**
     * @ORM\Column(type="datetime", nullable=true)
     * @Groups("article_read")
     */
    private ?\DateTimeInterface $updatedAt = null;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="articles")
     * @ORM\JoinColumn(nullable=false)
     * @Assert\NotNull(message="L'auteur est obligatoire.")
     */
    private User $author;

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\Theme", inversedBy="articles")
     * @ORM\JoinColumn(nullable=true)
     * @Groups("article_read")
     */
    private ?Theme $theme = null;

    public function __construct()
    {
        $this->createdAt = new \DateTime();
        $this->published = false; // Par défaut, l'article n'est pas publié
    }

    // Getters et setters pour tous les champs
    public function getId(): ?int
    {
        return $this->id;
    }

    public function getTitle(): string
    {
        return $this->title;
    }

    public function setTitle(string $title): self
    {
        $this->title = $title;
        return $this;
    }

    public function getContent(): string
    {
        return $this->content;
    }

    public function setContent(string $content): self
    {
        $this->content = $content;
        return $this;
    }

    public function isPublished(): bool
    {
        return $this->published;
    }

    public function setPublished(bool $published): self
    {
        $this->published = $published;
        return $this;
    }

    public function getCreatedAt(): \DateTimeInterface
    {
        return $this->createdAt;
    }

    public function setCreatedAt(\DateTimeInterface $createdAt): self
    {
        $this->createdAt = $createdAt;
        return $this;
    }

    public function getUpdatedAt(): ?\DateTimeInterface
    {
        return $this->updatedAt;
    }

    public function setUpdatedAt(?\DateTimeInterface $updatedAt): self
    {
        $this->updatedAt = $updatedAt;
        return $this;
    }

    /**
     * @ORM\PrePersist
     * @ORM\PreUpdate
     */
    public function updateTimestamps(): void
    {
        if ($this->updatedAt === null) {
            $this->updatedAt = new \DateTime();
        }
    }

    public function getAuthor(): User
    {
        return $this->author;
    }

    public function setAuthor(User $author): self
    {
        $this->author = $author;
        return $this;
    }

    public function getTheme(): ?Theme
    {
        return $this->theme;
    }

    public function setTheme(?Theme $theme): self
    {
        $this->theme = $theme;
        return $this;
    }
}
