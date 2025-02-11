<?php

// src/Service/CaptchaGenerator.php
namespace App\Service;

class CaptchaGenerator
{
    public function generateCaptchaText(): string
    {
        $characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        $captchaText = '';
        for ($i = 0; $i < 6; $i++) {
            $captchaText .= $characters[rand(0, strlen($characters) - 1)];
        }
        return $captchaText;
    }

    public function generateCaptchaImage(string $captchaText): string
    {
        $width = 200;
        $height = 50;
        $image = imagecreate($width, $height);

        // Couleurs
        $backgroundColor = imagecolorallocate($image, 100, 200, 50);
        $textColor = imagecolorallocate($image, 0, 0, 0); // Noir

        // Remplir l'arrière-plan
        imagefilledrectangle($image, 0, 0, $width, $height, $backgroundColor);

        // Ajouter du bruit (lignes et points)
        for ($i = 0; $i < 50; $i++) {
            imagesetpixel($image, rand(0, $width), rand(0, $height), $textColor);
        }
        for ($i = 0; $i < 5; $i++) {
            imageline($image, rand(0, $width), rand(0, $height), rand(0, $width), rand(0, $height), $textColor);
        }

        $fontSize = 20;
        $font = __DIR__ . '/../../public/fonts/Montserrat-Italic.ttf';

        // Vérification de l'existence du fichier TTF
        if (!file_exists($font)) {
            throw new \Exception("Le fichier de police n'a pas été trouvé à l'emplacement : " . $font);
        }

        imagettftext($image, $fontSize, 0, 10, 35, $textColor, $font, $captchaText);

        // Capturer l'image en mémoire
        ob_start();
        imagepng($image);
        $imageData = ob_get_clean();
        imagedestroy($image);

        return $imageData;
    }
}
