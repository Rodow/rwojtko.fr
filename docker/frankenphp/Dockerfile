# syntax=docker/dockerfile:1

FROM dunglas/frankenphp:1-php8.5-alpine AS base

WORKDIR /app

# PHP extensions (install-php-extensions handles build/runtime deps)
RUN install-php-extensions \
        @composer \
        intl \
        zip \
        gd \
        apcu \
        opcache

# Use the production php.ini provided by the base image + app tuning
RUN mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"
COPY docker/frankenphp/app.ini "$PHP_INI_DIR/conf.d/zz-app.ini"

ENV APP_ENV=prod

# -----------------------------------------------------------------------------
# Builder: install dependencies and compile assets
# -----------------------------------------------------------------------------
FROM base AS builder

ENV COMPOSER_MEMORY_LIMIT=-1

# Install vendors first (better layer caching), without the source
COPY composer.json composer.lock symfony.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-progress

# Bring in the application source and finalize
COPY . .
# Pin the environment to prod (no committed .env file). The real APP_SECRET is
# injected at runtime and takes precedence over this baseline.
RUN echo "<?php return ['APP_ENV' => 'prod', 'APP_DEBUG' => '0', 'DEFAULT_URI' => 'https://localhost'];" > .env.local.php \
    && composer dump-autoload --classmap-authoritative --no-dev \
    && composer run-script --no-dev post-install-cmd \
    && php bin/console asset-map:compile

# -----------------------------------------------------------------------------
# Production image
# -----------------------------------------------------------------------------
FROM base AS prod

COPY docker/frankenphp/Caddyfile /etc/frankenphp/Caddyfile

# Application with vendors + compiled assets
COPY --from=builder --chown=www-data:www-data /app /app

# Run as a non-root user. setcap lets it bind to 443 without root.
RUN apk add --no-cache libcap \
    && setcap cap_net_bind_service=+ep /usr/local/bin/frankenphp \
    && chown -R www-data:www-data /app/var /data /config

USER www-data

# -----------------------------------------------------------------------------
# Development image: Xdebug + live code reload (source is bind-mounted)
# -----------------------------------------------------------------------------
FROM base AS dev

COPY docker/frankenphp/Caddyfile /etc/frankenphp/Caddyfile

RUN install-php-extensions xdebug
RUN { \
        echo "xdebug.mode=develop,debug,coverage"; \
        echo "xdebug.client_host=host.docker.internal"; \
        echo "xdebug.start_with_request=trigger"; \
        echo "opcache.validate_timestamps=1"; \
        echo "opcache.revalidate_freq=0"; \
    } > "$PHP_INI_DIR/conf.d/zz-dev.ini"
