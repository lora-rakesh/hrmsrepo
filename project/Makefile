# Makefile for HRMS Development

.PHONY: help install install-backend install-frontend setup-db run-backend run-frontend run test clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}\' $(MAKEFILE_LIST)

install: install-backend install-frontend ## Install all dependencies

install-backend: ## Install backend dependencies
	cd backend && python -m pip install -r requirements.txt

install-frontend: ## Install frontend dependencies
	npm install

setup-db: ## Setup database and run migrations
	cd backend && python manage.py migrate
	cd backend && python manage.py loaddata fixtures/demo_data.json
	cd backend && python manage.py create_demo_users

run-backend: ## Run Django development server
	cd backend && python manage.py runserver

run-frontend: ## Run React development server
	npm run dev

run: ## Run both backend and frontend (requires two terminals)
	@echo "Run 'make run-backend' in one terminal and 'make run-frontend' in another"

test: ## Run tests
	cd backend && python manage.py test
	npm run test

clean: ## Clean up generated files
	find . -name "*.pyc" -delete
	find . -name "__pycache__" -delete
	rm -rf node_modules
	rm -rf backend/staticfiles

# Docker commands
docker-build: ## Build Docker images
	docker-compose build

docker-up: ## Start services with Docker
	docker-compose up -d

docker-down: ## Stop Docker services
	docker-compose down

docker-logs: ## View Docker logs
	docker-compose logs -f

# Development helpers
migrate: ## Run Django migrations
	cd backend && python manage.py makemigrations
	cd backend && python manage.py migrate

superuser: ## Create Django superuser
	cd backend && python manage.py createsuperuser

shell: ## Open Django shell
	cd backend && python manage.py shell

collectstatic: ## Collect static files
	cd backend && python manage.py collectstatic --noinput