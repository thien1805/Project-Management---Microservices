# Hướng Dẫn Tổng Quan & Trạng Thái Dự Án PM_Microservices

## 1) Dự án hiện có đang theo kiến trúc microservice không?
Có. Dự án đã tách thành nhiều service độc lập, mỗi service có Dockerfile riêng, chạy container riêng và giao tiếp qua HTTP.

### Các service chính
- Auth Service
- Project & Task Management Service
- Notification Service
- Frontend Service
- 2 PostgreSQL service riêng cho Auth và Task

### Bằng chứng giao tiếp giữa các service
- Frontend gọi Auth Service qua API đăng nhập/đăng ký/profile.
- Frontend gọi Project & Task Service để CRUD project/task.
- Frontend gọi Notification Service để đọc danh sách thông báo.
- Project & Task Service gọi Notification Service nội bộ để phát sinh event thông báo (PROJECT_CREATED, TASK_CREATED, TASK_STATUS_CHANGED, TASK_DELETED, PROJECT_DELETED...).

### Kết luận kiến trúc
- Đây là microservice ở mức thực thi cơ bản và đúng hướng: tách service, tách DB theo domain, giao tiếp qua HTTP.
- Hiện tại chưa dùng message broker (RabbitMQ/Kafka), nên luồng liên service đang là sync HTTP (đã có cơ chế fail-safe: notification lỗi không làm hỏng API nghiệp vụ chính).

## 2) Luồng gọi service hiện tại

### 2.1 Luồng người dùng
1. Người dùng thao tác trên Frontend (http://localhost:3003).
2. Frontend gọi Auth / Project-Task / Notification theo chức năng.
3. Project-Task xử lý nghiệp vụ và ghi DB task.
4. Project-Task gửi event sang Notification Service.
5. Frontend tab Notifications đọc lại thông báo mới.

### 2.2 Ma trận gọi service
- Frontend -> Auth: Có
- Frontend -> Project-Task: Có
- Frontend -> Notification: Có
- Project-Task -> Notification: Có
- Auth -> Project-Task: Chưa
- Auth -> Notification: Chưa

## 3) Những gì dự án đã làm được

### 3.1 Backend
- Auth:
  - Đăng ký tài khoản
  - Đăng nhập
  - Lấy profile theo JWT
- Project & Task:
  - Tạo/xem/xóa project
  - Tạo/xem/xóa task
  - Đổi trạng thái task
  - Trả lỗi chuẩn và ghi activity log task
- Notification:
  - Nhận event notification từ service khác
  - Lưu thông báo in-memory
  - Lọc thông báo theo recipient_id, source_service, event_type, limit

### 3.2 Frontend
- Đăng ký
- Đăng nhập
- Logout
- Màn hình Workspace
- Điều hướng rõ 2 lớp:
  - Danh sách project (ngoài)
  - Chi tiết project (trong) để quản lý task
- Toast thông báo góc phải cho các hành động
- Tab Notifications hiển thị sự kiện hệ thống
- Đã đổi UI sang tiếng Anh

### 3.3 Docker hóa & vận hành
- Mỗi service có Dockerfile riêng
- Có docker-compose chạy toàn bộ stack
- Đã xử lý xung đột cổng (Project-Task map host 3010)
- Các container chính đang chạy ổn định theo compose

## 4) Cổng dịch vụ (Docker Compose)
- Frontend: http://localhost:3003
- Auth: http://localhost:3001
- Project-Task: http://localhost:3010
- Notification: http://localhost:3002
- Postgres Auth: localhost:5433
- Postgres Task: localhost:5432

## 5) Các điểm đã fix gần đây
- Fix lỗi gọi nhầm port 3000 từ frontend khi chạy compose (đã chuyển logic phù hợp host 3010).
- Fix lỗi thao tác task khi dữ liệu stale (Task not found) phía frontend: tự refresh danh sách task.
- Fix lỗi xóa task gây 500 ở backend: ghi activity log trước khi delete.
- Cập nhật nội dung notification task để hiển thị tên project cụ thể thay vì ID số.

## 6) Cách chạy nhanh dự án
```bash
docker compose up --build -d
```

Kiểm tra trạng thái:
```bash
docker compose ps
```

Dừng:
```bash
docker compose down
```

## 7) Kiểm thử nhanh end-to-end
1. Mở Frontend tại http://localhost:3003.
2. Đăng ký hoặc đăng nhập.
3. Tạo project mới.
4. Vào project, tạo task.
5. Đổi trạng thái task / xóa task.
6. Chuyển sang tab Notifications để kiểm tra event vừa phát sinh.

## 8) Hạn chế hiện tại & hướng nâng cấp
- Notification đang lưu in-memory (mất dữ liệu khi restart) -> nên chuyển sang DB.
- Liên service đang sync HTTP -> có thể nâng cấp event-driven với broker.
- Chưa có API Gateway tập trung.
- Chưa có observability đầy đủ (tracing, metrics, correlation-id).
- Chưa có test tự động đầy đủ cho integration/e2e.

---
Tệp này là bản tổng hợp trạng thái thực tế để theo dõi tiến độ và demo hệ thống.