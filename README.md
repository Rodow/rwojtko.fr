# rwojtko.fr

Site personnel - Symfony 8 + [FrankenPHP](https://frankenphp.dev/).

En production : un seul conteneur (FrankenPHP), image immuable poussée sur ghcr.io. Il sert du
HTTP simple (`SERVER_NAME=:80`) sur le réseau Docker `web` : le Caddy frontal du serveur
(`/opt/caddy`) tient les ports 80/443 et les certificats de tous les projets.

## Développement local

```bash
git clone git@github.com:Rodow/rwojtko.fr.git
cd rwojtko.fr

make build         # image dev (Xdebug, rechargement à chaud)
make up            # http://localhost:8080
make composer c='install'
make sf c='importmap:install'
```

La source est montée depuis l'hôte (édition à chaud). Les commandes passent par les
deux fichiers compose ; le `Makefile` s'en charge.
