# Utilise une image officielle PHP
FROM php:8.1-fpm

# Installation des dépendances
RUN apt-get update && apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev libzip-dev git unzip && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd zip pdo pdo_mysql && \
    pecl install xdebug && \
    docker-php-ext-enable xdebug

# Installation de Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Configuration du répertoire de travail
WORKDIR /var/www/html

# Copie les fichiers du projet dans le conteneur
COPY . .

# Installe les dépendances de Symfony
RUN composer install --no-interaction --optimize-autoloader

# Expose le port 9000 pour PHP-FPM
EXPOSE 9000

CMD ["php-fpm"]
