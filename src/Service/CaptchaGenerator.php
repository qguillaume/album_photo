<?php

// src/Service/CaptchaGenerator.php
namespace App\Service;

class CaptchaGenerator
{
    private $publicDir;

    public function __construct(string $publicDir)
    {
        $this->publicDir = $publicDir;
    }

    public function generateCaptchaText(): string
    {
        $characters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        $captchaText = '';
        for ($i = 0; $i < 6; $i++) {
            $captchaText .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $captchaText;
    }

    public function generateCaptchaImage(string $captchaText): string
    {
        $width = 300;
        $height = 80;
        $image = imagecreate($width, $height);

        // Couleurs
        $backgroundColor = imagecolorallocate($image, 147, 43, 21);
        $textColor = imagecolorallocate($image, 188, 225, 151);
        $noiseColor = imagecolorallocate($image, 172, 205, 137);

        // Remplir l'arrière-plan
        imagefilledrectangle($image, 0, 0, $width, $height, $backgroundColor);

        // Ajouter du bruit (lignes fines aléatoires)
        for ($i = 0; $i < 8; $i++) {
            $x1 = rand(0, $width);
            $y1 = rand(0, $height);
            $x2 = rand(0, $width);
            $y2 = rand(0, $height);
            imagesetthickness($image, 0.5);
            imageline($image, $x1, $y1, $x2, $y2, $noiseColor);
        }

        $font = __DIR__ . '/../..' . $this->publicDir . '/fonts/Montserrat-Italic.ttf';

        // Vérification de l'existence du fichier TTF
        if (!file_exists($font)) {
            throw new \Exception("Le fichier de police n'a pas été trouvé à l'emplacement : " . $font);
        }

        // Ajouter chaque lettre avec un angle différent
        $fontSize = 30;
        $x = 30;
        $y = 60;
        $letterSpacing = 40;

        for ($i = 0; $i < strlen($captchaText); $i++) {
            $letter = $captchaText[$i];
            $angle = rand(-25, 25);
            imagettftext($image, $fontSize, $angle, $x, $y, $textColor, $font, $letter);
            $x += $letterSpacing;
        }

        // Capturer l'image en mémoire
        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        return $imageData;
    }
}
