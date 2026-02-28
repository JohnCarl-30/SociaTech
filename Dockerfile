FROM php:8.2-apache

# Install PostgreSQL client library and PHP extensions
RUN apt-get update && apt-get install -y libpq-dev \
    && docker-php-ext-install pdo pdo_pgsql \
    && rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules and configure AllowOverride
RUN a2enmod rewrite headers && \
    printf '<Directory /var/www/html>\n\tOptions -Indexes\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' \
    > /etc/apache2/conf-available/sociatech.conf && \
    a2enconf sociatech

# Copy backend files to Apache web directory
COPY backend/ /var/www/html/

WORKDIR /var/www/html

RUN if [ -f "composer.json" ]; then composer install --no-dev --optimize-autoloader; fi

RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

EXPOSE 80
CMD ["apache2-foreground"]