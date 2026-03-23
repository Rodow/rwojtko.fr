# rwojtko.fr

Site personnel - Symfony 7 + Docker (Caddy, PostgreSQL, PHP-FPM)

## Installation locale

```bash
# Clone le projet
git clone git@github.com:Rodow/rwojtko.fr.git
cd rwojtko.fr

# Crée le fichier .env (copie depuis l'exemple ou crée-le)
cp .env.local.example .env
# Ajuste les valeurs si nécessaire (APP_SECRET, etc.)

# Build et lance les containers
docker compose build
docker compose up -d

# Installe les dépendances PHP
docker compose exec php composer install

# Installe les assets JS
docker compose exec php bin/console importmap:install
```

Le site est accessible sur http://localhost:8080

## Déploiement VPS (Production)

### Installation initiale

```bash
# Clone le projet
cd /var/www
git clone git@github.com:Rodow/rwojtko.fr.git
cd rwojtko.fr

# Crée le fichier .env
cat > .env << 'EOF'
APP_ENV=prod
APP_SECRET=changeme
DATABASE_URL="postgresql://app:secret@database:5432/app?serverVersion=16&charset=utf8"
MESSENGER_TRANSPORT_DSN=doctrine://default?auto_setup=0
MAILER_DSN=null://null
DEFAULT_URI=https://rwojtko.fr
HTTP_PORT=80
HTTPS_PORT=443
SITE_ADDRESS=rwojtko.fr
EOF

# Crée le fichier .env.local avec le vrai secret
openssl rand -hex 16  # génère un secret
cat > .env.local << 'EOF'
APP_ENV=prod
APP_SECRET=<ton_secret_généré>
EOF

# Build et lance les containers
docker compose build
docker compose up -d

# Installe les dépendances (mode prod)
docker compose exec php composer install --no-dev --optimize-autoloader

# Installe les assets et compile
docker compose exec php bin/console importmap:install --env=prod
docker compose exec php bin/console asset-map:compile --env=prod
```

### Mise à jour

```bash
cd /var/www/rwojtko.fr
git pull
docker compose exec php composer install --no-dev --optimize-autoloader
docker compose exec php bin/console cache:clear --env=prod
docker compose exec php bin/console importmap:install --env=prod
docker compose exec php bin/console asset-map:compile --env=prod
```

## Services Docker

| Service | Port local | Description |
|---------|------------|-------------|
| Caddy | 8080 (dev) / 80,443 (prod) | Serveur web avec HTTPS automatique |
| PHP-FPM | 9000 (interne) | PHP 8.x |
| PostgreSQL | 5432 | Base de données |
| Mailcatcher | 1080 | Interface mail (dev uniquement) |

## Variables d'environnement

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_ENV` | dev | Environnement Symfony |
| `APP_SECRET` | - | Secret Symfony (générer avec `openssl rand -hex 16`) |
| `SITE_ADDRESS` | :80 | Adresse Caddy (`:80` en dev, `rwojtko.fr` en prod) |
| `HTTP_PORT` | 8080 | Port HTTP exposé |
| `HTTPS_PORT` | 8443 | Port HTTPS exposé |
