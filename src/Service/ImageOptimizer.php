<?php

namespace App\Service;

/**
 * Génère des miniatures pour les images uploadées.
 *
 * ⚠️ NON-DESTRUCTIF : ce service ne modifie, ne recompresse et n'écrase JAMAIS
 * le fichier original. Il se contente d'ÉCRIRE un nouveau fichier "miniature"
 * dans un sous-dossier "thumbnails/". Les photos originales sont donc préservées
 * à l'identique.
 *
 * Utilise l'extension GD (déjà présente : cf. CaptchaGenerator et le Dockerfile).
 */
class ImageOptimizer
{
    /** Côté le plus long, en pixels, pour la miniature affichée dans les grilles. */
    public const THUMBNAIL_MAX = 500;

    /** Qualité de compression JPEG des miniatures (0-100). N'affecte QUE la miniature. */
    private const JPEG_QUALITY = 82;

    /** Sous-dossier où sont stockées les miniatures. */
    public const THUMBNAIL_DIR = 'thumbnails';

    /**
     * Crée la miniature d'une image existante.
     * L'original n'est jamais modifié : on le lit seulement en lecture.
     *
     * @param string $originalPath Chemin absolu du fichier original (préservé).
     */
    public function generateThumbnail(string $originalPath): void
    {
        if (!is_file($originalPath)) {
            return;
        }

        // Lecture seule de l'original — aucune écriture ne sera faite dessus.
        $image = @imagecreatefromstring((string) file_get_contents($originalPath));
        if ($image === false) {
            return; // Non décodable par GD : on ne touche à rien.
        }

        $type = $this->detectType($originalPath);

        $thumbDir = \dirname($originalPath) . '/' . self::THUMBNAIL_DIR;
        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }

        $thumbPath = $thumbDir . '/' . basename($originalPath);
        $thumb = $this->resizeDown($image, self::THUMBNAIL_MAX);
        $this->save($thumb, $thumbPath, $type);

        if ($thumb !== $image) {
            imagedestroy($thumb);
        }
        imagedestroy($image);
    }

    /**
     * Chemin absolu de la miniature correspondant à un original.
     */
    public function thumbnailPathFor(string $originalPath): string
    {
        return \dirname($originalPath) . '/' . self::THUMBNAIL_DIR . '/' . basename($originalPath);
    }

    /**
     * Indique si la miniature existe déjà (utile pour reprendre un traitement de masse).
     */
    public function thumbnailExists(string $originalPath): bool
    {
        return is_file($this->thumbnailPathFor($originalPath));
    }

    /**
     * Renvoie une copie réduite de l'image (côté le plus long = $max).
     * Si l'image est déjà plus petite, la ressource d'origine est renvoyée telle quelle.
     *
     * @param resource|\GdImage $src
     * @return resource|\GdImage
     */
    private function resizeDown($src, int $max)
    {
        $width = imagesx($src);
        $height = imagesy($src);
        $longest = max($width, $height);

        if ($longest <= $max) {
            return $src;
        }

        $ratio = $max / $longest;
        $newWidth = (int) round($width * $ratio);
        $newHeight = (int) round($height * $ratio);

        $dst = imagecreatetruecolor($newWidth, $newHeight);
        imagealphablending($dst, false);
        imagesavealpha($dst, true);
        $transparent = imagecolorallocatealpha($dst, 0, 0, 0, 127);
        imagefilledrectangle($dst, 0, 0, $newWidth, $newHeight, $transparent);

        imagecopyresampled($dst, $src, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);

        return $dst;
    }

    /**
     * @param resource|\GdImage $image
     */
    private function save($image, string $path, string $type): void
    {
        switch ($type) {
            case 'png':
                imagealphablending($image, false);
                imagesavealpha($image, true);
                imagepng($image, $path, 6);
                break;
            case 'gif':
                imagegif($image, $path);
                break;
            case 'jpeg':
            default:
                imagejpeg($image, $path, self::JPEG_QUALITY);
                break;
        }
    }

    private function detectType(string $path): string
    {
        $info = @getimagesize($path);
        if ($info === false || !isset($info[2])) {
            return 'jpeg';
        }

        switch ($info[2]) {
            case IMAGETYPE_PNG:
                return 'png';
            case IMAGETYPE_GIF:
                return 'gif';
            case IMAGETYPE_JPEG:
            default:
                return 'jpeg';
        }
    }
}
