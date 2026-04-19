# PM Microservices Documentation

## 1) Tong quan kien truc

He thong gom 4 service:

- `auth`: Dang ky, dang nhap, tra cuu nguoi dung
- `project_and_task_management`: Quan ly project, member va task
- `notification`: Nhan su kien thong bao tu cac service khac
- `frontend`: Giao dien Next.js

Service giao tiep qua HTTP noi bo trong Docker network.

### Luong thong bao hien tai

Chi `project_and_task_management` gui thong bao den `notification` theo yeu cau:

- Tao project (`PROJECT_CREATED`)
- Them thanh vien vao project (`PROJECT_MEMBER_ADDED`)
- Tao task (`TASK_CREATED`)
- Cap nhat task (`TASK_UPDATED`)
- Doi trang thai task (`TASK_STATUS_CHANGED`)
- Xoa task (`TASK_DELETED`)
- Xoa project (`PROJECT_DELETED`)

Neu `notification` bi loi, API nghiep vu van tra ket qua thanh cong (non-blocking) va ghi log loi ra console.

## 2) API minh bach

Tat ca endpoint duoi day da co san trong code.

### 2.1 Auth service (`http://localhost:3001`)

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/profile`
- `GET /api/auth/users/:id`
- `GET /api/auth/users?page=1&limit=10`

### 2.2 Project & Task service (local: `http://localhost:3000`, docker compose host: `http://localhost:3010`)

- `GET /health`
- `POST /api/projects`
- `GET /api/projects`
- `GET /api/projects/:id`
- `DELETE /api/projects/:id`
- `POST /api/projects/:id/members`
- `GET /api/projects/:id/members`
- `GET /api/projects/:id/tasks`
- `POST /api/tasks`
- `GET /api/tasks/:id`
- `PUT /api/tasks/:id`
- `PATCH /api/tasks/:id/status`
- `DELETE /api/tasks/:id`

### 2.3 Notification service (`http://localhost:3002`)

- `GET /health`
- `POST /api/notifications`
- `GET /api/notifications`

#### Payload POST `/api/notifications`

```json
{
  "event_type": "TASK_CREATED",
  "title": "Task created: Build API",
  "message": "Task \"Build API\" was created in project 1",
  "recipient_ids": [1, 2],
  "source_service": "project_and_task_management",
  "source_reference": "task:10",
  "metadata": {
    "task_id": 10,
    "project_id": 1,
    "status": "todo"
  }
}
```

#### Query GET `/api/notifications`

Ho tro filter:

- `event_type`
- `source_service`
- `recipient_id`
- `limit`

## 3) Frontend hien co gi va da tich hop gi

### 3.1 Trang hien co

- Landing page: `/`
- Login page: `/login`
- Sign up page: `/signup`
- Workspace page: `/workspace`

### 3.2 Tinh trang truoc khi tich hop

- Frontend chi co UI mau.
- Login trong context la gia lap, chua goi auth service.
- Chua co man hinh doc/ghi du lieu project-task tu backend.

### 3.3 Da tich hop backend service

Da tich hop frontend voi cac service:

- `auth`
  - Login that qua `POST /api/auth/login`
  - Sign up qua `POST /api/auth/register`
  - Luu `access_token` trong localStorage
  - Lay profile qua `GET /api/auth/profile`
  - Logout xoa token
- `project_and_task_management`
  - Lay danh sach project qua `GET /api/projects`
  - Tao project qua `POST /api/projects`
  - Xoa project qua `DELETE /api/projects/:id`
  - Lay task theo project qua `GET /api/projects/:id/tasks`
  - Tao task qua `POST /api/tasks`
  - Doi trang thai task qua `PATCH /api/tasks/:id/status`
  - Xoa task qua `DELETE /api/tasks/:id`

### 3.4 Chuc nang giao dien da hoan thanh

- Sign up va login that voi auth service
- Man hinh workspace theo tung project
- CRUD co ban cho project/task: tao, xoa
- Toggle task hoan thanh/chua hoan thanh
- Tab Notifications de xem event thong bao
- Toast thong bao goc phai man hinh cho moi hanh dong

Notification khong can frontend goi truc tiep, vi da duoc trigger noi bo tu `project_and_task_management`.

## 4) Bien moi truong frontend

Frontend dung cac bien public sau:

- `NEXT_PUBLIC_AUTH_SERVICE_URL` (mac dinh: `http://localhost:3001`)
- `NEXT_PUBLIC_TASK_SERVICE_URL` (mac dinh: `http://localhost:3000`)
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` (mac dinh: `http://localhost:3002`)

Trong docker-compose da map san 2 bien nay cho container frontend.

## 5) Docker cho tung service

Da them/cap nhat:

- `auth/Dockerfile`
- `project_and_task_management/Dockerfile`
- `notification/Dockerfile`
- `frontend/Dockerfile`

## 6) Docker Compose toan bo he thong

File: `docker-compose.yml` tai root workspace.

Stack bao gom:

- `postgres-auth` + init schema tu `auth/sql/init.sql`
- `postgres-task` + init schema tu `project_and_task_management/sql/init.sql`
- `auth`
- `notification`
- `project-and-task-management`
- `frontend`

### Bang port service (Docker Compose)

| Service | Container Port | Host Port | URL tu may ban |
|---|---:|---:|---|
| frontend | 3003 | 3003 | http://localhost:3003 |
| auth | 3001 | 3001 | http://localhost:3001 |
| project-and-task-management | 3000 | 3010 | http://localhost:3010 |
| notification | 3002 | 3002 | http://localhost:3002 |
| postgres-auth | 5432 | 5433 | localhost:5433 |
| postgres-task | 5432 | 5432 | localhost:5432 |

Luu y: do host port `3000` thuong bi chiem boi app khac (vi du Next.js dev), service `project-and-task-management` duoc map sang host port `3010` de tranh xung dot.

### Chay he thong

```bash
docker compose up --build
```

### Dung he thong

```bash
docker compose down
```

### Dung he thong va xoa volume DB

```bash
docker compose down -v
```

### Truy cap cac app sau khi chay compose

- Frontend: `http://localhost:3003`
- Auth service: `http://localhost:3001`
- Project/Task service: `http://localhost:3010`
- Notification service: `http://localhost:3002`

## 7) Chay local khong docker (quick start)

### Buoc 1: Chay DB

- Chay PostgreSQL cho auth va task (co the dung compose chi cho DB).

### Buoc 2: Chay backend services

- Auth: `cd auth && npm install && npm run dev`
- Project/task: `cd project_and_task_management && npm install && npm run dev`
- Notification: `cd notification && npm install && npm run dev`

### Buoc 3: Chay frontend

- `cd frontend && npm install && npm run dev`
- Mo `http://localhost:3000` (neu chay dev default cua Next)

## 8) Tao user test de login frontend

Vi frontend hien tai tap trung login (chua co man register), tao user nhanh bang API auth:

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Demo User",
    "email": "demo@example.com",
    "password": "123456"
  }'
```

Sau do login tren trang `/login` va vao `/workspace` de test tao project/task.

## 9) Bien moi truong quan trong

### Auth

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRES`

### Project & Task

- `PORT`
- `DB_HOST`
- `DB_PORT`
- `DB_NAME`
- `DB_USER`
- `DB_PASSWORD`
- `NOTIFICATION_ENABLED` (`true`/`false`)
- `NOTIFICATION_URL` (mac dinh local: `http://localhost:3002/api/notifications`)

### Frontend

- `NEXT_PUBLIC_AUTH_SERVICE_URL` (compose: `http://localhost:3001`)
- `NEXT_PUBLIC_TASK_SERVICE_URL` (compose: `http://localhost:3010`)
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` (compose: `http://localhost:3002`)

### Notification

- `PORT`

## 10) Luu y trien khai AWS ECS

- Docker image cua moi service da tach rieng de push len ECR.
- Compose hien tai dung de local/staging integration.
- Len ECS nen map thanh:
  - 1 service/task definition cho moi microservice
  - 2 RDS instance hoac 2 schema tuy theo chinh sach isolation
  - Internal service discovery de `project_and_task_management` goi `notification`
- Nhat quan bien moi truong `NOTIFICATION_URL` theo DNS noi bo ECS Service Connect/Cloud Map.

