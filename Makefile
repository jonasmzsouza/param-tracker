SHELL := /bin/bash

# Project
PROJECT_NAME := param-tracker

# Docker
DOCKER := docker
DC := $(DOCKER) compose

# Default target
.DEFAULT_GOAL := help


help:
	@echo ""
	@echo "Param Tracker Development Commands"
	@echo ""
	@echo "make up          - Start all services"
	@echo "make down        - Stop all services"
	@echo "make restart     - Restart services"
	@echo "make build       - Build containers"
	@echo "make logs        - Show logs"
	@echo ""
	@echo "Documentation"
	@echo "make docs        - Start docs preview"
	@echo "make docs-build  - Build docs (_site)"
	@echo ""
	@echo "Utilities"
	@echo "make clean       - Remove containers and cache"
	@echo "make ps          - Show running containers"
	@echo ""


up:
	$(DC) up -d


down:
	$(DC) down


restart:
	$(DC) down
	$(DC) up -d


build:
	$(DC) up -d --build


logs:
	$(DC) logs -f


ps:
	$(DC) ps


docs:
	$(DC) up docs


docs-build:
	$(DC) run --rm docs bundle exec jekyll build


clean:
	$(DC) down -v
	rm -rf _site .jekyll-cache
