.PHONY: help build up down logs shell composer sf db-create db-migrate db-fixtures install

# Default target
help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Targets:"
	@echo "  install      First time setup (build, up, symfony install)"
	@echo "  build        Build Docker images"
	@echo "  up           Start containers"
	@echo "  down         Stop containers"
	@echo "  logs         View container logs"
	@echo "  shell        Open shell in PHP container"
	@echo "  composer     Run composer command (usage: make composer c='require package')"
	@echo "  sf           Run Symfony console command (usage: make sf c='cache:clear')"
	@echo "  db-create    Create database"
	@echo "  db-migrate   Run migrations"
	@echo "  db-fixtures  Load fixtures"

# Build Docker images
build:
	docker compose build

# Start containers
up:
	docker compose up -d

# Stop containers
down:
	docker compose down

# View logs
logs:
	docker compose logs -f

# Open shell in PHP container
shell:
	docker compose exec php sh

# Run composer command
composer:
	docker compose exec php composer $(c)

# Run Symfony console command
sf:
	docker compose exec php php bin/console $(c)

# Create database
db-create:
	docker compose exec php php bin/console doctrine:database:create --if-not-exists

# Run migrations
db-migrate:
	docker compose exec php php bin/console doctrine:migrations:migrate --no-interaction

# Load fixtures
db-fixtures:
	docker compose exec php php bin/console doctrine:fixtures:load --no-interaction

# First time installation
install: build up
	@echo "Waiting for containers to be ready..."
	@sleep 5
	@echo "Installing Symfony webapp..."
	docker compose exec -u root php chown -R www:www /var/www/html
	docker compose exec php composer create-project symfony/skeleton:"8.0.*" temp --no-interaction
	docker compose exec php sh -c 'mv temp/* temp/.* . 2>/dev/null || true'
	docker compose exec php rm -rf temp
	docker compose exec php composer require webapp --no-interaction
	@echo ""
	@echo "Installation complete!"
	@echo "Access your site at: http://localhost:8080"
	@echo "Mailcatcher at: http://localhost:1080"
