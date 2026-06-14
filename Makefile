.PHONY: help build up down logs shell composer sf image push

# Image name on GitHub Container Registry
IMAGE ?= ghcr.io/rodow/rwojtko.fr:latest

# Development uses both compose files (base + dev overrides).
DC = SERVER_NAME=:80 HTTP_PORT=8080 docker compose -f docker-compose.yml -f docker-compose.dev.yml

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Development:"
	@echo "  build        Build the dev image"
	@echo "  up           Start the dev container (http://localhost:8080)"
	@echo "  down         Stop the container"
	@echo "  logs         View logs"
	@echo "  shell        Open a shell in the container"
	@echo "  composer     Run composer (usage: make composer c='require package')"
	@echo "  sf           Run a Symfony console command (usage: make sf c='cache:clear')"
	@echo ""
	@echo "Production image:"
	@echo "  image        Build the production image ($(IMAGE))"
	@echo "  push         Build and push the production image to ghcr.io"

# --- Development ---
build:
	$(DC) build

up:
	$(DC) up -d

down:
	$(DC) down

logs:
	$(DC) logs -f

shell:
	$(DC) exec app sh

composer:
	$(DC) exec app composer $(c)

sf:
	$(DC) exec app php bin/console $(c)

# --- Production image ---
image:
	docker build --target prod -t $(IMAGE) -f docker/frankenphp/Dockerfile .

push: image
	docker push $(IMAGE)