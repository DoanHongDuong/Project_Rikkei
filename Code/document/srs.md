# Software Requirements Specification (SRS)
## Hệ thống quản lý công việc nội bộ

**Đối tượng sử dụng:** Doanh nghiệp / Tổ chức nội bộ

---

# 1. Giới thiệu

## 1.1 Mục đích

Hệ thống được xây dựng nhằm giải quyết các bài toán cốt lõi sau:

- **Tập trung hóa dữ liệu dự án**
  - Thay thế quản lý công việc rời rạc (Zalo, Telegram, Excel)
  - Tạo nền tảng thống nhất lưu trữ, phân công và theo dõi task

- **Minh bạch hóa năng suất lao động**
  - Theo dõi tiến độ theo thời gian thực
  - Phát hiện bottleneck
  - Đánh giá năng lực nhân sự

- **Thúc đẩy cộng tác nội bộ**
  - Bình luận theo task tập trung
  - Thông báo real-time

---

## 1.2 Phạm vi dự án

- Hệ thống web nội bộ doanh nghiệp (không public signup)
- Chu trình nghiệp vụ:
  - Khởi tạo nhân sự → tạo dự án → roadmap → phân công task → thực thi → Kanban → báo cáo

### Vai trò hệ thống

- **Admin**
  - Quản lý tài khoản, bảo mật hệ thống

- **PM (Project Manager)**
  - Quản lý dự án, task, tiến độ, phê duyệt

- **Member**
  - Thực thi task, cập nhật trạng thái, trao đổi

### Hạ tầng

- Intranet hoặc Internet có xác thực

---

## 1.3 Mục tiêu hệ thống

- Tăng tỷ lệ hoàn thành dự án đúng hạn
- UI Kanban mượt, phản hồi < 300ms
- Hệ thống ổn định, mở rộng tốt

---

# 2. System Overview

## 2.1 Kiến trúc hệ thống

Hệ thống theo mô hình **Layered Architecture**:

### 1. Presentation Layer (Frontend - ReactJS)

- Dashboard cho Admin / PM / Member
- REST API + WebSocket (Socket.io)
- Kanban UI, task tracking, charts

---

### 2. Application Layer (Backend - NodeJS / ExpressJS)

Kiến trúc: **Controller - Service - Model**

- Controller: xử lý request/response
- Service: logic nghiệp vụ (assign task, workflow, progress)
- Model: ORM (Sequelize / Prisma / mysql2)

**Bảo mật:**
- JWT Authentication
- RBAC (Role-Based Access Control)
- Middleware bảo vệ API

**Logging (optional):**
- Winston / Morgan

---

### 3. Data Layer

- MySQL (RDBMS)
- File storage cho:
  - attachment
  - avatar
  - document

**Nguyên tắc:**
- Foreign Key
- Constraints
- UNIQUE

---

## 2.2 NodeJS Architecture

### Packages

- `express`: server + routing
- `sequelize / prisma`: ORM
- `jsonwebtoken`: JWT auth
- `joi / express-validator`: validate input
- `socket.io`: realtime communication

---

### Luồng xử lý

Request → Controller → Service → Model → Database → Response

---

# 3. External Factors

## 3.1 Yếu tố con người

- **Admin**
  - Quản lý tài khoản, bảo mật

- **PM**
  - Quản lý dự án, task, tiến độ real-time

- **Member**
  - Thực thi công việc, update trạng thái, trao đổi

---

## 3.2 Yếu tố tổ chức & pháp lý

- Tuân thủ quy trình nội bộ doanh nghiệp
- Bảo mật dữ liệu nhân sự & dự án
- Tránh lộ API / token / dữ liệu nhạy cảm

---

## 3.3 Rủi ro & giải pháp

| Yếu tố | Tác động | Giải pháp |
|------|--------|-----------|
| Hạ tầng mạng | Mất sync real-time | Auto reconnect Socket.io + fallback API |
| Bảo mật | Lộ dữ liệu | JWT + short-lived token |
| Trình duyệt | Chặn WebSocket | fallback polling |
| Con người | quên update task | UI đơn giản 1-click |

---

# 4. Functional Requirements

## 4.1 Chức năng không cần xác thực

- Đăng nhập (Email + Password)
- JWT authentication
- Forgot password (token 15 phút)
- FAQ / hướng dẫn sử dụng
- Hỗ trợ kỹ thuật

---

## 4.2 Admin Features

| Chức năng | Mô tả |
|----------|------|
| Xem danh sách user | Search, filter, pagination |
| Tạo tài khoản | Email unique, role, department |
| Sửa user | Update role, department |
| Khóa/Mở tài khoản | Active / Inactive |

---

## 4.3 Project Manager Features

- Login / Logout
- Quản lý dự án
- Quản lý thành viên dự án
- Tạo roadmap / milestone
- CRUD task
- Giao task
- Theo dõi tiến độ
- Duyệt gia hạn deadline
- Notification real-time

---

## 4.4 Member Features

- Login / Logout
- Xem dự án
- Xem roadmap
- Xem task
- Cập nhật trạng thái task (To Do / In Progress / Done)
- Comment task
- Gửi request gia hạn
- Nhận notification real-time

---

# 5. Database Requirements

- DB Diagram: https://dbdiagram.io/d/6a2bb4645c789b8acb6c10a1
- Các bảng: (theo diagram Excel)

### Use case diagrams
- Admin
- PM
- Member

---

# 6. System Integration

## 6.1 Real-time (Socket.io)

- WebSocket communication
- JWT authentication socket
- Room theo project:
  - `room_project_[id]`
- Ping/Pong 25s
- Auto reconnect

---

## 6.2 Authentication (JWT)

- Payload:
  - userId
  - role
  - expiresIn: 1h

- Middleware kiểm tra token cho mọi request

---

## 6.3 Email System

### Chức năng

- Email reset password (token 15 phút)
- Email notification
- HTML template dynamic

### Retry logic

- Retry tối đa 3 lần nếu lỗi

### Công nghệ

- nodemailer
- SMTP / SendGrid / AWS SES

### Bảo mật

- Lưu config trong `.env`
- Không hard-code secrets
