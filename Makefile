.PHONY: help dev-up dev-down dev-build dev-logs prod-up prod-down prod-build proto-gen clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-15s\033[0m %s\n", $$1, $$2}'

# Development targets
dev-up: ## Start all services in development mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up

dev-up-d: ## Start all services in development mode (detached)
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up -d

dev-down: ## Stop all development services
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down

dev-down-v: ## Stop all development services and remove volumes
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down -v

dev-build: ## Build all development services
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml build

dev-rebuild: ## Rebuild all development services (no cache)
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml build --no-cache

dev-logs: ## Show logs for all development services
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml logs -f

dev-restart: ## Restart all development services
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml restart

# Development targets with explicit .env file
dev-env-up: ## Start all services in development mode with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.dev.yml up

dev-env-up-d: ## Start all services in development mode with .env file (detached)
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.dev.yml up -d

dev-env-build: ## Build all development services with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.dev.yml build

dev-env-rebuild: ## Rebuild all development services with .env file (no cache)
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.dev.yml build --no-cache

dev-env-logs: ## Show logs for all development services with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.dev.yml logs -f

# Production targets
prod-up: ## Start all services in production mode
	docker compose -f docker-compose.base.yml -f docker-compose.prod.yml up -d

prod-down: ## Stop all production services
	docker compose -f docker-compose.base.yml -f docker-compose.prod.yml down

prod-build: ## Build all production services
	docker compose -f docker-compose.base.yml -f docker-compose.prod.yml build

prod-logs: ## Show logs for all production services
	docker compose -f docker-compose.base.yml -f docker-compose.prod.yml logs -f

prod-restart: ## Restart all production services
	docker compose -f docker-compose.base.yml -f docker-compose.prod.yml restart

# Production targets with explicit .env file
prod-env-up: ## Start all services in production mode with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.prod.yml up -d

prod-env-down: ## Stop all production services with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.prod.yml down

prod-env-build: ## Build all production services with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.prod.yml build

prod-env-rebuild: ## Rebuild all production services with .env file (no cache)
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.prod.yml build --no-cache

prod-env-logs: ## Show logs for all production services with .env file
	docker compose --env-file .env -f docker-compose.base.yml -f docker-compose.prod.yml logs -f

# Utility targets
proto-gen: ## Generate protobuf TypeScript files
	mkdir -p libs/common/src/generated
	npm run proto:generate

clean: ## Clean up Docker resources
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean up all Docker resources including images
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -af

# Individual service targets (development)
gateway: ## Start only gateway in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up gateway

auth: ## Start only auth-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up auth-service

eval: ## Start only evaluation-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up evaluation-service

event: ## Start only event-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up event-service

invite: ## Start only invitation-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up invitation-service

project: ## Start only project-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up project-service

notify: ## Start only notification-service in dev mode
	docker compose -f docker-compose.base.yml -f docker-compose.dev.yml up notification-service
