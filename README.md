# Notes Application - Полнофункциональное приложение для управления заметками

Современное приложение для управления заметками с микросервисной архитектурой, аутентификацией JWT, полнотекстовым поиском и категоризацией.

## Функции

- **Аутентификация**: JWT-based регистрация и вход
- **Управление заметками**: CRUD операции с категориями и тегами
- **Полнотекстовый поиск**: Поиск по названию, содержимому и тегам
- **Категории**: Организация заметок по категориям с цветовой кодировкой
- **Микросервисы**: Moleculer архитектура с сервисами Notes и Users
- **Масштабируемость**: NATS для межсервисного взаимодействия

## Технологический стек

### Frontend
- Next.js 16 + React 19
- TypeScript
- Tailwind CSS
- SWR для управления состоянием

### Backend
- Moleculer микросервисы
- Node.js + TypeScript
- NATS message broker
- PostgreSQL 15
- Redis для кеширования

### Инфраструктура
- Docker & Docker-Compose
- Nginx (reverse proxy)
- GitHub Actions (CI/CD)
- PostgreSQL, Redis, NATS

## Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+

### Развертывание одной командой

\`\`\`bash
# 1. Клонируйте репозиторий
git clone <your-repo>
cd notes-app

# 2. Скопируйте файл переменных окружения
cp .env.example .env

# 3. Запустите все сервисы
docker-compose up -d

# 4. Откройте приложение
# Frontend: http://localhost:3000
# API: http://localhost:3001
\`\`\`

## Доступ к приложению

После запуска `docker-compose up -d` приложение доступно по адресам:

| Сервис | URL | Описание |
|--------|-----|---------|
| Frontend | http://localhost:3000 | Next.js приложение |
| API Gateway | http://localhost:3001 | REST API |
| PostgreSQL | localhost:5432 | База данных |
| Redis | localhost:6379 | Кеш и сессии |
| NATS WebUI | http://localhost:8222 | Мониторинг message broker |
| Nginx | http://localhost | Reverse proxy |

## Структура проекта

\`\`\`
notes-app/
├── app/                          # Next.js frontend
│   ├── api/
│   │   ├── auth/                # Аутентификация (login, register)
│   │   ├── notes/               # Notes API endpoints
│   │   ├── categories/          # Categories API endpoints
│   │   └── middleware/          # JWT проверка
│   ├── page.tsx                 # Главная страница
│   └── layout.tsx               # Root layout
├── backend/                      # Moleculer микросервисы
│   ├── services/
│   │   ├── notes.service.ts    # Notes сервис
│   │   └── users.service.ts    # Users сервис
│   ├── api-gateway.ts           # API Gateway
│   ├── moleculer.config.ts     # Конфигурация
│   └── index.ts                 # Точка входа
├── docker-compose.yml           # Оркестрация сервисов
├── Dockerfile.backend           # Backend образ
├── Dockerfile.frontend          # Frontend образ
├── nginx.conf                   # Конфигурация reverse proxy
├── .github/workflows/           # GitHub Actions CI/CD
└── docker-setup.md              # Детальное руководство Docker
\`\`\`

## API Endpoints

### Аутентификация

\`\`\`http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
\`\`\`

\`\`\`http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
\`\`\`

**Response:**
\`\`\`json
{
  "token": "eyJhbGc...",
  "user": {
    "id": "1",
    "email": "user@example.com",
    "name": "User Name"
  }
}
\`\`\`

### Заметки

\`\`\`http
GET /api/notes
Authorization: Bearer <token>
\`\`\`

\`\`\`http
POST /api/notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "My Note",
  "content": "Note content...",
  "categoryId": "1",
  "tags": ["important", "work"]
}
\`\`\`

\`\`\`http
PATCH /api/notes/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated title",
  "content": "Updated content"
}
\`\`\`

\`\`\`http
DELETE /api/notes/:id
Authorization: Bearer <token>
\`\`\`

### Поиск

\`\`\`http
GET /api/notes?search=keyword
Authorization: Bearer <token>
\`\`\`

Поиск работает по названию, содержимому и тегам.

### Категории

\`\`\`http
GET /api/categories
Authorization: Bearer <token>
\`\`\`

\`\`\`http
POST /api/categories
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Work",
  "color": "#FF6B6B"
}
\`\`\`

## Команды Docker Compose

\`\`\`bash
# Запуск всех сервисов в фоне
docker-compose up -d

# Остановка всех сервисов
docker-compose down

# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f backend
docker-compose logs -f frontend

# Пересборка образов
docker-compose up -d --build

# Удалить все volumes (база данных будет очищена)
docker-compose down -v

# Вход в контейнер
docker exec -it notes-backend sh
docker exec -it notes-frontend sh
\`\`\`

## Переменные окружения

### .env файл

\`\`\`env
# Database
POSTGRES_DB=notes_app
POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres

# JWT
JWT_SECRET=your-secret-key-change-in-production

# API URLs
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://backend:3001

# Environment
NODE_ENV=development
\`\`\`

**Важно:** В продакшене измените:
- `JWT_SECRET` на надежный секретный ключ
- `POSTGRES_PASSWORD` на надежный пароль
- `NODE_ENV` на `production`
- `NEXT_PUBLIC_API_URL` на URL вашего домена

## Развертывание на производство

### Используя Docker Compose

\`\`\`bash
# 1. Обновите .env для продакшена
cp .env.example .env
# Отредактируйте .env с production значениями

# 2. Запустите с production конфигурацией
NODE_ENV=production docker-compose up -d
\`\`\`

### Используя Kubernetes

1. Создайте Docker images
2. Загрузите их в Docker registry
3. Разверните используя Helm charts или kubectl manifests

## CI/CD Pipeline

Проект включает GitHub Actions workflows для:

- **Testing** (.github/workflows/test.yml): Запуск тестов и линтера
- **Build & Push** (.github/workflows/build-and-push.yml): Сборка Docker образов и загрузка в registry
- **Deploy** (.github/workflows/deploy.yml): Автоматическое развертывание на production
- **Security Scan** (.github/workflows/security-scan.yml): CodeQL, зависимости, сканирование образов
- **Performance** (.github/workflows/performance.yml): Lighthouse тестирование

Подробнее: см. [CI-CD-GUIDE.md](CI-CD-GUIDE.md)

## Локальная разработка (без Docker)

### Требования
- Node.js 18+
- PostgreSQL 15+
- Redis 7+
- NATS 2+

### Запуск frontend

\`\`\`bash
npm install

// дополнительно выполнить
npm install --save-dev @types/jsonwebtoken

npm run dev
# Откройте http://localhost:3000
\`\`\`

### Запуск backend

\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

## Микросервисная архитектура

### Notes Service
Отвечает за управление заметками:
- Создание, чтение, обновление, удаление заметок
- Категоризация и тегирование
- Полнотекстовый поиск

### Users Service
Отвечает за управление пользователями:
- Регистрация и аутентификация
- Управление профилем
- JWT токены

### API Gateway
Объединяет микросервисы и предоставляет REST API:
- Маршрутизация запросов
- JWT проверка
- Ответы от сервисов

## Troubleshooting

### Проблема: Сервисы не запускаются

\`\`\`bash
# Удалите старые volumes и пересоберите
docker-compose down -v
docker-compose up -d --build
\`\`\`

### Проблема: Ошибка подключения к БД

\`\`\`bash
# Проверьте статус сервисов
docker-compose ps

# Просмотрите логи backend
docker-compose logs backend
\`\`\`

### Проблема: Frontend не может подключиться к API

- Убедитесь что backend запущен: `docker-compose logs backend`
- Проверьте `NEXT_PUBLIC_API_URL` в .env
- Проверьте CORS настройки в backend

### Очистка и переинициализация

\`\`\`bash
# Полная очистка
docker-compose down -v
rm -rf backend/node_modules frontend/node_modules

# Запуск с нуля
docker-compose up -d --build
\`\`\`

## Документация

- [Docker Setup Guide](docker-setup.md) - Детальное руководство Docker Compose
- [CI/CD Guide](CI-CD-GUIDE.md) - GitHub Actions workflows
- [Backend README](backend/README.md) - Микросервисная архитектура

## Командда разработки

### Frontend разработка

\`\`\`bash
npm run dev          # Запуск dev сервера
npm run build        # Сборка для production
npm run lint         # Проверка кода
npm run type-check   # TypeScript проверка
\`\`\`

### Backend разработка

\`\`\`bash
cd backend
npm run dev          # Запуск Moleculer в dev режиме
npm run build        # Сборка для production
npm run lint         # Проверка кода
\`\`\`

## База данных

**PostgreSQL 15** используется как основное хранилище данных.

### Подключение к БД

\`\`\`bash
# Через docker exec
docker exec -it notes-db psql -U postgres -d notes_app

# Или используя внешний клиент
# psql postgresql://postgres:postgres@localhost:5432/notes_app
\`\`\`

### Таблицы

- `users` - Пользователи (email, password hash, профиль)
- `notes` - Заметки (title, content, userId, categoryId, createdAt, updatedAt)
- `categories` - Категории (name, color, userId)
- `note_tags` - Теги заметок (noteId, tag)

## Поддержка и вопросы

Для вопросов, багов и предложений создавайте Issues в GitHub репозитории.

## Лицензия

MIT License - смотрите LICENSE файл для деталей
