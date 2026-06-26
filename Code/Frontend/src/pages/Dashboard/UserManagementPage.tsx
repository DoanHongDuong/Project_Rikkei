import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./UserManagementPage.css";
import { useDebounce } from "../../hooks/useDebounce";

// ── Types ──────────────────────────────────────────────────────────────────
type Role = "ADMIN" | "PM" | "MEMBER";
type Status = "ACTIVE" | "DISABLED";

interface User {
  id: number;
  full_name: string;
  email: string;
  role: Role;
  department_id?: number | null; 
  status: Status;
  createdAt?: string;
}

interface Department {
  id: number;
  name: string;
}

const ROLES: { value: Role; label: string }[] = [
  { value: "MEMBER", label: "MEMBER (Nhân viên)" },
  { value: "PM", label: "PM (Quản lý dự án)" },
  { value: "ADMIN", label: "ADMIN (Quản trị viên)" }
];

// ── Add / Edit User Modal Component ──────────────────────────────────────────
interface UserModalProps {
  user?: User;
  departments: Department[];
  onClose: () => void;
  onSave: (u: { full_name: string; email: string; role: Role; password?: string; department_id?: number | null }) => Promise<boolean>;
}

const UserModal: React.FC<UserModalProps> = ({ user, departments, onClose, onSave }) => {
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [email, setEmail] = useState(user?.email ?? "");
  const [role, setRole] = useState<Role>(user?.role ?? "MEMBER");
  const [password, setPassword] = useState("");
  const [departmentId, setDepartmentId] = useState<number | null>(user?.department_id ?? null);

  // Điều kiện validate đầu vào
  const isFormValid = user 
    ? fullName.trim().length > 0 
    : fullName.trim().length > 0 && email.includes("@") && password.trim().length >= 6;

  const handleSave = async () => {
    if (!isFormValid) return;
    
    const payload = user 
      ? { full_name: fullName, email, role, department_id: departmentId }
      : { full_name: fullName, email, role, password, department_id: departmentId };

    const success = await onSave(payload);
    if (success) onClose();
  };

  return (
    <div className="um-modal-overlay" onClick={onClose}>
      <div className="um-modal" onClick={(e) => e.stopPropagation()}>
        <div className="um-modal__header">
          <h2>{user ? "Chỉnh sửa tài khoản" : "Cấp tài khoản nhân sự mới"}</h2>
          <button className="um-modal__close" onClick={onClose}>✕</button>
        </div>

        <div className="um-modal__grid" style={{ marginTop: "16px" }}>
          <div className="um-field">
            <label>Họ và tên *</label>
            <input 
              value={fullName} 
              onChange={(e) => setFullName(e.target.value)} 
              placeholder="Nguyễn Văn A" 
            />
          </div>
          <div className="um-field">
            <label>Email đăng nhập *</label>
            <input 
              type="email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              placeholder="name@company.com" 
              disabled={!!user} 
            />
          </div>

          {/* CHỈ HIỂN THỊ Ô MẬT KHẨU KHI TẠO MỚI */}
          {!user && (
            <div className="um-field">
              <label>Mật khẩu khởi tạo * (Tối thiểu 6 ký tự)</label>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                placeholder="Nhập mật khẩu an toàn..." 
              />
            </div>
          )}

          <div className="um-field">
            <label>Vai trò hệ thống (Role) *</label>
            <select value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>

          {/* DROPDOWN CHỌN PHÒNG BAN */}
          <div className="um-field">
            <label>Phòng ban</label>
            <select 
              value={departmentId ?? ""} 
              onChange={(e) => setDepartmentId(e.target.value ? Number(e.target.value) : null)}
            >
              <option value="">-- Chưa phân bổ phòng ban --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="um-modal__actions">
          <button className="um-btn um-btn--ghost" onClick={onClose}>Hủy</button>
          <button 
            className="um-btn um-btn--primary" 
            onClick={handleSave} 
            disabled={!isFormValid}
          >
            {user ? "Lưu thay đổi" : "Kích hoạt tài khoản"}
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Confirm Delete Dialog Component ─────────────────────────────────────────
const ConfirmDialog: React.FC<{ name: string; onConfirm: () => void; onCancel: () => void }> = ({
  name, onConfirm, onCancel,
}) => (
  <div className="um-modal-overlay" onClick={onCancel}>
    <div className="um-modal um-modal--sm" onClick={(e) => e.stopPropagation()} style={{ padding: "24px" }}>
      <h3 style={{ color: "#FF4646", marginTop: 0, fontSize: "18px" }}>Xóa mềm tài khoản nhân sự</h3>
      <p style={{ fontSize: "14px", lineHeight: "1.5", margin: "12px 0 24px 0" }}>
        Bạn có chắc chắn muốn xóa nhân sự <strong>{name}</strong>?
      </p>
      <div className="um-modal__actions" style={{ padding: 0 }}>
        <button className="um-btn um-btn--ghost" onClick={onCancel}>Hủy</button>
        <button className="um-btn um-btn--danger" onClick={onConfirm}>Xác nhận xóa</button>
      </div>
    </div>
  </div>
);

// ── Status Badge Component ──────────────────────────────────────────────────
const UMStatusBadge: React.FC<{ status: Status }> = ({ status }) => {
  const label = status === "ACTIVE" ? "Hoạt động" : "Bị Khóa";
  return <span className={`um-status um-status--${status === "ACTIVE" ? "active" : "inactive"}`}>{label}</span>;
};

// ── Initials Avatar Component ───────────────────────────────────────────────
const InitialsAvatar: React.FC<{ initials: string; index: number }> = ({ initials, index }) => {
  const colors = ["#f08080", "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626"];
  const bg = colors[index % colors.length];
  return <div className="um-avatar" style={{ background: bg }}>{initials}</div>;
};

// ── Main Component ─────────────────────────────────────────────────────────
const UserManagementPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [search, setSearch] = useState("");
  // Kích hoạt Debounce cho thanh tìm kiếm (chờ 500ms)
  const debouncedSearch = useDebounce(search, 500);

  const [statusFilter, setStatusFilter] = useState<"all" | Status>("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteUser, setDeleteUser] = useState<User | null>(null);

  // Hàm cấu hình headers chứa token và kiểm tra phân quyền
  const getAuthHeaders = (params: any = {}) => {
    const token = localStorage.getItem("authToken");
    return { headers: { Authorization: `Bearer ${token}` }, params };
  };

  // --- LẤY DANH SÁCH USER VÀ PHÒNG BAN TỪ BE ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [usersRes, deptsRes] = await Promise.all([
        // Gửi keyword tìm kiếm (đã debounce) lên BE
        axios.get("http://localhost:5000/api/admin/users", getAuthHeaders({ search: debouncedSearch })),
        axios.get("http://localhost:5000/api/departments", getAuthHeaders())
      ]);
      
      if (usersRes.data && Array.isArray(usersRes.data.data)) {
        setUsers(usersRes.data.data);
      } else if (Array.isArray(usersRes.data)) {
        setUsers(usersRes.data);
      }

      if (deptsRes.data && Array.isArray(deptsRes.data.data)) {
        setDepartments(deptsRes.data.data);
      } else if (Array.isArray(deptsRes.data)) {
        setDepartments(deptsRes.data);
      }

    } catch (error: any) {
      console.error("Lỗi kết nối BE:", error);
      toast.error("Không thể tải danh sách từ server!");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch]);

  // Mỗi khi debouncedSearch thay đổi, fetchData sẽ chạy lại (Server-side search)
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- HÀM TẠO MỚI TÀI KHOẢN ---
  const handleAdd = async (data: { full_name: string; email: string; role: Role; password?: string; department_id?: number | null }) => {
    try {
      await axios.post("http://localhost:5000/api/admin/users", data, getAuthHeaders());
      toast.success("Tạo tài khoản nhân sự mới thành công!");
      fetchData(); 
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra hoặc bạn không có quyền Admin!");
      return false;
    }
  };

  // --- HÀM CẬP NHẬT THÔNG TIN ---
  const handleEdit = async (data: { full_name: string; role: Role; department_id?: number | null }) => {
    if (!editUser) return false;
    try {
      await axios.put(`http://localhost:5000/api/admin/users/${editUser.id}`, data, getAuthHeaders());
      toast.success("Cập nhật thông tin thành công!");
      fetchData();
      return true;
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể cập nhật thông tin.");
      return false;
    }
  };

  // --- HÀM XÓA ---
  const handleDelete = async () => {
    if (!deleteUser) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${deleteUser.id}`, getAuthHeaders());
      toast.success(`Đã xóa mềm tài khoản: ${deleteUser.full_name}`);
      fetchData();
      setDeleteUser(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Hệ thống từ chối lệnh xóa tài khoản này.");
    }
  };

  // Bỏ lọc theo tên vì BE đã làm (Server-side search), chỉ còn lọc theo trạng thái ở Frontend
  const filtered = users.filter((u) => statusFilter === "all" || u.status === statusFilter);

  const activeCount = users.filter((u) => u.status === "ACTIVE").length;

  return (
    <div className="um-root">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
      {/* ── Sidebar Trái (Đã xóa chữ ALL PERFECT) ── */}
      <aside className="um-sidebar">
        <nav className="um-sidebar__nav">
          <button className="um-sidebar__nav-item" onClick={onBack}>
            <span>⊞</span> Dashboard
          </button>
          <button className="um-sidebar__nav-item um-sidebar__nav-item--active">
            <span>👥</span> HR Management
          </button>
        </nav>
      </aside>

      {/* ── Khu vực nội dung chính ── */}
      <main className="um-main">
        <header className="um-topbar">
          <div className="um-topbar__left">
            <button className="um-back-btn" onClick={onBack}>← Quay lại Dashboard</button>
            <h1 className="um-page-title">Quản Lý Nhân Sự (CRUD)</h1>
          </div>
          <button className="um-btn um-btn--primary" onClick={() => setShowAddModal(true)}>
            + Thêm tài khoản mới
          </button>
        </header>

        <div className="um-content">
          {/* Khối thống kê */}
          <div className="um-stats-strip">
            <div className="um-stat">
              <p className="um-stat__val">{users.length}</p>
              <p className="um-stat__lbl">Tổng số tài khoản</p>
            </div>
            <div className="um-stat">
              <p className="um-stat__val" style={{ color: "#04D361" }}>{activeCount}</p>
              <p className="um-stat__lbl">Đang hoạt động</p>
            </div>
            <div className="um-stat">
              <p className="um-stat__val" style={{ color: "#FF4646" }}>{users.length - activeCount}</p>
              <p className="um-stat__lbl">Bị khóa</p>
            </div>
          </div>

          {/* Ô Tìm kiếm kính lúp & Lọc */}
          <div className="um-filters">
            <div className="um-search-container">
              <span className="um-search-icon">🔍</span>
              <input
                className="um-search-input"
                placeholder="Tìm theo tên hoặc email tài khoản…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="um-filter-group">
              <button className={`tag ${statusFilter === "all" ? "active" : ""}`} onClick={() => setStatusFilter("all")}>Tất cả</button>
              <button className={`tag ${statusFilter === "ACTIVE" ? "active" : ""}`} onClick={() => setStatusFilter("ACTIVE")}>ACTIVE</button>
              <button className={`tag ${statusFilter === "DISABLED" ? "active" : ""}`} onClick={() => setStatusFilter("DISABLED")}>DISABLED</button>
            </div>
          </div>

          {/* Bảng Render dữ liệu đồng bộ */}
          <div className="monitor-card">
            <div className="table-responsive">
              {loading ? (
                <p style={{ padding: "30px", textAlign: "center", color: "#A8A8B3", fontStyle: "italic" }}>
                  Đang đồng bộ dữ liệu từ MySQL Server... (Hãy kiểm tra Login Token nếu đợi lâu)
                </p>
              ) : (
                <table className="monitor-table">
                  <thead>
                    <tr>
                      <th>Thành viên</th>
                      <th>Email hệ thống</th>
                      <th>Phòng ban</th>
                      <th>Cấp bậc (Role)</th>
                      <th>Trạng thái</th>
                      <th style={{ textAlign: "right", paddingRight: "16px" }}>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", color: "#A8A8B3", padding: "32px" }}>
                          Không tìm thấy dữ liệu nhân sự phù hợp từ database.
                        </td>
                      </tr>
                    ) : (
                      filtered.map((u, i) => {
                        const initials = u.full_name ? u.full_name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase() : "US";
                        const deptName = departments.find(d => d.id === u.department_id)?.name || "Chưa phân bổ";
                        return (
                          <tr key={u.id}>
                            <td>
                              <div className="user-cell" style={{ display: "flex", alignItems: "center" }}>
                                <InitialsAvatar initials={initials} index={i} />
                                <span>{u.full_name}</span>
                              </div>
                            </td>
                            <td style={{ color: "#A8A8B3" }}>{u.email}</td>
                            <td style={{ color: "#A8A8B3" }}>{deptName}</td>
                            <td>
                              <span className="dept-badge" style={{ borderColor: u.role === "ADMIN" ? "#04D361" : u.role === "PM" ? "#FF9900" : "#29292E", color: u.role === "ADMIN" ? "#04D361" : u.role === "PM" ? "#FF9900" : "#A8A8B3" }}>
                                {u.role}
                              </span>
                            </td>
                            <td><UMStatusBadge status={u.status} /></td>
                            <td>
                              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", paddingRight: "8px" }}>
                                <button className="tag" onClick={() => setEditUser(u)}>✏️ Sửa</button>
                                <button className="tag" style={{ color: "#FF4646" }} onClick={() => setDeleteUser(u)}>🗑️ Xóa</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Modals điều khiển */}
      {showAddModal && (
        <UserModal departments={departments} onClose={() => setShowAddModal(false)} onSave={handleAdd} />
      )}
      {editUser && (
        <UserModal user={editUser} departments={departments} onClose={() => setEditUser(null)} onSave={handleEdit} />
      )}
      {deleteUser && (
        <ConfirmDialog
          name={deleteUser.full_name}
          onConfirm={handleDelete}
          onCancel={() => setDeleteUser(null)}
        />
      )}
    </div>
  );
};

export default UserManagementPage;