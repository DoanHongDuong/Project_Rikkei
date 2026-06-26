import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

export default function DashboardPage() {
  const navigate = useNavigate();

  const [stats] = useState({
    totalEmployees: 128,
    activeDepartments: 6,
    totalProjects: 18,
    systemTasks: 342,
  });

  const [recentUsers] = useState([
    { name: 'Nguyễn Thành', dept: 'Design', tasks: 9, workload: 'Quá tải', status: 'Quá tải', class: 'status-overload' },
    { name: 'Lê Hương', dept: 'Dev', tasks: 6, workload: 'Bình thường', status: 'Đang làm', class: 'status-working' },
    { name: 'Phạm Minh', dept: 'Marketing', tasks: 4, workload: 'Nhẹ', status: 'Bình thường', class: 'status-working' },
    { name: 'Trần Vân', dept: 'Design', tasks: 8, workload: 'Quá tải', status: 'Quá tải', class: 'status-overload' },
    { name: 'Đặng Nam', dept: 'QA', tasks: 2, workload: 'Rảnh', status: 'Nghỉ phép', class: 'status-leave' },
  ]);

  const [alerts] = useState([
    { id: 1, type: 'danger', text: 'Dự án Alpha — trễ hạn 5 ngày, chưa có cập nhật' },
    { id: 2, type: 'warning', text: 'Phòng Design — 3 nhân viên đang quá tải' },
    { id: 3, type: 'info', text: 'Sprint Q3 — 38 task sắp đến deadline trong 24h' },
  ]);

  return (
    <div className="admin-dashboard-container">

      {/* HEADER BAR */}
      <div className="dashboard-header">
        <div className="header-title">
          <h1>HỆ THỐNG QUẢN TRỊ ADMIN</h1>
          <p>Tổng quan hoạt động và điều phối nhân sự toàn hệ thống</p>
        </div>
        {/* VỊ TRÍ 1: CẬP NHẬT NHÓM NÚT BẤM TẠI HEADER */}
        <div className="header-actions" style={{ display: 'flex', gap: '12px' }}>
          <button onClick={() => navigate('/admin/users')} className="btn-crud">
            👥 Quản Lý Nhân Sự
          </button>
          <button onClick={() => navigate('/admin/departments')} className="btn-crud" style={{ backgroundColor: '#2563eb' }}>
            🏢 Quản Lý Phòng Ban
          </button>
        </div>
      </div>

      {/* 4 CARDS THỐNG KÊ */}
      <div className="stats-grid">
        <div className="stats-card">
          <p className="card-label">Tổng nhân viên</p>
          <p className="card-value text-green">{stats.totalEmployees}</p>
          <span className="card-subtext text-green">+4 mới tháng này</span>
        </div>

        {/* VỊ TRÍ 2: BIẾN Ô THỐNG KÊ PHÒNG BAN THÀNH Ô CÓ THỂ CLICK */}
        <div
          className="stats-card"
          onClick={() => navigate('/admin/departments')}
          style={{ cursor: 'pointer', transition: 'transform 0.2s' }}
          title="Click để quản lý phòng ban"
        >
          <p className="card-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            Phòng ban hoạt động <span>↗</span>
          </p>
          <p className="card-value text-white">{stats.activeDepartments}</p>
          <span className="card-subtext">Design • Dev • Mar • HR • Sales • QA</span>
        </div>

        <div className="stats-card">
          <p className="card-label">Tổng dự án</p>
          <p className="card-value text-orange">{stats.totalProjects}</p>
          <span className="card-subtext text-danger">⚠️ 2 đang gặp rủi ro</span>
        </div>
        <div className="stats-card">
          <p className="card-label">Task toàn hệ thống</p>
          <p className="card-value text-white">{stats.systemTasks}</p>
          <span className="card-subtext text-danger">⏰ 38 task quá hạn</span>
        </div>
      </div>

      {/* CHIA CHÍNH */}
      <div className="main-content-layout">

        {/* CỘT TRÁI - GIÁM SÁT NHÂN VIÊN */}
        <div className="column-left monitor-card">
          <div className="monitor-header">
            <h3>👥 Giám sát nhân viên <span>({stats.totalEmployees} người)</span></h3>
            <div className="filter-tags">
              <span className="tag active">Tất cả</span>
              <span className="tag">Quá tải</span>
              <span className="tag">Nghỉ phép</span>
            </div>
          </div>

          <div className="table-responsive">
            <table className="monitor-table">
              <thead>
                <tr>
                  <th>Nhân viên</th>
                  <th>Phòng ban</th>
                  <th style={{ textAlign: 'center' }}>Task đang làm</th>
                  <th>Khối lượng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((item, index) => (
                  <tr key={index}>
                    <td className="user-cell">
                      <div className="avatar-circle">{item.name.charAt(0)}</div>
                      {item.name}
                    </td>
                    <td><span className="dept-badge">{item.dept}</span></td>
                    <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{item.tasks}</td>
                    <td>
                      <span className={item.workload === 'Quá tải' ? 'text-danger' : item.workload === 'Bình thường' ? 'text-orange' : 'text-green'}>
                        {item.workload}
                      </span>
                    </td>
                    <td>
                      <span className={`status-dot ${item.class}`}>
                        ● {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button onClick={() => navigate('/admin/users')} className="view-more-link">
            Xem chi tiết danh sách và điều chỉnh quyền tài khoản ↗
          </button>
        </div>

        {/* CỘT PHẢI - CẢNH BÁO & HIỆU SUẤT */}
        <div className="column-right">

          <div className="alert-card">
            <div className="alert-title-box">
              <h3>🚨 Cảnh báo hệ thống</h3>
              <span className="alert-count">5</span>
            </div>
            <div className="alert-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  {alert.text}
                </div>
              ))}
            </div>
          </div>

          <div className="performance-card">
            <h3>📉 Tổng hợp hiệu suất</h3>
            <div className="performance-list">
              <div className="performance-row">
                <span>Tỷ lệ hoàn thành task</span>
                <span className="text-green">78%</span>
              </div>
              <div className="performance-row">
                <span>Tỷ lệ task quá hạn</span>
                <span className="text-danger">11%</span>
              </div>
              <div className="performance-row">
                <span>Nhân viên quá tải</span>
                <span className="text-orange">8 người</span>
              </div>
              <div className="performance-row">
                <span>Dự án đúng tiến độ</span>
                <span className="text-white">14 / 18</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}