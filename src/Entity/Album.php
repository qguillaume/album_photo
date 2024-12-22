<?php
// src/Entity/Album.php
namespace App\Entity;

use App\Repository\AlbumRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;

/**
 * @ORM\Entity(repositoryClass="App\Repository\AlbumRepository")
 */
class Album
{
    /**
     * @ORM\Id
     * @ORM\GeneratedValue
     * @ORM\Column(type="integer")
     */
    private ?int $id = null;

    /**
     * @ORM\Column(type="string", length=255)
     */
    private ?string $nom_album = null;

    /**
     * @ORM\OneToMany(targetEntity="App\Entity\Photo", mappedBy="album", cascade={"persist", "remove"})
     */
    private Collection $photos;

    public function __construct()
    {
        $this->photos = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getNomAlbum(): ?string
    {
        return $this->nom_album;
    }

    public function setNomAlbum(string $nom_album): self
    {
        $this->nom_album = $nom_album;

        return $this;
    }

    public function getPhotos(): Collection
    {
        return $this->photos;
    }

    /**
     * @ORM\Column(type="string", length=255, nullable=true)
     */
    private ?string $imagePath = null;

    public function getImagePath(): ?string
    {
        return $this->imagePath;
    }

    public function setImagePath(?string $imagePath): self
    {
        $this->imagePath = $imagePath;
        return $this;
    }
}