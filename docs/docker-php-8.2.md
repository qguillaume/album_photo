# Mise à jour de PHP 7.4 → 8.2 dans Docker

Ce document explique, étape par étape, le problème rencontré le 09/07/2026 sur
`localhost:8000` et comment il a été corrigé. Il est écrit pour être compris même
sans connaître Docker en détail.

---

## 1. Le symptôme

En ouvrant **http://localhost:8000**, la page affichait :

```
Fatal error: Composer detected issues in your platform:
Your Composer dependencies require a PHP version ">= 8.2.0".
You are running 7.4.33.
```

Traduction : « tes librairies PHP ont besoin de PHP 8.2 minimum, mais le serveur
tourne en PHP 7.4.33 ». Le site refusait donc de démarrer.

---

## 2. La cause

Il faut comprendre qu'il y a **deux PHP différents** sur ta machine :

| Où | Version | Sert à quoi |
|----|---------|-------------|
| PHP local (XAMPP) | 8.2.12 | Quand tu lances le site « à la main » en local |
| PHP dans Docker | 7.4.33 | Quand tu ouvres `localhost:8000` (conteneur) |

Ton projet (`composer.json`) exige **PHP ≥ 8.2** :

```json
"require": {
    "php": ">=8.2",
    ...
}
```

- En **local**, ton XAMPP est en 8.2 → tout marche. C'est pour ça que tu croyais
  que le problème était réglé.
- Dans **Docker**, l'image utilisée était restée bloquée sur `php:7.4-fpm`. Elle
  n'avait jamais été mise à jour en même temps que le projet. D'où le conflit.

> En résumé : le code demandait PHP 8.2, mais le conteneur Docker fournissait
> encore PHP 7.4.

---

## 3. Ce qui a été modifié

Deux fichiers, une seule ligne chacun : la version de l'image PHP.

### Fichier 1 — `Dockerfile`

C'est la « recette » qui construit l'image du conteneur PHP.

```diff
- FROM php:7.4-fpm
+ FROM php:8.2-fpm
```

`FROM` = l'image de base sur laquelle on construit. On part maintenant de PHP 8.2.

### Fichier 2 — `docker-compose.yml`

C'est le fichier qui décrit tous les services (PHP, Nginx, MySQL, Mailhog).

```diff
  php:
-   image: php:7.4-fpm
+   image: php:8.2-fpm
    build:
      context: .
      dockerfile: Dockerfile
```

`image:` = le nom/version de l'image attendue pour le service `php`.

> Les deux fichiers doivent indiquer la même version, sinon Docker peut se baser
> sur l'ancienne image en cache.

---

## 4. Les commandes exécutées

Une fois les fichiers modifiés, il faut **reconstruire** l'image (elle n'est pas
mise à jour automatiquement) puis **relancer** les conteneurs.

### Étape A — reconstruire l'image PHP

```bash
docker-compose build php
```

- `docker-compose build` = fabrique l'image à partir du `Dockerfile`.
- `php` = on ne reconstruit que le service `php` (pas MySQL ni Nginx, inutiles ici).
- Cette étape retélécharge PHP 8.2 et réinstalle les extensions PHP
  (pdo_mysql, zip, intl, gd, etc.). C'est pour ça qu'elle prend 1 à 3 minutes.

### Étape B — relancer les conteneurs

```bash
docker-compose up -d
```

- `up` = démarre (ou recrée) les conteneurs décrits dans `docker-compose.yml`.
- `-d` = « detached », les conteneurs tournent en arrière-plan (ils ne bloquent
  pas le terminal).
- Docker détecte que l'image `php` a changé et **recrée** automatiquement le
  conteneur `symfony_php` avec la nouvelle version.

---

## 5. Comment vérifier que c'est bon

### Vérifier la version de PHP dans le conteneur

```bash
docker exec symfony_php php -v
```

- `docker exec symfony_php` = exécute une commande **à l'intérieur** du conteneur
  nommé `symfony_php`.
- `php -v` = affiche la version de PHP.
- Résultat attendu : `PHP 8.2.xx` (et non plus 7.4).

### Vérifier que le site répond

```bash
curl -s -o /dev/null -w "HTTP %{http_code}\n" http://localhost:8000
```

- Résultat attendu : `HTTP 200` (la page se charge correctement).
- Note : le tout premier appel après un redémarrage peut renvoyer `504`
  (Symfony recompile son cache à froid). Il suffit de recharger une fois.

---

## 6. Points importants

- **La prod n'est pas concernée.** Ces deux fichiers (`Dockerfile` et
  `docker-compose.yml`) servent uniquement à ton environnement de développement
  local. Ton hébergement de production a sa propre version de PHP. Il n'y a donc
  **rien à transférer sur FileZilla** pour ce correctif.
- **Rechargement forcé du navigateur** : après un changement de CSS/police,
  fais `Ctrl + Maj + R` pour éviter d'afficher une version en cache.
- **Si un jour tu revois cette erreur** : elle signifie presque toujours que la
  version de PHP (dans Docker ou sur le serveur) est plus ancienne que celle
  exigée par `composer.json`. La solution est d'aligner la version de PHP.

---

## Récapitulatif express

```bash
# 1. Modifier la version dans Dockerfile et docker-compose.yml (7.4 → 8.2)
# 2. Reconstruire l'image
docker-compose build php
# 3. Relancer les conteneurs
docker-compose up -d
# 4. Vérifier
docker exec symfony_php php -v      # doit afficher PHP 8.2.xx
# 5. Ouvrir http://localhost:8000 et faire Ctrl+Maj+R
```
