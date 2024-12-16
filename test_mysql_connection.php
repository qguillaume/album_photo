<?php
$host = 'symfony_mysql';  // Nom du service MySQL dans Docker Compose
$port = '3306';
$dbname = 'mon_album_photo'; // Nom de la base de données
$user = 'root';  // Utilisateur root
$password = 'rootpassword';  // Mot de passe root

try {
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $user, $password);
    echo "Connexion réussie !\n";
} catch (PDOException $e) {
    echo "Erreur de connexion : " . $e->getMessage() . "\n";
}
