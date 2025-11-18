.PHONY: help dev-up dev-down dev-build dev-logs dev-restart dev-deploy-up dev-deploy-down dev-deploy-build dev-deploy-logs prod-up prod-down prod-build proto-gen clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \\033[36m%-20s\\033[0m %s\\n", $$1, $$2}'

# ==================================================================
# DEVELOPMENT TARGETS
# ==================================================================

dev-up: ## Start all services in development mode
	docker compose --env-file .env -f docker-compose.dev.yml up

dev-up-d: ## Start all services in development mode (detached)
	docker compose --env-file .env -f docker-compose.dev.yml up -d

dev-down: ## Stop all development services
	docker compose --env-file .env -f docker-compose.dev.yml down

dev-down-v: ## Stop all development services and remove volumes
	docker compose --env-file .env -f docker-compose.dev.yml down -v

dev-build: ## Build all development services
	docker compose --env-file .env -f docker-compose.dev.yml build

dev-rebuild: ## Rebuild all development services (no cache)
	docker compose --env-file .env -f docker-compose.dev.yml build --no-cache

dev-logs: ## Show logs for all development services
	docker compose --env-file .env -f docker-compose.dev.yml logs -f

dev-restart: ## Restart development services (all or specific service with service=<name>)
ifdef service
	docker compose --env-file .env -f docker-compose.dev.yml restart $(service)
else
	docker compose --env-file .env -f docker-compose.dev.yml restart
endif

# ==================================================================
# DEVELOPMENT DEPLOYMENT TARGETS (Testing environment for frontend)
# ==================================================================

dev-deploy-up: ## Start all services in dev-deploy mode
	docker compose --env-file .env -f docker-compose.dev-deploy.yml up -d

dev-deploy-down: ## Stop all dev-deploy services
	docker compose --env-file .env -f docker-compose.dev-deploy.yml down

dev-deploy-down-v: ## Stop all dev-deploy services and remove volumes
	docker compose --env-file .env -f docker-compose.dev-deploy.yml down -v

dev-deploy-build: ## Build all dev-deploy services
	docker compose --env-file .env -f docker-compose.dev-deploy.yml build

dev-deploy-rebuild: ## Rebuild all dev-deploy services (no cache)
	docker compose --env-file .env -f docker-compose.dev-deploy.yml build --no-cache

dev-deploy-logs: ## Show logs for all dev-deploy services
	docker compose --env-file .env -f docker-compose.dev-deploy.yml logs -f

dev-deploy-restart: ## Restart dev-deploy services (all or specific service with service=<name>)
ifdef service
	docker compose --env-file .env -f docker-compose.dev-deploy.yml restart $(service)
else
	docker compose --env-file .env -f docker-compose.dev-deploy.yml restart
endif

# ==================================================================
# PRODUCTION TARGETS
# ==================================================================

prod-up: ## Start all services in production mode
	docker compose --env-file .env -f docker-compose.prod.yml up -d

prod-down: ## Stop all production services
	docker compose --env-file .env -f docker-compose.prod.yml down

prod-down-v: ## Stop all production services and remove volumes
	docker compose --env-file .env -f docker-compose.prod.yml down -v

prod-build: ## Build all production services
	docker compose --env-file .env -f docker-compose.prod.yml build

prod-rebuild: ## Rebuild all production services (no cache)
	docker compose --env-file .env -f docker-compose.prod.yml build --no-cache

prod-logs: ## Show logs for all production services
	docker compose --env-file .env -f docker-compose.prod.yml logs -f

prod-restart: ## Restart production services (all or specific service with service=<name>)
ifdef service
	docker compose --env-file .env -f docker-compose.prod.yml restart $(service)
else
	docker compose --env-file .env -f docker-compose.prod.yml restart
endif

# ==================================================================
# UTILITY TARGETS
# ==================================================================

proto-gen: ## Generate protobuf TypeScript files
	mkdir -p libs/common/src/generated
	npm run proto:generate

clean: ## Clean up Docker resources
	docker compose --env-file .env -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean up all Docker resources including images
	docker compose --env-file .env -f docker-compose.dev.yml down -v --remove-orphans
	docker system prune -af

# ==================================================================
# INDIVIDUAL SERVICE TARGETS (Development)
# ==================================================================

gateway: ## Start only gateway in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up gateway

auth: ## Start only auth-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up auth-service

eval: ## Start only evaluation-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up evaluation-service

event: ## Start only event-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up event-service

invite: ## Start only invitation-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up invitation-service

project: ## Start only project-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up project-service

notify: ## Start only notification-service in dev mode
	docker compose --env-file .env -f docker-compose.dev.yml up notification-service
