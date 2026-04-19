# Hướng Dẫn Thực Hành Từng Bước - PM_Microservices

## 1) Mục tiêu buổi thực hành
Sau khi hoàn thành tài liệu này, bạn sẽ:
- Chạy toàn bộ hệ thống microservice bằng Docker Compose.
- Đăng ký/đăng nhập trên Frontend.
- Tạo Project, tạo Task, cập nhật trạng thái, xóa dữ liệu.
- Quan sát thông báo liên service tại tab Notifications.
- Kiểm chứng hệ thống đang giao tiếp đúng kiến trúc microservice.

---

## 2) Chuẩn bị môi trường

### 2.1 Cài đặt cần có
- Docker Desktop
- Git
- Trình duyệt web (Edge/Chrome)

### 2.2 Mở project
```bash
cd /Users/thienngocpham/Documents/SEM6/SOA/PM_Microservices
```

---

## 3) Khởi động hệ thống

### Bước 1: Build và chạy toàn bộ service
```bash
docker compose up --build -d
```

### Bước 2: Kiểm tra trạng thái container
```bash
docker compose ps
```

Bạn cần thấy các service chính ở trạng thái `Up` hoặc `Healthy`:
- `ms_frontend` (port 3003)
- `ms_auth` (port 3001)
- `ms_project_task` (port 3010)
- `ms_notification` (port 3002)
- `ms_postgres_auth` (healthy)
- `ms_postgres_task` (healthy)

---

## 4) Truy cập ứng dụng
- Frontend: http://localhost:3003
- Auth API: http://localhost:3001
- Project/Task API: http://localhost:3010
- Notification API: http://localhost:3002

Lưu ý: Service Project/Task map từ container port `3000` sang host port `3010` để tránh xung đột cổng.

---

## 5) Kịch bản thực hành chính (UI)

### Bước 1: Đăng ký tài khoản
1. Mở `http://localhost:3003/signup`.
2. Nhập đầy đủ thông tin.
3. Nhấn Sign up.

### Bước 2: Đăng nhập
1. Mở `http://localhost:3003/login`.
2. Đăng nhập bằng tài khoản vừa tạo.
3. Vào màn hình Workspace.

### Bước 3: Tạo Project
1. Ở tab `Projects & Tasks`, nhấn `Add project`.
2. Nhập `Project name`, `Project description`.
3. Nhấn `Save project`.

Kết quả mong đợi:
- Project xuất hiện trong `Project List`.
- Có toast thành công.

### Bước 4: Mở chi tiết Project
1. Nhấn `Open project` tại project vừa tạo.
2. Màn hình chuyển sang `Project Details`.

### Bước 5: Tạo Task
1. Nhấn `Add task` (nếu form đang ẩn).
2. Nhập `Task title` và `Task description`.
3. Nhấn `Add task`.

Kết quả mong đợi:
- Task xuất hiện trong danh sách task của project.
- Có toast thành công.

### Bước 6: Đổi trạng thái Task
1. Nhấn `Mark as done` hoặc `Mark as to do`.
2. Quan sát badge trạng thái đổi tương ứng.

### Bước 7: Xóa Task
1. Nhấn `Delete` tại task.
2. Task biến mất khỏi danh sách.

### Bước 8: Xóa Project
1. Quay về `Project List`.
2. Nhấn biểu tượng xóa ở project.

---

## 6) Kiểm tra Notification (luồng liên service)

### Bước 1: Mở tab `Notifications`
Bạn sẽ thấy các event như:
- `PROJECT_CREATED`
- `TASK_CREATED`
- `TASK_STATUS_CHANGED`
- `TASK_DELETED`
- `PROJECT_DELETED`

### Bước 2: Kiểm tra nội dung message
Thông báo task mới hiện tại đã hiển thị tên project cụ thể (không dùng số ID), ví dụ:
- `Task "Setup API" was created in project "Microservices Demo"`

Điều này chứng minh:
- Project/Task service phát sinh sự kiện.
- Notification service nhận và lưu thông báo.
- Frontend đọc lại thông báo từ Notification API.

---

## 7) Kiểm tra nhanh bằng API (tùy chọn)

### 7.1 Health check Project/Task
```bash
curl -i http://localhost:3010/health
```

### 7.2 Lấy danh sách project
```bash
curl -s http://localhost:3010/api/projects
```

### 7.3 Lấy notifications
```bash
curl -s "http://localhost:3002/api/notifications?source_service=project_and_task_management&limit=20"
```

---

## 8) Xác nhận kiến trúc microservice trong bài thực hành

Trong bài này, kiến trúc microservice thể hiện qua:
- Mỗi domain là 1 service độc lập (Auth, Project/Task, Notification).
- Mỗi service chạy container riêng.
- Service gọi nhau qua HTTP nội bộ.
- Dữ liệu tách theo DB/service (Auth DB và Task DB).

Luồng gọi chính:
- Frontend -> Auth
- Frontend -> Project/Task
- Frontend -> Notification
- Project/Task -> Notification

---

## 9) Lỗi thường gặp và cách xử lý

### Lỗi 1: Không vào được Project/Task API
- Dấu hiệu: frontend báo `Failed to fetch`.
- Kiểm tra: đảm bảo gọi đúng host port `3010`.

### Lỗi 2: Service chưa lên hết
- Chạy lại:
```bash
docker compose up --build -d
```
- Xem log service lỗi:
```bash
docker compose logs -f project-and-task-management
```

### Lỗi 3: Dữ liệu cũ gây trạng thái lệch
- Dừng và xóa volume DB để reset:
```bash
docker compose down -v
docker compose up --build -d
```

---

## 10) Kết thúc buổi thực hành

### Dừng hệ thống
```bash
docker compose down
```

### Dừng và xóa toàn bộ data DB
```bash
docker compose down -v
```

---

## 11) Kết quả đầu ra cần nộp (gợi ý)
- Ảnh `docker compose ps` cho thấy toàn bộ service `Up/Healthy`.
- Ảnh màn hình `Project List` và `Project Details`.
- Ảnh tab `Notifications` có event đầy đủ.
- Mô tả ngắn luồng gọi service theo kiến trúc microservice.

---

## 12) Thực hành triển khai (Deployment Lab)

Phần này giúp bạn triển khai lại toàn bộ hệ thống theo quy trình thực tế, có kiểm thử sau triển khai.

### 12.1 Mục tiêu
- Triển khai lại hệ thống từ đầu bằng Docker Compose.
- Đảm bảo các service chạy đúng cổng và đúng trạng thái.
- Kiểm thử sau triển khai để xác nhận luồng nghiệp vụ hoạt động.

### 12.2 Quy trình triển khai chuẩn

#### Bước 1: Kéo code mới nhất
```bash
git pull
```

#### Bước 2: Build và chạy toàn bộ hệ thống
```bash
docker compose up --build -d
```

#### Bước 3: Kiểm tra trạng thái service
```bash
docker compose ps
```

Kỳ vọng:
- `ms_frontend` -> `Up`
- `ms_auth` -> `Up`
- `ms_project_task` -> `Up`
- `ms_notification` -> `Up`
- `ms_postgres_auth` -> `Healthy`
- `ms_postgres_task` -> `Healthy`

#### Bước 4: Kiểm tra nhanh endpoint sau triển khai
```bash
curl -i http://localhost:3010/health
curl -i http://localhost:3002/health
curl -s http://localhost:3010/api/projects
```

Nếu các endpoint trả về `200`, deployment cơ bản thành công.

### 12.3 Triển khai lại từng service khi chỉ sửa 1 phần

#### Sửa Frontend
```bash
docker compose up --build -d frontend
docker compose ps frontend
```

#### Sửa Project/Task service
```bash
docker compose up --build -d project-and-task-management
docker compose ps project-and-task-management
```

#### Sửa Auth service
```bash
docker compose up --build -d auth
docker compose ps auth
```

#### Sửa Notification service
```bash
docker compose up --build -d notification
docker compose ps notification
```

### 12.4 Kiểm thử sau triển khai (Post-deploy checklist)

1. Mở `http://localhost:3003`.
2. Đăng nhập.
3. Tạo project mới.
4. Vào project, tạo task mới.
5. Đổi trạng thái task.
6. Xóa task.
7. Mở tab `Notifications` kiểm tra event mới.

Checklist đạt khi:
- Không có lỗi `Failed to fetch`.
- Toast hiển thị đúng hành động.
- Notifications có event mới tương ứng thao tác.

### 12.5 Theo dõi log khi triển khai lỗi

```bash
docker compose logs -f frontend
docker compose logs -f project-and-task-management
docker compose logs -f auth
docker compose logs -f notification
```

Xem log DB:
```bash
docker compose logs -f postgres-task
docker compose logs -f postgres-auth
```

### 12.6 Rollback nhanh khi có sự cố

Nếu triển khai mới gây lỗi và cần reset môi trường local:

```bash
docker compose down
docker compose up --build -d
```

Nếu lỗi do dữ liệu cũ/lệch schema:

```bash
docker compose down -v
docker compose up --build -d
```

### 12.7 Tiêu chí hoàn thành phần thực hành triển khai
- Hoàn thành deploy không lỗi với `docker compose up --build -d`.
- Tất cả service ở trạng thái `Up/Healthy`.
- Thực hiện được đầy đủ chuỗi thao tác nghiệp vụ trên UI.
- Quan sát được event thông báo liên service sau thao tác.
