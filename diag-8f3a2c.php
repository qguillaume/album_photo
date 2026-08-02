<?php

// ---------------------------------------------------------------------------
// Fichier TEMPORAIRE de diagnostic. A supprimer du serveur juste apres usage.
// Il ne modifie rien : il lit l'etat de PHP et du fichier du controleur.
// ---------------------------------------------------------------------------

header('Content-Type: text/plain; charset=utf-8');

echo "=== PHP ===\n";
echo 'Version      : ' . PHP_VERSION . "\n";
echo 'Ce fichier   : ' . __FILE__ . "\n\n";

echo "=== Fichier du controleur vu par le serveur ===\n";

// Le dossier public est "www" : le projet se trouve donc un cran au-dessus.
$controleur = __DIR__ . '/../src/Controller/RegistrationController.php';

echo 'Chemin teste : ' . $controleur . "\n";

if (!is_file($controleur)) {
    echo "Etat         : INTROUVABLE a cet emplacement\n\n";
} else {
    $contenu = (string) file_get_contents($controleur);

    echo 'Taille       : ' . filesize($controleur) . " octets  (attendu : 14083)\n";
    echo 'Modifie le   : ' . date('d/m/Y H:i:s', (int) filemtime($controleur)) . "\n";
    echo 'Contient X-Real-IP : ' . (false !== strpos($contenu, 'X-Real-IP') ? 'OUI (nouvelle version)' : 'NON (ancienne version)') . "\n\n";
}

echo "=== OPcache (cache de code de PHP) ===\n";

if (!function_exists('opcache_get_configuration')) {
    echo "Etat         : absent sur ce serveur\n";
} else {
    $config = opcache_get_configuration();
    $actif = !empty($config['directives']['opcache.enable']);
    $revalide = !empty($config['directives']['opcache.validate_timestamps']);

    echo 'Actif        : ' . ($actif ? 'OUI' : 'NON') . "\n";
    echo 'Relit les fichiers modifies : ' . ($revalide ? 'OUI' : 'NON -> c est la cause du probleme') . "\n";

    if (function_exists('opcache_reset')) {
        echo 'Reinitialisation : ' . (opcache_reset() ? 'REUSSIE' : 'REFUSEE') . "\n";
    } else {
        echo "Reinitialisation : impossible (fonction desactivee)\n";
    }
}

echo "\n=== En-tetes recus par le serveur ===\n";

foreach ($_SERVER as $cle => $valeur) {
    if (0 === strpos($cle, 'HTTP_') || 'REMOTE_ADDR' === $cle) {
        echo $cle . ' = ' . (is_scalar($valeur) ? $valeur : gettype($valeur)) . "\n";
    }
}