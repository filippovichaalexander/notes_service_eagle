# CI/CD Pipeline Guide

GitHub Actions воркфлоу для автоматизированного тестирования, сборки и развертывания.

## Workflows

### 1. Тестирование & Linting (`test.yml`)

При каждом push and pull:
- Lint frontend and backend code
- Build frontend and backend
- Test with Node 18 and 20

**Trigger**: Push to main/develop, Pull requests

### 2. Build & Push Docker Images (`build-and-push.yml`)

Builds and pushes Docker images to Docker Hub and GitHub Container Registry:
- Backend image: `notes-backend:tag`
- Frontend image: `notes-frontend:tag`

**Trigger**: Push в main

### 3. Deploy to Production (`deploy.yml`)

Развертывает на AWS ECS:
- Создает GitHub деплоймент
- Обновляет ECS сервис
- Отправляет уведомление в Slack

**Trigger**: Version tags (v*), manual workflow dispatch

### 4. Security Scan (`security-scan.yml`)

Всесторонняя проверка безопасности:
- Аудит зависимостей npm
- Статический анализ кода (CodeQL)
- Поиск уязвимостей в Docker-образах (Trivy)

**Trigger**: Push в main/develop

### 5. Performance Tests (`performance.yml`)

Запускает Lighthouse CI для метрик производительности:
- Производительность загрузки страниц
- Доступность
- Лучшие практики
- SEO

**Trigger**: Push в main/develop

## Setup Instructions

### 1. Настройка Docker Hub

1. Создайте аккаунт в Docker Hub
2. Сгенерируйте токен доступа
3. Добавьте в GitHub Secrets

### 2. Настройка AWS ECS

1. Create ECS cluster: `notes-app-cluster`
2. Create ECS service: `notes-app-service`
3. Add AWS credentials to GitHub Secrets

## Локальное тестирование

Используйте тестирование, применяя `act`:

\`\`\`bash
# Install act
brew install act

# Run specific workflow
act push -j test-frontend

# Run with secrets
act -s DOCKER_USERNAME=myuser -s DOCKER_PASSWORD=mypass
\`\`\`

## Стратегия развёртывания

Стратегия развертывания
Коммит кода в feature ветку
Создание пул-реквеста (запускает тесты)
После одобрения - мердж в develop ветку
Создание версионного тега: git tag v1.0.0
Отправка тега: git push --tags
Автоматическое развертывание воркфлоу в продакшен

## Мониторинг

- View workflow runs: GitHub > Actions tab
- Check deployment status: GitHub > Environments
- View container images: Docker Hub or GitHub Container Registry
- Monitor production: AWS CloudWatch
\`\`\`
