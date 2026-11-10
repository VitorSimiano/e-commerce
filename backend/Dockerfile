FROM php:8.4-cli-trixie

COPY --from=composer:2 /usr/bin/composer /usr/local/bin/composer

RUN apt-get update \
    && apt-get install -y --no-install-recommends \
        curl \
        libzip-dev \
    && docker-php-ext-install \
        pdo_mysql \
        zip \
        bcmath \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY . .

EXPOSE 8000

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
