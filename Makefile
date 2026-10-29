.PHONY: up down down-all watch logs log-queue dev build build-ts clean restart debug-notif \
	up-prod down-prod build-prod build-prod-no-cache restart-prod  \
	logs-prod   status-prod \
	  enable-docker-on-boot clean-prod-images \
	 check-env-prod help

# Docker Compose files
COMPOSE_DEV = docker-compose.dev.yml
COMPOSE_PROD = docker-compose.prod.yml
DEV_CONTAINER = warehouse-api-dev
PROD_CONTAINER = warehouse-api-prod
ENV_DEV=.env
ENV_PROD=.env.prod
PROJECT_DEV = warehouse-project-dev
PROJECT_PROD = warehouse-project-prod


# ================================
# DEVELOPMENT
# ================================

# Menjalankan container environment development (background)
up-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) up -d --force-recreate

# Build dan jalankan Docker container
build-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) build --no-cache
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) up -d

watch-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) up

# Mematikan container environment development
down-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) down

# Mematikan container environment development beserta volumenya
down-dev-all:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) down -v

# Melihat logs dari service API secara real-time
logs-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) logs -f warehouse-api-dev

log-queue-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) logs -f warehouse-rabbitmq-dev

# Menjalankan development server di lokal (tanpa Docker)
manual-dev:
	npm run dev

# Melakukan build project TypeScript (Nama diubah menjadi build-ts)
build-ts:
	npm run build

# Menghapus hasil build
clean:
	rm -rf dist

# Restart container development
restart: down-dev up-dev

debug-notif-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) exec $(DEV_CONTAINER) npm run debug:notif

debug-loki-dev:
	docker compose -p $(PROJECT_DEV) -f $(COMPOSE_DEV) exec $(DEV_CONTAINER) npm run debug:loki



# ================================
# PRODUCTION
# ================================
check-env-prod:
	@test -f $(ENV_PROD) || (echo "!! File ${ENV_PROD} untuk API tidak ditemukan" && exit 1)

up-prod:  check-env-prod
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) up -d --force-recreate
	@echo ">> Production up. Cek status dengan: make "

build-prod:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) up -d --build

build-prod-no-cache:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) build --no-cache
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) up -d

down-prod:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) down

down-prod-all:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) down -v

restart-prod: down-prod  up-prod

logs-prod:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) logs -f warehouse-api-prod

status-prod:
	@echo ">> API:"
	@docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) ps

clean-prod-images:
	docker image prune -f

enable-docker-on-boot:
	sudo systemctl enable docker
	sudo systemctl is-enabled docker

debug-notif-prod:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) exec $(PROD_CONTAINER) npm run debug:notif

debug-loki-prod:
	docker compose -p $(PROJECT_PROD) -f $(COMPOSE_PROD) exec $(PROD_CONTAINER) node dist/debug/test-loki.js

mem-prod:
	@docker stats --no-stream --format "table {{.Name}}\t{{.MemUsage}}\t{{.MemPerc}}\t{{.CPUPerc}}"
	@echo ""
	@free -h

help:
	@echo "Development:"
	@echo "  make up                    - Jalankan environment development (background)"
	@echo "  make build                 - Build & jalankan development"
	@echo "  make watch                 - Jalankan development (foreground, lihat log langsung)"
	@echo "  make down                  - Matikan development"
	@echo "  make down-all              - Matikan development + hapus volume"
	@echo "  make logs                  - Log service API development"
	@echo "  make log-queue             - Log RabbitMQ development"
	@echo "  make dev                   - Jalankan server lokal tanpa Docker"
	@echo "  make build-ts              - Build TypeScript"
	@echo "  make clean                 - Hapus folder dist"
	@echo "  make restart               - Restart development"
	@echo "  make debug-notif-dev           - Jalankan script test notifikasi"
	@echo "  make debug-loki-dev           - Jalankan script test debug log loki"
	@echo ""
	@echo "Production:"
	@echo "  make check-env-prod				- Check file environment of production"
	@echo "  make up-prod               - Jalankan seluruh production (infra lalu API)"
	@echo "  make build-prod            - Rebuild & restart API production saja"
	@echo "  make build-prod-no-cache   - Rebuild API production tanpa cache Docker"
	@echo "  make down-prod             - Matikan API production"
	@echo "  make restart-prod          - Restart penuh production"
	@echo "  make logs-prod             - Log API production"
	@echo "  make clean-prod-images     - Hapus image Docker lama yang menumpuk"
	@echo "  make status-prod     			- Menampilkan status container dan image"
	@echo "  make enable-docker-on-boot - Pastikan Docker auto-start saat server reboot"
	@echo "  make debug-notif-prod           - Jalankan script test notifikasi"
	@echo "  make debug-loki-prod           - Jalankan script test debug log loki"
