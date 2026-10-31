.PHONY: dev-network dev-check-env dev-up-dev dev-restart \
	dev-logs-dev dev-down-dev dev-down-all-dev dev-status-dev clean-images help


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

dev-restart: dev-check-env
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) up -d --force-recreate 

dev-logs:
	docker compose -p $(PROJECT_DEV) --env-file $(ENV_DEV) -f $(COMPOSE_DEV) logs -f

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

dev-local-migrate:
	npm run migration:run

clean-images:
	docker image prune -f

help:
	@echo "Infrastruktur Development:"
	@echo "  make dev-network-dev       - Inspeksi dan membuat jaringan warehouse baru bernama $(NETWORK_DEV) pada lingkungan development"
	@echo "  make dev-check-env         - Cek ketersediaan file environment warehouse pada lingkungan development"
	@echo "  make dev-up-dev            - Jalankan seluruh infrastruktur warehouse pada lingkungan development"
	@echo "  make dev-restart           - Restart infrastruktur warehouse pada lingkungan development"
	@echo "  make dev-logs              - Log infrastruktur warehouse pada lingkungan development"
	@echo "  make dev-down              - Matikan infrastruktur warehouse pada lingkungan development"
	@echo "  make dev-down-all          - Matikan dan hapus seluruh volume infrastruktur warehouse pada lingkungan development"
	@echo "  make dev-status            - Tampilkan status container dan image Infrastruktur warehouse yang aktif pada lingkungan development "
	@echo "  make clean-images      	- Hapus image docker lama yang menumpuk"
