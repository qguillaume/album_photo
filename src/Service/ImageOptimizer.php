<?php

namespace App\Service;

/**
 * Optimise les images uploadées :
 *  - redimensionne l'original s'il dépasse FULL_MAX (pour éviter des fichiers énormes) ;
 *  - génère une miniature (dossier "thumbnails/") servie dans les grilles d'albums.
 *
 * Utilise l'extension GD (déjà présente : cf. CaptchaGenerator et le Dockerfile).
 */
class ImageOptimizer
{
    /** Côté le plus long, en pixels, pour la miniature affichée dans les grilles. */
    public const THUMBNAIL_MAX = 500;

    /** Côté le plus long, en pixels, pour l'image "pleine résolution" conservée. */
    private const FULL_MAX = 1920;

    /** Qualité de compression JPEG (0-100). */
    private const JPEG_QUALITY = 82;

    /** Sous-dossier où sont stockées les miniatures. */
    public const THUMBNAIL_DIR = 'thumbnails';

    /**
     * Traite une image déjà présente sur le disque :
     * compresse/redimensionne l'original en place, puis écrit sa miniature.
     *
     * @param string $absolutePath Chemin absolu du fichier image (déjà déplacé).
     */
    public function process(string $absolutePath): void
    {
        if (!is_file($absolutePath)) {
            return;
        }

        $image = @imagecreatefromstring((string) file_get_contents($absolutePath));
        if ($image === false) {
            // Fichier non décodable par GD : on le laisse tel quel plutôt que de le corrompre.
            return;
        }

        $type = $this->detectType($absolutePath);

        // 1) Réécrit l'original borné à FULL_MAX (compression + éventuel redimensionnement).
        $full = $this->constrain($image, self::FULL_MAX);
        $this->save($full, $absolutePath, $type);
        if ($full !== $image) {
            imagedestroy($full);
        }

        // 2) Génère la miniature dans le sous-dossier dédié.
        $thumbDir = \dirname($absolutePath) . '/' . self::THUMBNAIL_DIR;
        if (!is_dir($thumbDir)) {
            mkdir($thumbDir, 0755, true);
        }
        $thumb = $this->constrain($image, self::THUMBNAIL_MAX);
        $this->save($thumb, $thumbDir . '/' . basename($absolutePath), $type);
        if ($thumb !== $image) {
            imagedestroy($thumb);
        }

        imagedestroy($image);
    }

    /**
     * Retourne le chemin absolu de la miniature correspondant à un original.
     */
    public function thumbnailPathFor(string $absoluteOriginalPath): string
    {
        return \dirname($absoluteOriginalPath) . '/' . self::THUMBNAIL_DIR . '/' . basename($absoluteOriginalPath);
    }

    /**
     * Redimensionne l'image pour que son côté le plus long ne dépasse pas $max.
     * Renvoie la ressource d'origine inchangée si elle est déjà assez petite.
     *
     * @param resource|\GdImage $src
     * @return resource|\GdImage
     */
    private function constrain($src, int $max)
    {
        $width = imagesx($src);
        $height = imagesy($src);
        $longest = max($width, $height);

        if ($longest <= $max) {
            return $src; // Déjà assez petite : on ne ré-échantillonne pas inutilement.
        }

        $ratio = $max / $longest;
        $newWidth = (int) round($width * $ratio);
        $newHeight = (int) round($height * $ratio);

        $dst = imagecreatetruecolor($newWidth, $newHeight);
        // Préserve la transparence (PNG / GIF).
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
                imagepng($image, $path, 6); // 6 = bon compromis taille/vitesse
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
