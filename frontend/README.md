# Frontend - PM Microservices

## Da tich hop gi

- Login that voi auth service (`POST /api/auth/login`)
- Lay profile theo token (`GET /api/auth/profile`)
- Lay/Tao project voi project-task service
- Lay/Tao task theo project voi project-task service

## Environment

Frontend su dung:

- `NEXT_PUBLIC_AUTH_SERVICE_URL` (default: `http://localhost:3001`)
- `NEXT_PUBLIC_TASK_SERVICE_URL` (default: `http://localhost:3000`, compose su dung `http://localhost:3010`)

## Run local

```bash
npm install
npm run dev
```

Mo `http://localhost:3000`.

## Pages

- `/` landing page
- `/login` login page
- `/workspace` dashboard thao tac project-task
