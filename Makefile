.PHONY: dev-network dev-check-env dev-up dev-restart \
    dev-logs dev-down dev-down-all dev-status dev-build-no-cache \
    dev-compose-migrate dev-compose-migrate-revert dev-local-migrate \
    clean-images help


# SERVICE NAME
SERVICE_DEV_NAME = pm-api-dev

# Environment files
ENV_DEV = .env.dev
ENV_PROD = .env.prod

# Project names
PROJECT_DEV = pm-project-dev
PROJECT_PROD = pm-project-prod

# Compose files
COMPOSE_DEV = docker-compose.dev.yml
COMPOSE_PROD = docker-compose.prod.yml

# Network Names
NETWORK_DEV = pm-network-dev
NETWORK_PROD = pm-network-prod

# Container Name Development
CONTAINER_API_DEV = pm-api-dev
CONTAINER_REDIS_DEV = pm-redis-dev
CONTAINER_DATABASE_DEV = pm-db-dev
CONTAINER_RABBIT_DEV = pm-rabbitmq-dev

# Container Name Development
CONTAINER_API_PROD = pm-api-prod

# Global variables
HEALTHCHECK_TIMEOUT=120


# =============== CLI Development =========================


# Check and create network if not exists
dev-network:
	docker network inspect $(NETWORK_DEV) >/dev/null 2>&1 || \
		docker network create $(NETWORK_DEV)

# Check environment variables
dev-check-env:
	@test -f $(ENV_DEV) || (echo "!! File $(ENV_DEV) untuk infrastruktur tidak ditemukan" && exit 1)

# Start development infrastructure
dev-up: dev-check-env dev-network
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) up -d --force-recreate

# Build development image without cache
dev-build-no-cache: dev-check-env dev-network
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) build --no-cache

# Build and start development infrastructure without cache
dev-up-no-cache: dev-check-env dev-network
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) build --no-cache
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) up -d --force-recreate

dev-restart: dev-check-env
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) up -d --force-recreate 

dev-logs:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) logs -f

dev-log-app:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) logs -f $(CONTAINER_API_DEV)

dev-down:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) down

dev-down-all:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) down -v

dev-status:
	@echo ">> Infrastruktur Development:"
	@docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) ps

dev-compose-migrate:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) exec $(SERVICE_DEV_NAME) npm run migration:run

# Revert last database migration via Docker Compose
dev-compose-migrate-revert:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) exec $(SERVICE_DEV_NAME) npm run migration:revert

# Run Seeder 
dev-compose-seed:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) exec $(SERVICE_DEV_NAME) npm run seed

dev-local-migrate:
	npm run migration:run

dev-redis-healthcheck:
	docker inspect --format='{{json .State.Health.Status}}' $(CONTAINER_REDIS_DEV)
	

clean-images:
	docker image prune -f

help:
	@echo "Infrastruktur Development:"
	@echo "  make dev-network           - Inspeksi dan membuat jaringan baru bernama $(NETWORK_DEV) pada lingkungan development"
	@echo "  make dev-check-env         - Cek ketersediaan file environment pada lingkungan development"
	@echo "  make dev-up                - Jalankan seluruh infrastruktur pada lingkungan development"
	@echo "  make dev-build-no-cache    - Build ulang image docker tanpa cache pada lingkungan development"
	@echo "  make dev-up-no-cache       - Build tanpa cache dan jalankan ulang seluruh infrastruktur development"
	@echo "  make dev-restart           - Restart infrastruktur pada lingkungan development"
	@echo "  make dev-logs              - Log infrastruktur pada lingkungan development"
	@echo "  make dev-down              - Matikan infrastruktur pada lingkungan development"
	@echo "  make dev-down-all          - Matikan dan hapus seluruh volume infrastruktur pada lingkungan development"
	@echo "  make dev-status            - Tampilkan status container dan image infrastruktur yang aktif"
	@echo "  make clean-images          - Hapus image docker lama yang menumpuk"