# Base image PHP avec FPM
FROM php:7.4-fpm

# Installer les dépendances nécessaires pour PHP et les extensions requises
RUN apt-get update && apt-get install -y libpng-dev libjpeg-dev libfreetype6-dev \
    unzip \
    zip \
    git \
    libzip-dev \
    libonig-dev \
    libxml2-dev \
    libicu-dev \
    libmariadb-dev-compat \
    libmariadb-dev \
    && echo "Install pdo_mysql..." && docker-php-ext-install pdo_mysql \
    && docker-php-ext-install zip mysqli intl \
    && apt-get clean \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) gd\
    && echo "pdo_mysql installed"

# Installer Composer (gestionnaire de dépendances PHP)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Définir le répertoire de travail
WORKDIR /var/www/html

# Copier le fichier php.ini dans le répertoire de configuration PHP
COPY ./php.ini /usr/local/etc/php/php.ini

# S'assurer que les permissions sont correctes
RUN chown www-data:www-data /usr/local/etc/php/php.ini