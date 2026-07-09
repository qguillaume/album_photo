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
 * Seule exception : rotate(), qui réécrit l'original — mais uniquement sur
 * demande explicite de l'utilisateur (boutons de rotation du dashboard).
 *
 * Utilise l'extension GD (déjà présente : cf. CaptchaGenerator et le Dockerfile).
 */
class ImageOptimizer
{
    /** Côté le plus long, en pixels, pour la miniature affichée dans les grilles. */
    public const THUMBNAIL_MAX = 500;

    /** Qualité de compression JPEG des miniatures (0-100). N'affecte QUE la miniature. */
    private const JPEG_QUALITY = 82;

    /** Qualité JPEG lors d'une rotation de l'original (élevée pour limiter la perte). */
    private const ROTATE_JPEG_QUALITY = 92;

    /** Sous-dossier où sont stockées les miniatures. */
    public const THUMBNAIL_DIR = 'thumbnails';

    /**
     * Crée la miniature d'une image existante.
     * L'original n'est jamais modifié : on le lit seulement en lecture.
     *
     * @param string $originalPath Chemin absolu du fichier original (préservé).
     * @return bool true si une miniature a été écrite, false si l'image a été
     *              ignorée sans risque (introuvable, illisible, trop volumineuse
     *              pour la mémoire disponible, ou dossier non inscriptible).
     * @throws \RuntimeException Uniquement en cas d'erreur inattendue à surfacer.
     */
    public function generateThumbnail(string $originalPath): bool
    {
        if (!is_file($originalPath)) {
            return false;
        }

        // Vérif préalable SANS charger l'image (bon marché) : dimensions + mémoire.
        $info = @getimagesize($originalPath);
        if ($info === false) {
            return false; // Pas une image exploitable : on ignore.
        }
        [$width, $height] = $info;

        // Garde-fou mémoire : si décoder l'image risque de dépasser la limite PHP,
        // on l'ignore (la grille retombera sur l'original via le fallback Twig)
        // plutôt que de provoquer une "Internal Server Error".
        if (!$this->fitsInMemory((int) $width, (int) $height)) {
            return false;
        }

        // Prépare le dossier des miniatures.
        $thumbDir = \dirname($originalPath) . '/' . self::THUMBNAIL_DIR;
        if (!is_dir($thumbDir) && !@mkdir($thumbDir, 0755, true) && !is_dir($thumbDir)) {
            throw new \RuntimeException("Impossible de créer le dossier des miniatures : $thumbDir (droits d'écriture ?)");
        }

        // Lecture seule de l'original — aucune écriture ne sera faite dessus.
        $image = @imagecreatefromstring((string) file_get_contents($originalPath));
        if ($image === false) {
            return false; // Non décodable par GD : on ne touche à rien.
        }

        // Applique l'orientation EXIF (photos de smartphone stockées "couchées") :
        // GD ignore cette métadonnée, sans quoi la miniature apparaît tournée.
        $image = $this->applyExifOrientation($image, $originalPath);

        $type = $this->detectType($originalPath);
        $thumbPath = $thumbDir . '/' . basename($originalPath);
        $thumb = $this->resizeDown($image, self::THUMBNAIL_MAX);
        $this->save($thumb, $thumbPath, $type);

        if ($thumb !== $image) {
            imagedestroy($thumb);
        }
        imagedestroy($image);

        return true;
    }

    /**
     * Fait pivoter une photo de 90, 180 ou 270 degrés (sens horaire), puis
     * régénère sa miniature. C'est la SEULE méthode du service qui réécrit
     * l'original (action volontaire de l'utilisateur depuis le dashboard).
     *
     * @param string $originalPath Chemin absolu du fichier à pivoter.
     * @param int    $degrees      90, 180 ou 270 (sens horaire).
     * @return bool true si la rotation a été appliquée.
     */
    public function rotate(string $originalPath, int $degrees): bool
    {
        if (!\in_array($degrees, [90, 180, 270], true) || !is_file($originalPath)) {
            return false;
        }

        $info = @getimagesize($originalPath);
        if ($info === false) {
            return false;
        }
        [$width, $height] = $info;

        if (!$this->fitsInMemory((int) $width, (int) $height)) {
            return false; // Trop volumineuse pour la mémoire PHP : on ne tente rien.
        }

        $image = @imagecreatefromstring((string) file_get_contents($originalPath));
        if ($image === false) {
            return false;
        }

        // Applique d'abord l'orientation EXIF : la rotation demandée par
        // l'utilisateur s'entend par rapport à ce qu'il VOIT à l'écran.
        $image = $this->applyExifOrientation($image, $originalPath);

        // GD tourne dans le sens anti-horaire pour un angle positif ;
        // on inverse pour obtenir une rotation horaire "intuitive".
        $rotated = imagerotate($image, -$degrees, 0);
        if ($rotated === false) {
            imagedestroy($image);
            return false;
        }
        if ($rotated !== $image) {
            imagedestroy($image);
        }

        // Réécrit l'original pivoté (la réécriture supprime l'étiquette EXIF,
        // ce qui évite toute double rotation à l'affichage).
        $type = $this->detectType($originalPath);
        switch ($type) {
            case 'png':
                imagealphablending($rotated, false);
                imagesavealpha($rotated, true);
                imagepng($rotated, $originalPath, 6);
                break;
            case 'gif':
                imagegif($rotated, $originalPath);
                break;
            case 'jpeg':
            default:
                imagejpeg($rotated, $originalPath, self::ROTATE_JPEG_QUALITY);
                break;
        }
        imagedestroy($rotated);

        // Régénère la miniature pour refléter la nouvelle orientation.
        $thumbPath = $this->thumbnailPathFor($originalPath);
        if (is_file($thumbPath)) {
            @unlink($thumbPath);
        }
        $this->generateThumbnail($originalPath);

        return true;
    }

    /**
     * Applique l'orientation EXIF aux pixels de l'image (JPEG uniquement).
     * Renvoie la ressource corrigée, ou la ressource d'origine si aucune
     * correction n'est nécessaire/possible (extension exif absente, etc.).
     *
     * @param resource|\GdImage $image
     * @return resource|\GdImage
     */
    private function applyExifOrientation($image, string $path)
    {
        if (!\function_exists('exif_read_data')) {
            return $image; // Extension exif non disponible : on n'y touche pas.
        }

        $info = @getimagesize($path);
        if ($info === false || ($info[2] ?? null) !== IMAGETYPE_JPEG) {
            return $image; // L'orientation EXIF ne concerne que les JPEG.
        }

        $exif = @exif_read_data($path);
        $orientation = (int) ($exif['Orientation'] ?? 1);
        if ($orientation <= 1) {
            return $image; // Déjà droite.
        }

        // Valeurs standard EXIF : 3 = 180°, 6 = 90° horaire, 8 = 90° anti-horaire,
        // 2/4/5/7 = variantes avec effet miroir (rares : scans, selfies avant).
        switch ($orientation) {
            case 2:
                imageflip($image, IMG_FLIP_HORIZONTAL);
                return $image;
            case 3:
                $out = imagerotate($image, 180, 0);
                break;
            case 4:
                imageflip($image, IMG_FLIP_VERTICAL);
                return $image;
            case 5:
                $out = imagerotate($image, -90, 0);
                if ($out !== false) {
                    imageflip($out, IMG_FLIP_HORIZONTAL);
                }
                break;
            case 6:
                $out = imagerotate($image, -90, 0);
                break;
            case 7:
                $out = imagerotate($image, 90, 0);
                if ($out !== false) {
                    imageflip($out, IMG_FLIP_HORIZONTAL);
                }
                break;
            case 8:
                $out = imagerotate($image, 90, 0);
                break;
            default:
                return $image;
        }

        if ($out === false) {
            return $image; // Rotation impossible : on garde l'image telle quelle.
        }

        imagedestroy($image);

        return $out;
    }

    /**
     * Estime si le décodage d'une image de $width x $height tient dans la
     * mémoire PHP disponible, avec une marge de sécurité.
     */
    private function fitsInMemory(int $width, int $height): bool
    {
        $limit = $this->memoryLimitBytes();
        if ($limit <= 0) {
            return true; // Pas de limite (memory_limit = -1).
        }

        // ~4 octets/pixel pour l'image truecolor + la copie redimensionnée + marge.
        $needed = (int) ($width * $height * 4 * 2.2);

        return (memory_get_usage(true) + $needed) < $limit;
    }

    /**
     * Convertit la valeur de memory_limit (ex "256M") en octets. 0 = illimité.
     */
    private function memoryLimitBytes(): int
    {
        $raw = trim((string) ini_get('memory_limit'));
        if ($raw === '' || $raw === '-1') {
            return 0;
        }

        $num = (int) $raw;
        switch (strtolower(substr($raw, -1))) {
            case 'g':
                $num *= 1024;
                // no break
            case 'm':
                $num *= 1024;
                // no break
            case 'k':
                $num *= 1024;
        }

        return $num;
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
