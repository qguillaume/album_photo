<?php

// src/Security/UserChecker.php
namespace App\Security;

use Symfony\Component\Security\Core\User\UserCheckerInterface;
use Symfony\Component\Security\Core\User\UserInterface;
use Symfony\Component\Security\Core\Exception\CustomUserMessageAuthenticationException;

class UserChecker implements UserCheckerInterface
{
    public function checkPreAuth(UserInterface $user)
    {
        // Vérifie si l'utilisateur est banni
        if ($user->getIsBanned()) {
            throw new CustomUserMessageAuthenticationException('Vous êtes banni, veuillez contacter un administrateur.');
        }
    }

    public function checkPostAuth(UserInterface $user)
    {
        // Après l'authentification, tu peux également ajouter des vérifications supplémentaires si nécessaire
    }
}
