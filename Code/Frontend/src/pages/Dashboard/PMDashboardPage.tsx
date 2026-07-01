import { useState, useEffect } from 'react';
import { message, Skeleton } from 'antd';
import ProjectService from '../../services/projectService';
import dayjs from 'dayjs';
import './PMStyles.css';

export default function PMDashboardPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const data = await ProjectService.getProjects({ limit: 100 });
        setProjects(Array.isArray(data) ? data : []);
      } catch (error: any) {
        message.error(error.message || 'Lỗi khi tải dữ liệu dự án');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 10 }} />;
  }

  const activeProjects = projects.filter(p => p.status === 'ACTIVE').length;
  const completedProjects = projects.filter(p => p.status === 'COMPLETED').length;
  
  // Count projects as at risk if they are ACTIVE and deadline is within 7 days, or overdue
  const today = dayjs();
  const atRiskProjects = projects.filter(p => {
    if (p.status !== 'ACTIVE') return false;
    if (!p.end_date) return false;
    const end = dayjs(p.end_date);
    const diff = end.diff(today, 'day');
    return diff <= 7;
  }).length;

  return (
    <div>
      <div style={{ display: 'flex', gap: '40px' }}>
        {/* Left Column: Projects Overview & Chart */}
        <div style={{ flex: 1 }}>
          <h2 className="pm-section-title">Tổng quan dự án</h2>
          
          <div className="pm-summary-cards">
            <div className="pm-card pm-card-blue">
              <div className="pm-card-title">Đang chạy</div>
              <div className="pm-card-value">{activeProjects}</div>
              <div className="pm-card-subtitle">Dự án</div>
            </div>
            
            <div className="pm-card pm-card-red">
              <div className="pm-card-title">Rủi ro / Quá hạn</div>
              <div className="pm-card-value">{atRiskProjects}</div>
              <div className="pm-card-subtitle">Cần xử lý</div>
            </div>
            
            <div className="pm-card pm-card-green">
              <div className="pm-card-title">Hoàn thành</div>
              <div className="pm-card-value">{completedProjects}</div>
              <div className="pm-card-subtitle">Dự án</div>
            </div>
          </div>

          <h3 className="pm-section-title" style={{ fontSize: '18px', marginTop: '30px' }}>Tiến độ các dự án</h3>
          
          <div className="pm-chart-container">
            {projects.slice(0, 5).map((project, index) => {
              const progress = project.progress || 0;
              return (
                <div className="pm-chart-row" key={index}>
                  <div className="pm-chart-label" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100px' }} title={project.name}>{project.name}</div>
                  <div className="pm-chart-bar-bg" style={{ display: 'flex', backgroundColor: '#E5E7EB' }}>
                    <div className="pm-chart-segment-green" style={{ width: `${progress}%`, backgroundColor: '#10B981' }}></div>
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '12px' }}>{progress}%</div>
                </div>
              );
            })}
            {projects.length === 0 && <div style={{ textAlign: 'center', padding: '20px', color: '#6B7280' }}>Chưa có dự án nào</div>}
          </div>
        </div>

        {/* Right Column: Recent Projects */}
        <div style={{ width: '400px' }}>
          <h2 className="pm-section-title">Dự án gần đây</h2>
          
          <table className="pm-table">
            <thead>
              <tr>
                <th>Tên dự án</th>
                <th className="pm-table-blue">Deadline</th>
                <th className="pm-table-red">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {projects.slice(0, 6).map((project, index) => (
                <tr key={index}>
                  <td>{project.name}</td>
                  <td className="pm-table-blue">{project.end_date || 'N/A'}</td>
                  <td className="pm-table-red">{project.status}</td>
                </tr>
              ))}
              {projects.length === 0 && (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center' }}>Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
