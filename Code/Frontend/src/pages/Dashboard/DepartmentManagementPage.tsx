import React, { useState, useEffect } from "react";
import axios from "axios";
import "./DepartmentManagementPage.css";

const getAuthHeaders = () => {
    return { headers: { Authorization: `Bearer ${localStorage.getItem("authToken")}` } };
};
// ── Types ──────────────────────────────────────────────────────────────────
interface Department {
    id: number;
    name: string;
    description: string;
    created_at?: string;
}

// ── Modals ─────────────────────────────────────────────────────────────────
const DepartmentModal: React.FC<{
    department?: Department;
    onClose: () => void;
    onSave: (d: { name: string; description: string }) => Promise<boolean>;
    errorMsg: string;
}> = ({ department, onClose, onSave, errorMsg }) => {
    const [name, setName] = useState(department?.name ?? "");
    const [description, setDescription] = useState(department?.description ?? "");

    const isValid = name.trim().length > 0;

    const handleSave = async () => {
        if (!isValid) return;
        const success = await onSave({ name, description });
        if (success) onClose();
    };

    return (
        <div className="dm-modal-overlay" onClick={onClose}>
            <div className="dm-modal" onClick={(e) => e.stopPropagation()}>
                <div className="dm-modal__header">
                    <h2>{department ? "Chỉnh sửa Phòng Ban" : "Thêm Phòng Ban Mới"}</h2>
                    <button className="dm-modal__close" onClick={onClose}>✕</button>
                </div>
                {errorMsg && <div className="dm-error">⚠️ {errorMsg}</div>}
                <div className="dm-modal__grid">
                    <div className="dm-field">
                        <label>Tên phòng ban *</label>
                        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Phòng Công Nghệ" />
                    </div>
                    <div className="dm-field">
                        <label>Mô tả chức năng</label>
                        <textarea
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Nhập mô tả về phòng ban..."
                        />
                    </div>
                </div>
                <div className="dm-modal__actions">
                    <button className="dm-btn dm-btn--ghost" onClick={onClose}>Hủy</button>
                    <button className="dm-btn dm-btn--primary" onClick={handleSave} disabled={!isValid}>
                        {department ? "Lưu thay đổi" : "Tạo phòng ban"}
                    </button>
                </div>
            </div>
        </div>
    );
};

const ConfirmDeleteDialog: React.FC<{ name: string; onConfirm: () => void; onCancel: () => void }> = ({ name, onConfirm, onCancel }) => (
    <div className="dm-modal-overlay" onClick={onCancel}>
        <div className="dm-modal dm-modal--sm" onClick={(e) => e.stopPropagation()}>
            <h3>Xóa Phòng Ban</h3>
            <p>Bạn có chắc chắn muốn xóa <strong>{name}</strong>? Các nhân sự thuộc phòng này sẽ bị gỡ khỏi phòng ban.</p>
            <div className="dm-modal__actions">
                <button className="dm-btn dm-btn--ghost" onClick={onCancel}>Hủy</button>
                <button className="dm-btn dm-btn--danger" onClick={onConfirm}>Xác nhận xóa</button>
            </div>
        </div>
    </div>
);

// ── Main Page ──────────────────────────────────────────────────────────────
const DepartmentManagementPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [editDept, setEditDept] = useState<Department | null>(null);
    const [deleteDept, setDeleteDept] = useState<Department | null>(null);
    const [errorMsg, setErrorMsg] = useState("");

    const fetchDepartments = async () => {
        try {
            setLoading(true);
            const res = await axios.get("http://localhost:5000/api/departments", getAuthHeaders());
            const data = res.data.data || res.data;
            setDepartments(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Lỗi lấy danh sách phòng ban:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchDepartments(); }, []);

    const handleAdd = async (data: { name: string; description: string }) => {
        setErrorMsg("");
        try {
            await axios.post("http://localhost:5000/api/departments", data, getAuthHeaders());
            fetchDepartments();
            return true;
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Lỗi tạo phòng ban!");
            return false;
        }
    };

    const handleEdit = async (data: { name: string; description: string }) => {
        if (!editDept) return false;
        setErrorMsg("");
        try {
            await axios.put(`http://localhost:5000/api/departments/${editDept.id}`, data, getAuthHeaders());
            fetchDepartments();
            return true;
        } catch (error: any) {
            setErrorMsg(error.response?.data?.message || "Lỗi cập nhật!");
            return false;
        }
    };

    const handleDelete = async () => {
        if (!deleteDept) return;
        try {
            await axios.delete(`http://localhost:5000/api/departments/${deleteDept.id}`, getAuthHeaders());
            fetchDepartments();
            setDeleteDept(null);
        } catch (error) {
            alert("Hệ thống từ chối lệnh xóa phòng ban này.");
        }
    };

    const filtered = departments.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <div className="dm-root">
            <aside className="dm-sidebar">
                <nav className="dm-sidebar__nav">
                    <button className="dm-sidebar__nav-item" onClick={onBack}><span>⊞</span> Dashboard</button>
                    <button className="dm-sidebar__nav-item"><span>👥</span> HR Management</button>
                    <button className="dm-sidebar__nav-item dm-sidebar__nav-item--active"><span>🏢</span> Departments</button>
                </nav>
            </aside>

            <main className="dm-main">
                <header className="dm-topbar">
                    <div>
                        <button className="dm-back-btn" onClick={onBack}>← Quay lại Dashboard</button>
                        <h1 className="dm-page-title">Quản Lý Phòng Ban</h1>
                    </div>
                    <button className="dm-btn dm-btn--primary" onClick={() => { setErrorMsg(""); setShowAddModal(true); }}>
                        + Thêm phòng ban
                    </button>
                </header>

                <div className="dm-content">
                    <div className="dm-filters">
                        <div className="dm-search-container">
                            <span>🔍</span>
                            <input
                                placeholder="Tìm tên phòng ban..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="dm-card">
                        {loading ? (
                            <p style={{ textAlign: "center", padding: "20px", color: "#A8A8B3" }}>Đang tải dữ liệu...</p>
                        ) : (
                            <table className="dm-table">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>ID</th>
                                        <th style={{ width: "250px" }}>Tên Phòng Ban</th>
                                        <th>Mô Tả</th>
                                        <th style={{ textAlign: "right" }}>Hành Động</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filtered.length === 0 ? (
                                        <tr><td colSpan={4} style={{ textAlign: "center", padding: "30px" }}>Chưa có dữ liệu phòng ban.</td></tr>
                                    ) : (
                                        filtered.map((d) => (
                                            <tr key={d.id}>
                                                <td>#{d.id}</td>
                                                <td style={{ fontWeight: "bold", color: "#E1E1E6" }}>{d.name}</td>
                                                <td style={{ color: "#A8A8B3" }}>{d.description || "Không có mô tả"}</td>
                                                <td>
                                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                                                        <button className="dm-action-btn" onClick={() => setEditDept(d)}>✏️</button>
                                                        <button className="dm-action-btn" onClick={() => setDeleteDept(d)}>🗑️</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        )}
                    </div>
                </div>
            </main>

            {showAddModal && <DepartmentModal onClose={() => setShowAddModal(false)} onSave={handleAdd} errorMsg={errorMsg} />}
            {editDept && <DepartmentModal department={editDept} onClose={() => setEditDept(null)} onSave={handleEdit} errorMsg={errorMsg} />}
            {deleteDept && <ConfirmDeleteDialog name={deleteDept.name} onConfirm={handleDelete} onCancel={() => setDeleteDept(null)} />}
        </div>
    );
};

export default DepartmentManagementPage;