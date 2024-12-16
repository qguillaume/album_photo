<?php
$host = 'database';
$dbname = 'mon_album_photo';
$username = 'root';
$password = 'rootpassword';

$dsn = "mysql:host=$host;dbname=$dbname;charset=utf8";
$pdo = new PDO($dsn, $username, $password);
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

if ($pdo) {
    echo "toto";
    echo "Connexion réussie à la base de données " . $pdo->query("SELECT DATABASE()")->fetchColumn();
}
?>
