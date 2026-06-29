# Product Backlog

### Nhóm 1: Hệ thống chung & Xác thực (Core & Auth)

* \[ \] Epic-01: Đăng nhập hệ thống bằng Email/Mật khẩu (Xác thực JWT).  
* \[ \] Epic-02: Đăng xuất hệ thống (Xóa token ở client).  
* \[ \] Epic-03: Alert Real-time (Thông báo tức thời bằng Socket.io khi có task mới, đổi deadline, hoặc có bình luận mới).  
* \[ \] Epic-04: Khôi phục mật khẩu qua Email (Gửi link kèm Token hết hạn 15 phút) 

### Nhóm 2: Backlog dành cho ADMIN (Quản lý nhân sự)

* \[ \] Admin-01: Xem danh sách toàn bộ User hiện có trong hệ thống dạng bảng.  
* \[ \] Admin-02: Tạo tài khoản mới cho PM và Member (Điền Name, Email, Password, Role).  
* \[ \] Admin-03: Chỉnh sửa thông tin cơ bản của User (Đổi tên, đổi role).  
* \[ \] Admin-04: Vô hiệu hóa (Disable/Block) tài khoản không còn hoạt động (Chuyển trạng thái từ Active sang Inactive).  
* \[\]Admin-05: Xem toàn bộ chi tiết các dự án hiện có

### Nhóm 3: Backlog dành cho PM (Quản lý & Giám sát)

* \[ \] PM-01: Xem danh sách các Dự án do mình quản lý.  
* \[ \] PM-02: Tạo Dự án mới (Tên dự án, Mô tả).  
* \[ \] PM-03: Thêm/Xóa thành viên (Member) vào Dự án.  
* \[ \] PM-04: Tạo Task mới trong dự án (Tiêu đề, Mô tả, Assignee, Priority, Deadline).  
* \[ \] PM-05: Chỉnh sửa hoặc Xóa Task.  
* \[ \] PM-06: Tạo Roadmap dạng danh sách các mốc thời gian (Milestones).  
* \[ \] PM-07: Monitor tiến độ qua Dashboard (Biểu đồ tròn/cột thống kê trạng thái task).  
* \[ \] PM-08: Phê duyệt/Từ chối yêu cầu gia hạn Deadline của Member.(optional nếu kịp thì làm sau)

### Nhóm 4: Backlog dành cho MEMBER (Thực hiện công việc)

* \[ \] Mem-01: Xem danh sách các Dự án được tham gia.  
* \[ \] Mem-02: Xem bảng công việc (Kanban Board) chung của dự án.  
* \[ \] Mem-03: Xem Roadmap (Các mốc thời gian lớn) của dự án.  
* \[ \] Mem-04: Cập nhật trạng thái Task do mình phụ trách   
* \[ \] Mem-05: Viết bình luận (Comment text) trao đổi trong từng Task.  
* \[ \] Mem-06: Gửi yêu cầu xin gia hạn Deadline (Chọn ngày mới \+ Nhập lý do).(optional)  
* \[ \] Mem-07: Giao diện "Task của tôi" (Xem nhanh tất cả công việc được giao cho bản thân).


# **User Story**

| ID | User Story | Priority | Story Point |
| ----- | ----- | :---: | :---: |
| US-01 | Là người dùng, tôi muốn đăng nhập hệ thống để sử dụng các chức năng theo quyền của mình | High | 5 |
| US-02 | Là người dùng, tôi muốn đăng xuất hệ thống để kết thúc phiên làm việc an toàn | High | 2 |
| US-03 | Là Admin, tôi muốn xem và tìm kiếm người dùng để quản lý tài khoản | High | 5 |
| US-04 | Là Admin, tôi muốn thêm, cập nhật, xóa tài khoản người dùng | High | 8 |
| US-05 | Là Admin, tôi muốn phân quyền và vô hiệu hóa tài khoản | Medium | 5 |
| US-06 | Là PM, tôi muốn xem danh sách dự án | High | 3 |
| US-07 | Là PM, tôi muốn thêm, cập nhật, xóa dự án | High | 8 |
| US-08 | Là PM, tôi muốn thêm và xóa thành viên dự án | High | 8 |
| US-09 | Là PM, tôi muốn tạo roadmap cho dự án | Medium | 5 |
| US-10 | Là PM, tôi muốn thêm, cập nhật, xóa task | High | 8 |
| US-11 | Là PM, tôi muốn monitor tiến độ dự án | High | 8 |
| US-12 | Là PM, tôi muốn xử lý yêu cầu gia hạn deadline | Medium | 5 |
| US-13 | Là Member, tôi muốn xem thông tin dự án | High | 3 |
| US-14 | Là Member, tôi muốn xem roadmap dự án | Medium | 3 |
| US-15 | Là Member, tôi muốn xem danh sách task | High | 5 |
| US-16 | Là Member, tôi muốn cập nhật trạng thái task | High | 5 |
| US-17 | Là Member, tôi muốn bình luận trên task | Medium | 5 |
| US-18 | Là Member, tôi muốn gửi yêu cầu gia hạn deadline | Medium | 5 |
| US-19 | Là người dùng, tôi muốn nhận thông báo realtime | Medium | 8 |
| US-20 | Là người dùng, tôi muốn khôi phục mật khẩu thông qua email để có thể lấy lại quyền truy cập khi quên mật khẩu.  | High | 8 |
| US-21 | Là PM hoặc Member, tôi muốn xem các Task dưới dạng bảng Kanban để dễ dàng theo dõi trạng thái công việc của dự án.  | High | 5 |
| US-22 | Là Member, tôi muốn kéo thả Task giữa các cột Todo, In Progress và Done để cập nhật trạng thái công việc nhanh chóng.  | High | 8 |
| US-23 | Là PM hoặc Member, tôi muốn xem nhanh thông tin Task trên thẻ Kanban để nắm được nội dung công việc mà không cần mở trang chi tiết.  | Medium | 3 |

Tổng: 128 Story Point

# **EPIC 1: XÁC THỰC HỆ THỐNG**

## **User Story US-01: Đăng nhập**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng User | 1 |
| Thiết kế giao diện Login | 1 |
| Xây dựng API Login | 1 |
| Xác thực JWT/Session | 1 |
| Kiểm thử chức năng Login | 1 |

## **User Story US-02: Đăng xuất**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Xây dựng API Logout | 1 |
| Xóa Session/JWT | 1 |

## **User Story US-20: Khôi phục mật khẩu qua Email** 

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng PasswordResetToken | 1 |
| Thiết kế giao diện Quên mật khẩu | 1 |
| API gửi yêu cầu khôi phục mật khẩu | 1 |
| Sinh Token ngẫu nhiên | 1 |
| Thiết lập thời gian hết hạn Token (15 phút) | 1 |
| Tích hợp gửi Email SMTP | 1 |
| API xác thực Token | 1 |
| API đặt lại mật khẩu mới | 1 |

# **EPIC 2: QUẢN LÝ NGƯỜI DÙNG (ADMIN)**

## **User Story US-03: Xem và tìm kiếm người dùng**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API lấy danh sách User | 2 |
| Thiết kế giao diện danh sách User | 1 |
| Chức năng tìm kiếm User | 1 |
| Kiểm thử | 1 |

## **User Story US-04: Thêm, cập nhật, xóa tài khoản**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế Form User | 1 |
| API Create User | 2 |
| API Update User | 1 |
| API Delete User | 1 |
| Validate dữ liệu | 1 |
| Hiển thị danh sách User | 1 |
| Kiểm thử CRUD | 1 |

## **User Story US-05: Phân quyền và vô hiệu hóa tài khoản**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thêm trường Role | 1 |
| API cập nhật Role | 1 |
| API Disable User | 2 |
| Kiểm thử | 1 |

# **EPIC 3: QUẢN LÝ DỰ ÁN (PM)**

## **User Story US-06: Xem danh sách dự án**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API danh sách Project | 1 |
| Giao diện danh sách Project | 1 |
| Kiểm thử | 1 |

## **User Story US-07: Thêm, cập nhật, xóa dự án**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng Project | 1 |
| API Create Project | 2 |
| API Update Project | 1 |
| API Delete Project | 1 |
| Form Project | 1 |
| Validate dữ liệu | 1 |
| Kiểm thử CRUD | 1 |

## **User Story US-08: Thêm và xóa thành viên dự án**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng ProjectMember | 1 |
| API thêm thành viên | 2 |
| API xóa thành viên | 2 |
| Hiển thị danh sách thành viên | 1 |
| UI quản lý thành viên | 1 |
| Kiểm thử | 1 |

## **User Story US-09: Tạo Roadmap**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng Roadmap | 1 |
| Thiết kế bảng Milestone | 1 |
| API tạo Roadmap | 1 |
| API chỉnh sửa Roadmap  | 1 |
| UI hiển thị Roadmap  | 1 |

# **EPIC 4: QUẢN LÝ TASK (PM)**

## **User Story US-10: Thêm, cập nhật, xóa Task**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng Task | 1 |
| API Create Task | 2 |
| API Update Task | 1 |
| API Delete Task | 1 |
| Form Task | 1 |
| Validate dữ liệu | 1 |
| Test CRUD | 1 |

## **User Story US-11: Monitor tiến độ**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API thống kê Task | 2 |
| Tính % hoàn thành | 2 |
| Dashboard tiến độ | 2 |
| Test | 2 |

## **User Story US-12: Xử lý yêu cầu gia hạn Deadline**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API lấy danh sách yêu cầu | 1 |
| API duyệt yêu cầu | 2 |
| API từ chối yêu cầu | 1 |
| Test | 1 |

# **EPIC 5: CHỨC NĂNG MEMBER**

## **User Story US-13: Xem thông tin dự án**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API chi tiết dự án | 1 |
| UI thông tin dự án | 1 |
| Test | 1 |

## **User Story US-14: Xem Roadmap dự án**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API Roadmap | 1 |
| UI timeline | 1 |
| Test | 1 |

## **User Story US-15: Xem danh sách Task**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| API danh sách Task | 2 |
| UI danh sách Task | 1 |
| Bộ lọc trạng thái | 1 |
| Test | 1 |

## **User Story US-16: Cập nhật trạng thái Task**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Enum Status | 1 |
| API Update Status | 2 |
| UI cập nhật trạng thái | 1 |
| Test | 1 |

## **User Story US-17: Bình luận Task**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng Comment | 1 |
| API thêm Comment | 2 |
| API lấy Comment | 1 |
| UI Comment | 1 |

## **User Story US-18: Gửi yêu cầu gia hạn Deadline**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng DeadlineRequest | 1 |
| API gửi yêu cầu | 2 |
| Form nhập lý do | 1 |
| Test | 1 |

# **EPIC 6: THÔNG BÁO**

## **User Story US-19: Nhận thông báo Realtime**

Task Breakdown:

| Task | Point |
| ----- | ----- |
| Thiết kế bảng Notification | 1 |
| API Notification | 1 |
| Cấu hình WebSocket | 3 |
| UI Notification | 2 |
| Test | 1 |

# **EPIC 7: QUẢN LÝ BẢNG KANBAN**

## **User Story US-20: Xem bảng Kanban dự án**

Task Breakdown

| Task | Point |
| ----- | ----- |
| API lấy danh sách Task của Project | 1 |
| Nhóm Task theo Status (Todo, In Progress,Done) | 1 |
| Thiết kế giao diện Kanban Board | 1 |
| Hiển thị Task Card trên từng cột | 1 |
| Kiểm thử hiển thị Kanban | 1 |

## **User Story US-21: Kéo thả Task giữa các cột Kanban**

Task Breakdown

| Task | Point |
| ----- | ----- |
| Tích hợp thư viện Drag & Drop (dnd-kit) | 2 |
| Xử lý sự kiện kéo thả Task | 2 |
| API cập nhật trạng thái Task | 2 |
| Đồng bộ dữ liệu và cập nhật UI | 1 |
| Kiểm thử chức năng kéo thả | 1 |

## **User Story US-22: Xem nhanh thông tin Task trên Kanban**

Task Breakdown

| Task | Point |
| ----- | ----- |
| Thiết kế giao diện Task Card | 1 |
| Hiển thị người thực hiện (Assignee) | 1 |
| Hiển thị Deadline và độ ưu tiên (Priority) | 1 |

