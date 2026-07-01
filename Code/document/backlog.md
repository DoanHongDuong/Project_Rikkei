# Product Backlog - Hệ thống quản lý công việc nội bộ

---

# EPIC 1: Authentication & Access Control

## US-001 Login hệ thống
**As a** user  
**I want** đăng nhập bằng email và mật khẩu  
**So that** tôi có thể truy cập hệ thống theo vai trò

### Acceptance Criteria
- Đăng nhập bằng email + password
- Trả về JWT token
- Redirect theo role (Admin / PM / Member)
- Sai thông tin → báo lỗi

---

## US-002 Phân quyền RBAC
**As a** system  
**I want** phân quyền theo role  
**So that** mỗi người chỉ thấy chức năng phù hợp

### Acceptance Criteria
- Admin / PM / Member role
- Middleware kiểm tra JWT
- Chặn API không hợp lệ

---

## US-003 Forgot Password
**As a** user  
**I want** reset mật khẩu khi quên  
**So that** tôi có thể lấy lại tài khoản

### Acceptance Criteria
- Nhập email
- Gửi email reset token (15 phút)
- Link reset hợp lệ trong thời gian giới hạn

---

# EPIC 2: User Management (Admin)

## US-004 Xem danh sách user
**As an Admin**  
**I want** xem toàn bộ nhân sự  
**So that** tôi quản lý tổ chức

### Acceptance Criteria
- Search theo email/tên
- Filter theo phòng ban
- Pagination

---

## US-005 Tạo tài khoản user
**As an Admin**  
**I want** tạo tài khoản nhân sự  
**So that** thêm người vào hệ thống

### Acceptance Criteria
- Email unique
- Role: PM hoặc Member
- Gán phòng ban

---

## US-006 Cập nhật user
**As an Admin**  
**I want** chỉnh sửa thông tin user  
**So that** cập nhật tổ chức

---

## US-007 Khóa / mở tài khoản
**As an Admin**  
**I want** disable user  
**So that** kiểm soát truy cập

### Acceptance Criteria
- Active / Inactive
- User inactive không login được

---

# EPIC 3: Project Management

## US-008 Tạo dự án
**As a PM**  
**I want** tạo project  
**So that** quản lý công việc

---

## US-009 Xem danh sách project
**As a PM**  
**I want** xem project của tôi  
**So that** theo dõi tiến độ

---

## US-010 Quản lý thành viên project
**As a PM**  
**I want** thêm/xóa member  
**So that** phân bổ nhân sự

---

## US-011 Tạo roadmap / milestone
**As a PM**  
**I want** chia dự án theo giai đoạn  
**So that** dễ theo dõi tiến độ

---

# EPIC 4: Task Management

## US-012 Tạo task
**As a PM**  
**I want** tạo task  
**So that** phân công công việc

---

## US-013 Giao task cho member
**As a PM**  
**I want** assign task  
**So that** phân công nhân sự

---

## US-014 Cập nhật task
**As a Member**  
**I want** update trạng thái task  
**So that** báo tiến độ

### Acceptance Criteria
- To Do → In Progress → Done

---

## US-015 Xem danh sách task
**As a Member**  
**I want** xem task được giao  
**So that** biết việc cần làm

---

## US-016 Xem chi tiết task
**As a Member**  
**I want** xem thông tin task  
**So that** hiểu yêu cầu

---

## US-017 Comment task
**As a Member**  
**I want** trao đổi trong task  
**So that** phối hợp công việc

---

## US-018 Request gia hạn deadline
**As a Member**  
**I want** xin gia hạn  
**So that** xử lý công việc kịp thời

---

## US-019 Duyệt gia hạn deadline
**As a PM**  
**I want** approve/reject request  
**So that** kiểm soát tiến độ

---

# EPIC 5: Real-time System (Socket.io)

## US-020 Realtime update task
**As a user**  
**I want** cập nhật real-time  
**So that** không cần reload

### Acceptance Criteria
- Socket.io connection
- Update task instantly

---

## US-021 Room theo project
**As a system**  
**I want** group socket theo project  
**So that** tối ưu dữ liệu realtime

---

## US-022 Auto reconnect socket
**As a system**  
**I want** reconnect khi mất mạng  
**So that** không mất sync

---

# EPIC 6: Notification System

## US-023 Notification khi assign task
**As a member**  
**I want** nhận thông báo task mới  
**So that** không bỏ sót công việc

---

## US-024 Notification khi đổi deadline
**As a member**  
**I want** biết deadline thay đổi  
**So that** cập nhật kịp thời

---

## US-025 Notification khi đổi trạng thái
**As a PM**  
**I want** biết tiến độ task  
**So that** theo dõi dự án

---

# EPIC 7: Email System

## US-026 Gửi email reset password
**As a system**  
**I want** gửi email reset  
**So that** user khôi phục tài khoản

---

## US-027 Email template HTML
**As a system**  
**I want** email định dạng đẹp  
**So that** dễ đọc và chuyên nghiệp

---

## US-028 Retry gửi email
**As a system**  
**I want** retry khi lỗi  
**So that** đảm bảo delivery

---

# EPIC 8: Dashboard & Analytics

## US-029 Dashboard PM
**As a PM**  
**I want** xem dashboard  
**So that** theo dõi tiến độ

---

## US-030 Progress tracking
**As a PM**  
**I want** xem % tiến độ project  
**So that** đánh giá hiệu quả

---

## US-031 Task overview
**As a user**  
**I want** xem tổng quan task  
**So that** hiểu workload

---

# EPIC 9: System Performance & Security

## US-032 API response < 300ms
**As a system**  
**I want** tối ưu hiệu năng  
**So that** UX mượt

---

## US-033 JWT security
**As a system**  
**I want** bảo mật API  
**So that** tránh truy cập trái phép

---

## US-034 Logging system
**As a system**  
**I want** log hoạt động  
**So that** debug dễ hơn

---

# EPIC 10: File & Storage

## US-035 Upload file task
**As a member**  
**I want** upload file  
**So that** chia sẻ tài liệu

---

## US-036 View attachment
**As a user**  
**I want** xem file đính kèm  
**So that** hiểu nội dung task