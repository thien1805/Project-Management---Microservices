# PM_Microservices

A microservices-based Project Management platform built for SOA coursework.

This repository currently contains:
- A user authentication service (Node.js + PostgreSQL)
- A project/task management service (Node.js + PostgreSQL)
- A notification service (Node.js + PostgreSQL)
- A Next.js frontend that integrates all services
- A Docker Compose setup to run the full stack

## Current Project Scope (What it does now)

### Implemented end-to-end flows
- User can sign up and log in via Auth Service.
- Frontend stores JWT in local storage and loads user profile.
- Logged-in user can create, list, and delete their own projects.
- Project owner can create, list, toggle status, and delete tasks.
- Project owner can add project members.
- Project/task actions trigger notification events sent to Notification Service.
- Frontend has a Notifications tab to read latest notifications for the logged-in user.

### Important behavior notes
- Authorization in project/task APIs is currently owner-based using request payload/query IDs (`owner_id`, `requester_id`, `actor_id`).
- Notification data is persisted in PostgreSQL (`notification.notifications`).
- Auth Service exposes JWT-based profile endpoint, but project/task APIs currently do not verify JWT directly.

## Architecture

### Services
- `auth` (port `3001`): User registration, login, profile, user lookup
- `project_and_task_management` (container port `3000`, host port `3010`): Project and task domain logic
- `notification` (port `3002`): Create/list notification events (PostgreSQL-backed)
- `frontend` (port `3003`): Next.js UI for login/signup/workspace/notifications

### Datastores
- `postgres-auth` (host `5433`) for auth schema/data
- `postgres-task` (host `5432`) for task schema/data
- `postgres-notification` (host `5434`) for notification schema/data

### Service communication
- Frontend -> Auth Service (`/api/auth/*`)
- Frontend -> Project/Task Service (`/api/projects/*`, `/api/tasks/*`)
- Frontend -> Notification Service (`/api/notifications`)
- Project/Task Service -> Notification Service (HTTP POST integration)

## API Summary

### Auth Service (`http://localhost:3001`)
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile` (requires bearer token)
- `GET /api/auth/users/:id`
- `GET /api/auth/users?page=1&limit=10`

### Project & Task Service (`http://localhost:3010`)
- `GET /health`
- `POST /api/projects`
- `GET /api/projects?owner_id=<userId>`
- `GET /api/projects/:id?requester_id=<userId>`
- `DELETE /api/projects/:id` (body includes `actor_id`)
- `POST /api/projects/:id/members`
- `GET /api/projects/:id/members?requester_id=<userId>`
- `GET /api/projects/:id/tasks?requester_id=<userId>`
- `POST /api/tasks`
- `GET /api/tasks/:id?requester_id=<userId>`
- `PUT /api/tasks/:id` (body includes `actor_id`)
- `PATCH /api/tasks/:id/status` (body includes `actor_id`)
- `DELETE /api/tasks/:id` (body includes `actor_id`)

### Notification Service (`http://localhost:3002`)
- `GET /health`
- `POST /api/notifications`
- `GET /api/notifications?recipient_id=<userId>&source_service=project_and_task_management&limit=50`

Persistence details:
- Table: `notification.notifications`
- SQL bootstrap file: `notification/sql/init.sql`

## Run With Docker Compose (Recommended)

From repository root:

```bash
docker compose up --build
```

After startup:
- Frontend: `http://localhost:3003`
- Auth Service: `http://localhost:3001`
- Project & Task Service: `http://localhost:3010`
- Notification Service: `http://localhost:3002`

To stop:

```bash
docker compose down
```

To stop and remove volumes:

```bash
docker compose down -v
```

## Local Development (Without Docker)

You can run each service independently, but you must provide environment variables manually.

### Auth Service
```bash
cd auth
npm install
node src/app.js
```

Required env vars:
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES`

### Project & Task Service
```bash
cd project_and_task_management
npm install
npm run dev
```

Required env vars:
- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `NOTIFICATION_ENABLED`
- `NOTIFICATION_URL`

### Notification Service
```bash
cd notification
npm install
npm run dev
```

Required env vars:
- `PORT` (optional, defaults to `3002`)
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Frontend env vars:
- `NEXT_PUBLIC_AUTH_SERVICE_URL`
- `NEXT_PUBLIC_TASK_SERVICE_URL`
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL`

## Repository Structure

```text
PM_Microservices/
  docker-compose.yml
  auth/
  frontend/
  notification/
  project_and_task_management/
```

## Known Gaps / Next Improvements

- Replace request-ID based authorization with JWT verification in project/task service.
- Add async messaging between services (SQS/EventBridge) to decouple notification writes.
- Add automated tests (unit/integration/e2e) for all services.
- Add API gateway and centralized auth policy.
- Add OpenAPI/Swagger specs for all services.

## AWS Deployment Guide

See `DEPLOYAWS.md` for a full deployment plan aligned with course requirements (ECR, ECS/Fargate, ALB, RDS, CloudWatch, and CI/CD).

## Tech Stack

- Backend: Node.js, Express
- Frontend: Next.js 14, React 18, TypeScript, Tailwind CSS
- Databases: PostgreSQL (Auth, Project/Task, Notification)
- Orchestration: Docker Compose
