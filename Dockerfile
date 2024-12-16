# Base image PHP avec FPM
FROM php:7.4-fpm

# Installer les dépendances nécessaires pour PHP et les extensions requises
RUN apt-get update && apt-get install -y \
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
    && echo "pdo_mysql installed"

# Installer Composer (gestionnaire de dépendances PHP)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Définir le répertoire de travail
WORKDIR /var/www/html
