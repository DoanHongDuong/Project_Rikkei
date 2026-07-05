import { useEffect, useState } from 'react';
import AdminUserService from '../../services/adminUserService';
import AuthService from '../../services/authService';
import type {
  AdminUser,
  CreateUserPayload,
  UpdateUserPayload,
  UserListFilters,
  UserPagination,
  UserRole,
  UserStatus,
} from '../../types/user-management';
import './AdminUsers.css';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const EMPTY_FORM = {
  full_name: '',
  email: '',
  password: '',
  role: 'MEMBER' as UserRole,
  department_id: '',
};

interface UserFormState {
  full_name: string;
  email: string;
  password: string;
  role: UserRole;
  department_id: string;
}

export default function AdminUsersPage() {
  const currentUser = AuthService.getUser();
  const isAdmin = currentUser?.role === 'ADMIN';
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<UserPagination>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    totalItems: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState<UserListFilters>({
    page: DEFAULT_PAGE,
    limit: DEFAULT_LIMIT,
    search: '',
    role: '',
    status: '',
    department_id: '',
  });
  const [form, setForm] = useState<UserFormState>(EMPTY_FORM);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const loadUsers = async (nextFilters = filters) => {
    if (!isAdmin) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await AdminUserService.getUsers(nextFilters);
      setUsers(result.users);
      setPagination(result.pagination);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải danh sách user.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadUsers();
  }, [isAdmin]);

  const updateFilter = (name: keyof UserListFilters, value: string) => {
    const nextFilters = {
      ...filters,
      page: DEFAULT_PAGE,
      [name]: value,
    };

    setFilters(nextFilters);
  };

  const updateForm = (name: keyof UserFormState, value: string) => {
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingUserId(null);
    setSelectedUser(null);
  };

  const buildCreatePayload = (): CreateUserPayload => ({
    full_name: form.full_name,
    email: form.email,
    password: form.password,
    role: form.role,
    department_id: form.department_id ? Number(form.department_id) : null,
  });

  const buildUpdatePayload = (): UpdateUserPayload => ({
    full_name: form.full_name,
    email: form.email,
    role: form.role,
    department_id: form.department_id ? Number(form.department_id) : null,
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      if (editingUserId) {
        const updatedUser = await AdminUserService.updateUser(editingUserId, buildUpdatePayload());
        setMessage(`Đã cập nhật user: ${updatedUser.email}`);
      } else {
        const createdUser = await AdminUserService.createUser(buildCreatePayload());
        setMessage(`Đã tạo user: ${createdUser.email}`);
      }

      resetForm();
      await loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Thao tác thất bại.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUserId(user.id);
    setSelectedUser(user);
    setForm({
      full_name: user.full_name,
      email: user.email,
      password: '',
      role: user.role,
      department_id: user.department_id ? String(user.department_id) : '',
    });
  };

  const handleViewDetail = async (id: number) => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const user = await AdminUserService.getUserById(id);
      setSelectedUser(user);
      setMessage(`Đã tải chi tiết user: ${user.email}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể tải chi tiết user.');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeStatus = async (user: AdminUser) => {
    const nextStatus: UserStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const updatedUser = await AdminUserService.updateUserStatus(user.id, nextStatus);
      setMessage(`Đã cập nhật trạng thái ${updatedUser.email} thành ${updatedUser.status}`);
      await loadUsers();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Không thể cập nhật trạng thái user.');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilters = async () => {
    await loadUsers(filters);
  };

  const handleChangePage = async (page: number) => {
    const nextFilters = {
      ...filters,
      page,
    };

    setFilters(nextFilters);
    await loadUsers(nextFilters);
  };

  if (!isAdmin) {
    return (
      <section className="admin-users-page">
        <div className="admin-users-card">
          <h2>Admin User Management</h2>
          <p className="admin-users-error">Bạn cần đăng nhập bằng tài khoản ADMIN để test module này.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="admin-users-page">
      <div className="admin-users-header">
        <div>
          <h2>User Management Test Panel</h2>
          <p>Trang React đơn giản để test Backend Admin User API.</p>
        </div>
        <button type="button" onClick={() => void loadUsers()} disabled={loading}>
          Reload
        </button>
      </div>

      {(message || error) && (
        <div className={`admin-users-alert ${error ? 'is-error' : 'is-success'}`}>
          {error || message}
        </div>
      )}

      <div className="admin-users-grid">
        <form className="admin-users-card admin-users-form" onSubmit={(event) => void handleSubmit(event)}>
          <h3>{editingUserId ? 'Cập nhật user' : 'Tạo user mới'}</h3>

          <label>
            Họ tên
            <input
              value={form.full_name}
              onChange={(event) => updateForm('full_name', event.target.value)}
              placeholder="Nguyen Van A"
              required
            />
          </label>

          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => updateForm('email', event.target.value)}
              placeholder="user@example.com"
              type="email"
              required
            />
          </label>

          {!editingUserId && (
            <label>
              Password khởi tạo
              <input
                value={form.password}
                onChange={(event) => updateForm('password', event.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                type="password"
                required
              />
            </label>
          )}

          <label>
            Role
            <select 
              value={form.role} 
              onChange={(event) => {
                const newRole = event.target.value;
                updateForm('role', newRole);
                if (newRole === 'ADMIN') {
                  updateForm('department_id', '');
                }
              }}
            >
              <option value="ADMIN">ADMIN</option>
              <option value="PM">PM</option>
              <option value="MEMBER">MEMBER</option>
            </select>
          </label>

          <label>
            Department ID
            <input
              value={form.department_id}
              onChange={(event) => updateForm('department_id', event.target.value)}
              placeholder="VD: 1"
              type="number"
              min="1"
              disabled={form.role === 'ADMIN'}
            />
          </label>

          <div className="admin-users-actions">
            <button type="submit" disabled={loading}>
              {editingUserId ? 'Lưu cập nhật' : 'Tạo user'}
            </button>
            <button type="button" className="secondary" onClick={resetForm} disabled={loading}>
              Reset form
            </button>
          </div>
        </form>

        <div className="admin-users-card">
          <h3>Chi tiết user</h3>
          {selectedUser ? (
            <dl className="admin-users-detail">
              <dt>ID</dt>
              <dd>{selectedUser.id}</dd>
              <dt>Họ tên</dt>
              <dd>{selectedUser.full_name}</dd>
              <dt>Email</dt>
              <dd>{selectedUser.email}</dd>
              <dt>Role</dt>
              <dd>{selectedUser.role}</dd>
              <dt>Status</dt>
              <dd>{selectedUser.status}</dd>
              <dt>Department</dt>
              <dd>{selectedUser.department_id || 'N/A'}</dd>
              <dt>Last login</dt>
              <dd>{selectedUser.last_login_at || 'N/A'}</dd>
            </dl>
          ) : (
            <p>Chọn “Xem” ở bảng bên dưới để test API detail.</p>
          )}
        </div>
      </div>

      <div className="admin-users-card admin-users-filters">
        <input
          value={filters.search}
          onChange={(event) => updateFilter('search', event.target.value)}
          placeholder="Search tên/email"
        />
        <select value={filters.role} onChange={(event) => updateFilter('role', event.target.value)}>
          <option value="">Tất cả role</option>
          <option value="ADMIN">ADMIN</option>
          <option value="PM">PM</option>
          <option value="MEMBER">MEMBER</option>
        </select>
        <select value={filters.status} onChange={(event) => updateFilter('status', event.target.value)}>
          <option value="">Tất cả status</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="DISABLED">DISABLED</option>
        </select>
        <input
          value={filters.department_id}
          onChange={(event) => updateFilter('department_id', event.target.value)}
          placeholder="Department ID"
          type="number"
          min="1"
        />
        <button type="button" onClick={() => void handleApplyFilters()} disabled={loading}>
          Lọc
        </button>
      </div>

      <div className="admin-users-card admin-users-table-wrap">
        <table className="admin-users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Department</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.full_name}</td>
                <td>{user.email}</td>
                <td>{user.role}</td>
                <td>
                  <span className={`admin-users-status ${user.status === 'ACTIVE' ? 'active' : 'disabled'}`}>
                    {user.status}
                  </span>
                </td>
                <td>{user.department_id || 'N/A'}</td>
                <td>
                  <div className="admin-users-row-actions">
                    <button type="button" onClick={() => void handleViewDetail(user.id)} disabled={loading}>
                      Xem
                    </button>
                    <button type="button" onClick={() => handleEdit(user)} disabled={loading}>
                      Sửa
                    </button>
                    <button type="button" onClick={() => void handleChangeStatus(user)} disabled={loading}>
                      {user.status === 'ACTIVE' ? 'Khóa' : 'Mở'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!users.length && (
              <tr>
                <td colSpan={7}>Không có user nào.</td>
              </tr>
            )}
          </tbody>
        </table>

        <div className="admin-users-pagination">
          <button
            type="button"
            disabled={loading || pagination.page <= DEFAULT_PAGE}
            onClick={() => void handleChangePage(pagination.page - 1)}
          >
            Trang trước
          </button>
          <span>
            Trang {pagination.page} / {pagination.totalPages || DEFAULT_PAGE} · Tổng {pagination.totalItems}
          </span>
          <button
            type="button"
            disabled={loading || pagination.page >= pagination.totalPages}
            onClick={() => void handleChangePage(pagination.page + 1)}
          >
            Trang sau
          </button>
        </div>
      </div>
    </section>
  );
}
