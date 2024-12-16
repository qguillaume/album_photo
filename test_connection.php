<?php
// test_connection.php

$host = '172.21.0.2';  // L'adresse IP de ton container MySQL
$port = '3306';        // Le port utilisé par MySQL
$dbname = 'mon_album_photo';  // Le nom de la base de données
$username = 'root';    // Le nom d'utilisateur
$password = 'rootpassword';  // Le mot de passe de l'utilisateur

try {
    // Créer une instance PDO pour tester la connexion
    $pdo = new PDO("mysql:host=$host;port=$port;dbname=$dbname", $username, $password);
    // Définir le mode d'erreur de PDO
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    echo "Connection successful!";
} catch (PDOException $e) {
    echo "Connection failed: " . $e->getMessage();
}
