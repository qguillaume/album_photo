<?php
// src/Entity/Album.php
namespace App\Entity;

use App\Repository\AlbumRepository;
use Doctrine\ORM\Mapping as ORM;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Symfony\Component\Validator\Constraints as Assert;
use Doctrine\ORM\Mapping\UniqueConstraint;

/**
 * @ORM\Entity(repositoryClass="App\Repository\AlbumRepository")
 * @ORM\Table(name="album", uniqueConstraints={
 *     @UniqueConstraint(name="unique_album_user", columns={"nom_album", "creator_id"})
 * })
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
     * @ORM\Column(type="string", length=60)
     * @Assert\Length(max=60, maxMessage="Le nom de l'album ne peut pas excéder 60 caractères.")
     * @Assert\NotBlank(message="Le nom de l'album est requis.")
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
        $this->nom_album = trim($nom_album);  // Enlever les espaces avant et après
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

    /**
     * @ORM\Column(type="integer", options={"default": 0})
     */
    private $photoCount = 0;

    public function getPhotoCount(): ?int
    {
        return $this->photoCount;
    }

    public function setPhotoCount(int $photoCount): self
    {
        $this->photoCount = $photoCount;

        return $this;
    }

    /**
     * @ORM\ManyToOne(targetEntity="App\Entity\User", inversedBy="albums")
     * @ORM\JoinColumn(nullable=false)
     */
    private ?User $creator = null;

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    public function addPhoto(Photo $photo): self
    {
        if (!$this->photos->contains($photo)) {
            $this->photos[] = $photo;
            $photo->setAlbum($this);
        }

        return $this;
    }
}