<?php

namespace App\Tests\Service;

use App\Service\ImageOptimizer;
use PHPUnit\Framework\TestCase;

class ImageOptimizerTest extends TestCase
{
    private string $tmpDir;

    protected function setUp(): void
    {
        if (!\extension_loaded('gd')) {
            $this->markTestSkipped('Extension GD requise pour ces tests.');
        }

        $this->tmpDir = sys_get_temp_dir() . '/img_opt_test_' . uniqid();
        mkdir($this->tmpDir, 0755, true);
    }

    protected function tearDown(): void
    {
        $this->deleteDir($this->tmpDir);
    }

    public function testGeneratesThumbnailNextToOriginal(): void
    {
        $original = $this->makeJpeg('photo.jpg', 1200, 900);

        (new ImageOptimizer())->generateThumbnail($original);

        $thumb = \dirname($original) . '/' . ImageOptimizer::THUMBNAIL_DIR . '/photo.jpg';
        $this->assertFileExists($thumb, 'La miniature doit être créée dans le sous-dossier thumbnails/.');
    }

    public function testOriginalIsNeverModified(): void
    {
        $original = $this->makeJpeg('photo.jpg', 1200, 900);
        $hashBefore = md5_file($original);

        (new ImageOptimizer())->generateThumbnail($original);

        $this->assertFileExists($original, 'L\'original doit toujours exister.');
        $this->assertSame(
            $hashBefore,
            md5_file($original),
            'L\'original ne doit jamais être modifié (octet pour octet identique).'
        );
    }

    public function testThumbnailIsDownscaled(): void
    {
        $original = $this->makeJpeg('photo.jpg', 1200, 900);

        (new ImageOptimizer())->generateThumbnail($original);

        $thumb = \dirname($original) . '/' . ImageOptimizer::THUMBNAIL_DIR . '/photo.jpg';
        [$width, $height] = getimagesize($thumb);

        $this->assertLessThanOrEqual(
            ImageOptimizer::THUMBNAIL_MAX,
            max($width, $height),
            'Le côté le plus long de la miniature ne doit pas dépasser THUMBNAIL_MAX.'
        );
    }

    public function testReturnsTrueOnSuccessAndFalseOnNonImage(): void
    {
        $optimizer = new ImageOptimizer();

        $original = $this->makeJpeg('photo.jpg', 800, 600);
        $this->assertTrue($optimizer->generateThumbnail($original), 'Une image valide doit renvoyer true.');

        $notImage = $this->tmpDir . '/not-an-image.jpg';
        file_put_contents($notImage, 'ceci n\'est pas une image');
        $this->assertFalse($optimizer->generateThumbnail($notImage), 'Un fichier non-image doit renvoyer false sans planter.');
    }

    public function testThumbnailExistsHelper(): void
    {
        $optimizer = new ImageOptimizer();
        $original = $this->makeJpeg('photo.jpg', 800, 600);

        $this->assertFalse($optimizer->thumbnailExists($original), 'Avant génération, la miniature ne doit pas exister.');
        $optimizer->generateThumbnail($original);
        $this->assertTrue($optimizer->thumbnailExists($original), 'Après génération, la miniature doit exister.');
    }

    /**
     * Crée un vrai fichier JPEG de test dans le dossier temporaire.
     */
    private function makeJpeg(string $name, int $width, int $height): string
    {
        $path = $this->tmpDir . '/' . $name;
        $image = imagecreatetruecolor($width, $height);
        imagefilledrectangle($image, 0, 0, $width, $height, imagecolorallocate($image, 120, 180, 90));
        imagejpeg($image, $path, 90);
        imagedestroy($image);

        return $path;
    }

    private function deleteDir(string $dir): void
    {
        if (!is_dir($dir)) {
            return;
        }
        foreach (scandir($dir) as $item) {
            if ($item === '.' || $item === '..') {
                continue;
            }
            $path = $dir . '/' . $item;
            is_dir($path) ? $this->deleteDir($path) : @unlink($path);
        }
        @rmdir($dir);
    }
}
