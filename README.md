# rwojtko.fr

Site personnel - Symfony 8 + [FrankenPHP](https://frankenphp.dev/).

## Architecture

Un **seul conteneur** : FrankenPHP embarque Caddy (serveur web, HTTPS automatique)
et PHP. L'image de production est **immuable** : le code, les dépendances et les
assets compilés sont inclus dans l'image au build. Rien n'est monté depuis l'hôte.

- Production : image construite en local, poussée sur **ghcr.io**, tirée par le VPS.
- Le conteneur tourne en **non-root**, sans capacité autre que `NET_BIND_SERVICE`.
  Il sert en **HTTPS sur 443** (TLS automatique) ; le port **80** ne fait que
  rediriger vers HTTPS (et répondre au challenge ACME), sans exposer l'application.
- Pas de base de données ni de service mail (l'application n'en utilise pas).

## Développement local

```bash
git clone git@github.com:Rodow/rwojtko.fr.git
cd rwojtko.fr

make build         # image dev (Xdebug, rechargement à chaud)
make up            # http://localhost:8080
make composer c='install'
make sf c='importmap:install'
```

> En dev, la source est montée depuis l'hôte (édition à chaud). Les commandes
> passent par les deux fichiers compose ; le `Makefile` s'en charge.

## Production

### 1. Construire et pousser l'image (depuis ta machine)

```bash
# Authentification ghcr.io (une seule fois) — token avec le scope write:packages
echo $GHCR_TOKEN | docker login ghcr.io -u rodow --password-stdin

make push          # build l'image prod + push sur ghcr.io/rodow/rwojtko.fr:latest
```

### 2. Déployer sur le VPS

Le serveur n'a besoin **ni du code source ni de git** : seulement `docker-compose.yml`
et un fichier `.env`.

```bash
# Sur le VPS, dans un dossier dédié contenant docker-compose.yml
cat > .env << EOF
SERVER_NAME=rwojtko.fr
APP_SECRET=$(openssl rand -hex 16)
EOF

# Authentification ghcr.io (idem, token avec read:packages)
echo $GHCR_TOKEN | docker login ghcr.io -u rodow --password-stdin

docker compose pull
docker compose up -d
```

### Mise à jour

```bash
# Machine de build
make push

# VPS
docker compose pull && docker compose up -d
```

> Chaque déploiement est une nouvelle image → conteneur recréé. Pas de cache
> OPcache obsolète, rollback possible en repointant sur un tag précédent.

## Variables d'environnement

| Variable | Où | Description |
|----------|----|-------------|
| `SERVER_NAME` | `.env` (VPS) | Domaine servi par Caddy (ex. `rwojtko.fr`) |
| `APP_SECRET` | `.env` (VPS) | Secret Symfony (`openssl rand -hex 16`) |
| `IMAGE` | `.env` (VPS) | Tag d'image à déployer (défaut `ghcr.io/rodow/rwojtko.fr:latest`) |
| `HTTP_PORT` | dev | Port HTTP local (défaut 8080) |
