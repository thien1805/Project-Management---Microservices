# Frontend - PM Microservices

## Da tich hop gi

- Login that voi auth service (`POST /api/auth/login`)
- Sign up that voi auth service (`POST /api/auth/register`)
- Lay profile theo token (`GET /api/auth/profile`)
- Tao/Xoa project voi project-task service
- Tao/Xoa task theo project voi project-task service
- Toggle trang thai task qua `PATCH /api/tasks/:id/status`
- Tab Notifications doc thong bao tu notification service
- Toast thong bao goc phai man hinh cho moi hanh dong

## Environment

Frontend su dung:

- `NEXT_PUBLIC_AUTH_SERVICE_URL` (default: `http://localhost:3001`)
- `NEXT_PUBLIC_TASK_SERVICE_URL` (default: `http://localhost:3000`, compose su dung `http://localhost:3010`)
- `NEXT_PUBLIC_NOTIFICATION_SERVICE_URL` (default: `http://localhost:3002`)

## Run local

```bash
npm install
npm run dev
```

Mo `http://localhost:3000`.

## Pages

- `/` landing page
- `/login` login page
- `/signup` sign up page
- `/workspace` dashboard thao tac project-task
