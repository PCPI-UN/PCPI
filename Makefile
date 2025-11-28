.PHONY: help prod-up prod-down prod-build prod-rebuild prod-logs prod-restart prod-env-up prod-env-down prod-env-build prod-env-rebuild prod-env-logs proto-gen clean clean-all

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \\033[36m%-15s\\033[0m %s\\n", $$1, $$2}'

# Production targets
prod-up: ## Start all services in production mode
	docker compose up -d

prod-down: ## Stop all production services
	docker compose down

prod-build: ## Build all production services
	docker compose build

prod-rebuild: ## Rebuild all production services (no cache)
	docker compose build --no-cache

prod-logs: ## Show logs for all production services
	docker compose logs -f

prod-restart: ## Restart all production services
	docker compose restart

# Production targets with explicit .env file
prod-env-up: ## Start all services in production mode with .env file
	docker compose --env-file .env up -d

prod-env-down: ## Stop all production services with .env file
	docker compose --env-file .env down

prod-env-build: ## Build all production services with .env file
	docker compose --env-file .env build

prod-env-rebuild: ## Rebuild all production services with .env file (no cache)
	docker compose --env-file .env build --no-cache

prod-env-logs: ## Show logs for all production services with .env file
	docker compose --env-file .env logs -f

# Utility targets
proto-gen: ## Generate protobuf TypeScript files
	mkdir -p libs/common/src/generated
	npm run proto:generate

clean: ## Clean up Docker resources
	docker compose down -v --remove-orphans
	docker system prune -f

clean-all: ## Clean up all Docker resources including images
	docker compose down -v --remove-orphans
	docker system prune -af
