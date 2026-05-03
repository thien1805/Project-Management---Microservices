# Notification Service - Debug & Fix Guide

## Vấn Đề Hiện Tại
Notification chưa hiển thị vì:
1. **ECS Task URL sai**: `PROJECT_NOTIFICATION_URL` dùng ALB public domain → không kết nối được từ bên trong container
2. **Thiếu logging**: Không biết khi nào notification được gửi hay fail

## Fix Applied

### ✅ Fix 1: Auto-Create Schema on Startup
**Files thay đổi**:
- `notification/src/config/initDb.js` - file mới, tự động tạo schema/table khi startup
- `notification/src/server.js` - thêm gọi `initializeNotificationSchema()`

**Kết quả**: Notification service sẽ tự tạo bảng trên RDS khi khởi động (không phải chạy `init.sql` thủ công trên ECS)

### ✅ Fix 2: Add Detailed Logging  
**Files thay đổi**:
- `project_and_task_management/src/integrations/notificationClient.js` - log URL, payload, response
- `project_and_task_management/src/modules/project/service.js` - log khi PROJECT_CREATED/DELETED
- `project_and_task_management/src/modules/task/service.js` - log khi TASK_CREATED/UPDATED/STATUS_CHANGED/DELETED

**Kết quả**: CloudWatch logs sẽ hiện chi tiết khi gửi notification (thành công hay lỗi)

## 🔴 Vấn Đề Chính Còn Cần Sửa

### URL Sai trên ECS

Hiện tại trong pm-project-task task definition:
```
PROJECT_NOTIFICATION_URL=pm-alb-2101387866.us-east-1.elb.amazonaws.com/api/notifications/
```

**Tại sao sai?**
- Container bên trong ECS gửi request đến ALB public domain → đi ra internet rồi vào lại
- Dễ timeout, bị routing fail, không được resolve đúng
- Nên dùng **internal DNS** hoặc **private IP** thay vì public ALB

**Cách Sửa** - Chọn 1 trong 2 cách:

#### Cách 1: Dùng Private IP của notification task (Nhanh nhất)
1. Vào AWS ECS console → Cluster → pm-notification-task
2. Lấy "Private IP" của notification task (ví dụ: `10.0.1.50`)
3. Vào pm-project-task task definition → "Environment variables"
4. Sửa `PROJECT_NOTIFICATION_URL` thành:
   ```
   http://10.0.1.50:3002/api/notifications
   ```
5. Tạo revision mới và update ECS service

#### Cách 2: Setup Service Discovery (Recommended)
1. Đăng ký notification service vào AWS Cloud Map / Route 53
2. Dùng DNS name như: `http://notification-service.local:3002/api/notifications`
3. Cập nhật `PROJECT_NOTIFICATION_URL` trong task definition

## Bước Deploy Mới

```bash
# 1. Commit code changes có logging (đã push rồi)
git add -A
git commit -m "Add notification debugging logs and auto-schema init"
git push

# 2. Build image mới
docker buildx build --platform linux/amd64 -t pm-project-task ./project_and_task_management --load
docker tag pm-project-task:latest <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/pm-project-task:latest
docker push <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/pm-project-task:latest

# 3. Build notification image mới
docker buildx build --platform linux/amd64 -t pm-notification ./notification --load
docker tag pm-notification:latest <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/pm-notification:latest
docker push <ACCOUNT>.dkr.ecr.<REGION>.amazonaws.com/pm-notification:latest

# 4. Trong AWS Console:
#    - Update pm-notification-task task definition → "Register new revision"
#    - Update pm-project-task task definition → Fix PROJECT_NOTIFICATION_URL
#    - Update ECS service để dùng revision mới
```

## Kiểm Tra Sau Deploy

### CloudWatch Logs
```bash
# Xem logs notification service (kiếm "Notification schema is ready")
aws logs tail /aws/ecs/pm-notification --follow

# Xem logs project service (kiếm "[Notification Client]" hoặc "[ProjectService]")
aws logs tail /aws/ecs/pm-project-task --follow
```

### Tạo Project Test
1. Mở frontend (http://your-alb-domain)
2. Tạo 1 project mới
3. Kiểm tra CloudWatch logs:
   - Nên thấy `[ProjectService] Triggering PROJECT_CREATED notification`
   - Nên thấy `[Notification Client] Sending notification...`
   - Nên thấy `[Notification Client] Notification sent successfully`
4. Mở browser DevTools → Network → xem request đến notification endpoint
5. Mở tab Notifications ở web → nên thấy thông báo "Project created"

### Truy vấn DB
```bash
# SSH vào RDS hoặc dùng psql từ local
psql -h <RDS-ENDPOINT> -U postgres -d notification_db -c "SELECT count(*) FROM notification.notifications;"
```

## Troubleshooting

| Triệu chứng | Nguyên nhân | Cách Fix |
|---|---|---|
| CloudWatch không thấy `[Notification Client]` | PROJECT_NOTIFICATION_ENABLED = false | Check env variable |
| Thấy `Cannot send notification: connection timeout` | URL sai hoặc network unreachable | Dùng private IP hoặc cập nhật URL |
| Thấy `Notification service rejected: 404` | Route `/api/notifications` sai | Check notification service app.js routes |
| Thấy `DB error: relation "notification.notifications" does not exist` | Schema chưa được tạo | Schema auto-create khi startup - kiểm tra logs startup |

---
**Created**: May 3, 2026
**Status**: Code changes merged, URL config still needs update in ECS task definition
