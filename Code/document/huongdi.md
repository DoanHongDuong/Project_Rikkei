# Hướng đi tiếp theo cho project

## 1. Trạng thái hiện tại

Project đang đi theo hướng xây dựng hệ thống quản lý công việc nội bộ cho doanh nghiệp, gồm 3 vai trò chính: Admin, PM và Member.

Phần nền tảng đã có định hướng khá rõ:

- SRS đã xác định hệ thống nội bộ, không public signup.
- Backlog đã chia theo các epic lớn: Authentication, User Management, Project, Task, Realtime, Notification, Email, Dashboard, Security và File Storage.
- Backend đã có khung ExpressJS, JWT auth, RBAC cơ bản, Admin API tạo user.
- Frontend đã có React/Vite, login, forgot/reset password, protected route và dashboard ban đầu.
- Database schema là phần tương đối chắc, đã có users, departments, projects, tasks, comments, notifications, task history, extension requests.

Tuy nhiên project vẫn đang ở giai đoạn khung xương. Việc tiếp theo nên tập trung hoàn thiện nền móng trước khi làm các màn hình lớn như Kanban, dashboard analytics hoặc realtime.

---

## 2. Nguyên tắc làm việc tiếp theo

Ưu tiên theo thứ tự:

1. Làm chắc authentication, authorization và user management.
2. Hoàn thiện model/association backend theo schema database.
3. Làm Project Management trước Task Management.
4. Làm Task/Kanban sau khi Project API ổn định.
5. Chỉ thêm realtime/notification sau khi CRUD task chạy đúng.
6. Mỗi feature phải có API test và kiểm tra quyền theo role.

Không nên làm UI quá nhiều khi API và rule nghiệp vụ chưa ổn, vì sẽ phải sửa lại nhiều.

---

## 3. Giai đoạn 1: Hoàn thiện Authentication & Admin User Management

### Backend cần làm

- Kiểm tra lại toàn bộ route public:
  - Chỉ cho phép public: login, forgot password, reset password.
  - Không có public register.
- Chuẩn hóa response lỗi:
  - `400`: thiếu hoặc sai dữ liệu đầu vào.
  - `401`: chưa đăng nhập/token thiếu.
  - `403`: không đủ quyền.
  - `404`: không tìm thấy dữ liệu.
  - `500`: lỗi server.
- Bổ sung validate input cho:
  - Login.
  - Forgot/reset password.
  - Admin tạo user.
  - Admin update user.
- Hoàn thiện Admin User API:
  - `GET /api/admin/users?search=&page=&limit=&department_id=&role=&status=`
  - `POST /api/admin/users`
  - `PUT /api/admin/users/:id`
  - `PATCH /api/admin/users/:id/status`
- Khi Admin tạo user:
  - Email phải unique.
  - Password bắt buộc.
  - Password phải được hash.
  - Role chỉ được là `ADMIN`, `PM`, `MEMBER` theo rule nội bộ.

### Frontend cần làm

- Làm màn hình Admin quản lý user:
  - Danh sách user.
  - Search/filter.
  - Tạo user.
  - Sửa thông tin user.
  - Khóa/mở tài khoản.
- Tách type dùng chung:
  - `AuthUser`
  - `UserRole`
  - `UserStatus`
  - `Department`
- Tạo service riêng cho Admin User:
  - `admin-user-service.ts`

### Tiêu chí hoàn thành

- Admin đăng nhập được.
- Admin tạo được PM/Member.
- User bị khóa không đăng nhập được.
- Member/PM không gọi được API Admin.
- Frontend build pass.
- Lint không còn error.

---

## 4. Giai đoạn 2: Chuẩn hóa Database Model & Association

### Backend cần làm

Hoàn thiện Sequelize model cho các bảng chính:

- `Department`
- `User`
- `Project`
- `ProjectMember`
- `Task`
- `Comment`
- `Notification`
- `ExtensionRequest`
- `TaskHistory`

Thiết lập association rõ ràng:

- Department có nhiều User.
- User thuộc Department.
- Project có PM quản lý.
- Project có nhiều ProjectMember.
- Project có nhiều Task.
- Task thuộc Project.
- Task có assignee.
- Task có creator/updater.
- Task có nhiều Comment.
- Task có nhiều TaskHistory.
- Task có nhiều ExtensionRequest.
- User có nhiều Notification.

Nên tạo file gom model, ví dụ:

```txt
Backend/src/models/index.js
```

File này import toàn bộ model và khai báo association tập trung để tránh mỗi model tự require vòng nhau quá nhiều.

### Tiêu chí hoàn thành

- Server start không lỗi association.
- Query user kèm department được.
- Query project kèm manager/member được.
- Query task kèm assignee/project được.

---

## 5. Giai đoạn 3: Project Management

Đây là feature lớn tiếp theo sau User Management.

### Backend API đề xuất

```http
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id
PUT    /api/projects/:id
DELETE /api/projects/:id

GET    /api/projects/:id/members
POST   /api/projects/:id/members
DELETE /api/projects/:id/members/:userId
```

### Rule phân quyền

- Admin xem được tất cả project.
- PM tạo project.
- PM chỉ sửa project mình quản lý.
- Member chỉ xem project mình tham gia.
- Member không được tạo/sửa/xóa project.

### Frontend cần làm

- Trang danh sách project.
- Trang tạo/sửa project.
- Trang chi tiết project.
- UI quản lý member trong project.

### Tiêu chí hoàn thành

- PM tạo được project.
- PM thêm/xóa member khỏi project.
- Member nhìn thấy project được gán.
- Member không thấy project không liên quan.

---

## 6. Giai đoạn 4: Task Management & Kanban

Sau khi project ổn thì mới làm task.

### Backend API đề xuất

```http
GET    /api/projects/:projectId/tasks
POST   /api/projects/:projectId/tasks
GET    /api/tasks/:id
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
PATCH  /api/tasks/:id/assignee
DELETE /api/tasks/:id
```

### Workflow task nên dùng

Nên đồng bộ theo DB schema:

```txt
TODO -> IN_PROGRESS -> REVIEW -> DONE
```

Các trạng thái phụ:

```txt
BLOCKED
CANCELED
```

### Rule phân quyền

- PM tạo/sửa/xóa task trong project mình quản lý.
- PM assign task cho member thuộc project.
- Member chỉ update trạng thái task được giao.
- Member không được assign task cho người khác.
- Khi đổi trạng thái task phải ghi `task_history`.

### Frontend cần làm

- Trang danh sách task.
- Trang chi tiết task.
- Kanban board theo status.
- Form tạo/sửa task.
- Drag/drop đổi status nếu có thời gian.

### Tiêu chí hoàn thành

- PM tạo task và assign member.
- Member xem task được giao.
- Member cập nhật status.
- Lịch sử thay đổi task được ghi lại.
- Kanban hiển thị đúng theo project.

---

## 7. Giai đoạn 5: Comment, Extension Request & Notification

### Comment

API đề xuất:

```http
GET  /api/tasks/:taskId/comments
POST /api/tasks/:taskId/comments
PUT  /api/comments/:id
DELETE /api/comments/:id
```

Rule:

- User thuộc project mới được comment.
- Người tạo comment hoặc PM được xóa comment.
- Xóa comment nên là soft delete.

### Request gia hạn deadline

API đề xuất:

```http
POST  /api/tasks/:taskId/extension-requests
GET   /api/projects/:projectId/extension-requests
PATCH /api/extension-requests/:id/approve
PATCH /api/extension-requests/:id/reject
```

Rule:

- Member gửi request cho task của mình.
- PM duyệt/reject request thuộc project mình quản lý.
- Nếu approve thì cập nhật deadline task.

### Notification

Các sự kiện nên tạo notification:

- User được assign task.
- Task đổi deadline.
- Task đổi status.
- Có comment mới trong task.
- Request gia hạn được approve/reject.

---

## 8. Giai đoạn 6: Realtime với Socket.io

Chỉ nên làm realtime sau khi các API task/comment/notification đã chạy ổn.

### Luồng đề xuất

- Client connect socket kèm JWT.
- Backend verify JWT cho socket.
- User join room theo project:

```txt
room_project_[projectId]
```

### Event nên có

```txt
task_created
task_updated
task_status_changed
comment_created
notification_created
extension_request_updated
```

### Tiêu chí hoàn thành

- Khi PM tạo task, member trong project nhận update không cần reload.
- Khi member đổi status, PM thấy thay đổi realtime.
- Socket reconnect không làm mất dữ liệu vì vẫn có API fallback.

---

## 9. Giai đoạn 7: Dashboard & Analytics

Dashboard nên làm sau khi đã có project/task thật.

### Chỉ số cần hiển thị

Cho Admin:

- Tổng số user.
- Tổng số project.
- Project đang active/completed.
- User theo role/phòng ban.

Cho PM:

- Project đang quản lý.
- Tổng task theo status.
- Task trễ deadline.
- Tiến độ project.

Cho Member:

- Task được giao.
- Task sắp đến hạn.
- Task bị quá hạn.
- Hoạt động gần đây.

### Công thức progress đơn giản

```txt
project_progress = done_tasks / total_tasks * 100
```

Nên bỏ qua task `CANCELED` khi tính progress.

---

## 10. Giai đoạn 8: File Upload & Storage

Chỉ nên làm sau khi task/comment đã ổn.

### Backend cần làm

- Dùng `multer` hoặc storage service.
- Giới hạn dung lượng file.
- Kiểm tra MIME type.
- Lưu metadata vào `task_attachments`.
- Không expose trực tiếp path nội bộ nếu dùng local storage.

### Rule đề xuất

- User thuộc project mới được upload/view file.
- File gắn với task hoặc comment.
- PM có thể xóa file không phù hợp.

---

## 11. Giai đoạn 9: Testing, Logging & Hardening

### Testing

Nên bổ sung:

- Unit test cho service quan trọng.
- Integration test cho auth/admin/project/task.
- API test bằng file `.http` hoặc Postman collection.

Các case bắt buộc:

- User inactive không login được.
- Member không gọi được Admin API.
- PM không sửa project của PM khác.
- Member không xem task ngoài project.
- Reset password token hết hạn sau 15 phút.

### Logging

Nên thêm:

- Request log bằng `morgan`.
- Error log bằng `winston` nếu có thời gian.
- Không log password/token.

### Security hardening

- Validate input bằng `joi` hoặc `express-validator`.
- Thêm rate limit cho login/forgot password.
- Cấu hình CORS theo `.env`.
- Không hard-code URL frontend/backend.
- Không commit `.env`.
- Chuẩn hóa error response.

---

## 12. Thứ tự sprint đề xuất

### Sprint 1: Admin User Management hoàn chỉnh

- Pagination/filter user.
- Create/update/lock user.
- Validate input.
- Admin UI user management.

### Sprint 2: Project Management

- Project CRUD.
- Project member management.
- Role check theo project.
- Project list/detail UI.

### Sprint 3: Task Management

- Task CRUD.
- Assign task.
- Update status.
- Task history.
- Task list/detail UI.

### Sprint 4: Kanban & Comment

- Kanban board.
- Comment task.
- Soft delete comment.
- UI task detail hoàn chỉnh.

### Sprint 5: Extension Request & Notification

- Request gia hạn deadline.
- PM approve/reject.
- Notification lưu DB.
- Notification UI cơ bản.

### Sprint 6: Socket.io Realtime

- Socket auth.
- Room theo project.
- Realtime task/comment/notification.

### Sprint 7: Dashboard, Upload, Testing

- Dashboard theo role.
- Upload attachment.
- Integration tests.
- Logging/security hardening.

---

## 13. Việc nên tránh ở giai đoạn này

- Không làm realtime quá sớm khi task API chưa ổn.
- Không làm dashboard analytics khi chưa có dữ liệu thật.
- Không để frontend tự quyết quyền; quyền phải check ở backend.
- Không truyền thẳng `req.body` vào model update.
- Không dùng public signup cho hệ thống nội bộ.
- Không hard-code token, password, secret trong source code.
- Không để API trả về `password_hash`.

---

## 14. Kết luận

Hướng đi tốt nhất là hoàn thiện chắc phần nền: Auth, RBAC, Admin User, Model Association. Sau đó đi theo luồng nghiệp vụ tự nhiên:

```txt
User -> Project -> Project Member -> Task -> Kanban -> Comment -> Notification -> Realtime -> Dashboard
```

Nếu đi đúng thứ tự này, project sẽ ít bị vỡ kiến trúc, frontend/backend đồng bộ hơn và dễ chia việc cho team hơn.
