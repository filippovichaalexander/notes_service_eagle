# Docker Setup Guide

Полное руководство по запуску всего приложения Notes с использованием Docker и Docker-Compose.

## Prerequisites

- Docker 20.10+
- Docker Compose 2.0+
- Git

## Quick Start

### 1. Clone and Setup

\`\`\`bash
git clone <your-repo>
cd notes-app
cp .env.example .env
\`\`\`

### 2. Build and Start All Services

\`\`\`bash
docker-compose up -d
\`\`\`

Эта команда запустит:
- PostgreSQL Database
- Redis Cache
- NATS Message Broker
- Moleculer Backend
- Next.js Frontend
- Nginx Reverse Proxy

### 3. Access the Application

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **Database**: localhost:5432
- **Redis**: localhost:6379

## Service Details

### Database (PostgreSQL)
- Port: 5432
- User: postgres (default)
- Password: postgres (default)
- Database: notes_app

### Cache (Redis)
- Port: 6379

### Message Broker (NATS)
- Port: 4222
- WebUI: http://localhost:8222

### Backend (Moleculer)
- Port: 3001
- Services: notes, users, api-gateway

### Frontend (Next.js)
- Port: 3000
- Built with React and TypeScript

## Common Commands

### Start Services
\`\`\`bash
docker-compose up -d
\`\`\`

### Stop Services
\`\`\`bash
docker-compose down
\`\`\`

### View Logs
\`\`\`bash
docker-compose logs -f backend
docker-compose logs -f frontend
\`\`\`

### Rebuild Containers
\`\`\`bash
docker-compose up -d --build
\`\`\`

### Access Container Shell
\`\`\`bash
docker exec -it notes-backend sh
docker exec -it notes-frontend sh
\`\`\`

## Environment Variables

Отредактируйте `.env` файл:

- `JWT_SECRET` - Изменить для продакшена
- `POSTGRES_PASSWORD` - Пароль базы данных
- `NEXT_PUBLIC_API_URL` - URL API для фронтенда
- `NODE_ENV` - Установить в 'production' для продакшен сборок

## Для развёртывания в продакшн
1. Обновите .env с продакшен значениями
2. Установите `NODE_ENV=production`
3. Сгенерируйте SSL сертификаты
4. Обновите `nginx.conf` с вашим доменом

\`\`\`bash
docker-compose -f docker-compose.yml up -d
\`\`\`

## Troubleshooting

### Services won't start
\`\`\`bash
docker-compose down
docker volume prune
docker-compose up -d --build
\`\`\`

### Check service health
\`\`\`bash
docker-compose ps
\`\`\`

### View backend logs
\`\`\`bash
docker-compose logs -f backend
\`\`\`
