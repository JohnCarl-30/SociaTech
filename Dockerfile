FROM php:8.2-apache

# Install PHP extensions needed for MySQL
RUN docker-php-ext-install pdo pdo_mysql mysqli

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Enable Apache modules and configure AllowOverride
RUN a2enmod rewrite headers && \
    printf '<Directory /var/www/html>\n\tOptions -Indexes\n\tAllowOverride All\n\tRequire all granted\n</Directory>\n' \
    > /etc/apache2/conf-available/sociatech.conf && \
    a2enconf sociatech

# Copy backend files to Apache web directory
COPY backend/ /var/www/html/

# Set working directory
WORKDIR /var/www/html

# Install Composer dependencies if composer.json exists
RUN if [ -f "composer.json" ]; then composer install --no-dev --optimize-autoloader; fi

# Set proper permissions
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html

# Expose port 80
EXPOSE 80

# Start Apache server
CMD ["apache2-foreground"]