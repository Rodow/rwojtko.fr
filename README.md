# rwojtko.fr

Site personnel - Symfony 8 + [FrankenPHP](https://frankenphp.dev/).

En production : un seul conteneur (Caddy + PHP), image immuable poussée sur ghcr.io.

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
