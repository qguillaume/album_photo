<?php

namespace App\Twig;

use App\Entity\Photo;
use App\Service\ImageOptimizer;
use Twig\Extension\AbstractExtension;
use Twig\TwigFunction;

class AppExtension extends AbstractExtension
{
    private string $photosDirectory;

    public function __construct(string $photosDirectory)
    {
        $this->photosDirectory = $photosDirectory;
    }

    public function getFunctions(): array
    {
        return [
            new TwigFunction('photo_thumb', [$this, 'photoThumb']),
        ];
    }

    /**
     * Renvoie le chemin web (relatif à public/) de la miniature d'une photo.
     * Si la miniature n'existe pas encore sur le disque (anciennes photos
     * uploadées avant la génération de miniatures), on retombe sur l'original.
     */
    public function photoThumb(Photo $photo): string
    {
        $creatorId = $photo->getAlbum()->getCreator()->getId();
        $albumName = $photo->getAlbum()->getNomAlbum();
        $file = $photo->getFilePath();

        $webBase = 'uploads/photos/' . $creatorId . '/' . $albumName . '/';
        $diskThumb = $this->photosDirectory . '/' . $creatorId . '/' . $albumName
            . '/' . ImageOptimizer::THUMBNAIL_DIR . '/' . $file;

        if (is_file($diskThumb)) {
            // Anti-cache : la date de modification change à chaque rotation, ce qui
            // force le navigateur à recharger la vignette au lieu de garder l'ancienne
            // (sinon la photo pivotée n'apparaît qu'après un Ctrl+F5).
            return $webBase . ImageOptimizer::THUMBNAIL_DIR . '/' . $file . '?v=' . filemtime($diskThumb);
        }

        $diskOriginal = $this->photosDirectory . '/' . $creatorId . '/' . $albumName . '/' . $file;
        $version = is_file($diskOriginal) ? '?v=' . filemtime($diskOriginal) : '';

        return $webBase . $file . $version; // Fallback : original
    }
}
