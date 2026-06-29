import './PMStyles.css';

export default function PMDashboardPage() {
  const departments = [
    { name: 'Design', closed: 55, remaining: 45 },
    { name: 'Developer', closed: 45, remaining: 45 },
    { name: 'Marketting', closed: 45, remaining: 45 }, // Spelling from the image
    { name: 'HR', closed: 45, remaining: 45 },
    { name: 'QA', closed: 45, remaining: 45 },
    { name: 'Sales', closed: 45, remaining: 45 },
  ];

  // Mock data for the stacked bar chart (values are percentages)
  const taskStats = [
    { label: 'PJ 1', completed: 60, inProgress: 20, overdue: 10 },
    { label: 'PJ 2', completed: 40, inProgress: 15, overdue: 40 },
    { label: 'PJ 3', completed: 50, inProgress: 25, overdue: 5 },
    { label: 'PJ 4', completed: 20, inProgress: 60, overdue: 10 },
    { label: 'PJ 5', completed: 75, inProgress: 5, overdue: 15 },
  ];

  return (
    <div className="pm-dashboard-container">
      <div style={{ display: 'flex', gap: '40px' }}>
        {/* Left Column: Projects Overview & Chart */}
        <div style={{ flex: 1 }}>
          <h2 className="pm-section-title">Tổng quan dự án</h2>
          
          <div className="pm-summary-cards">
            <div className="pm-card pm-card-blue">
              <div className="pm-card-title">Đang chạy</div>
              <div className="pm-card-value">15</div>
              <div className="pm-card-subtitle">Dự án</div>
            </div>
            
            <div className="pm-card pm-card-red">
              <div className="pm-card-title">Rủi ro</div>
              <div className="pm-card-value">15</div>
              <div className="pm-card-subtitle">Cần xử lý</div>
            </div>
            
            <div className="pm-card pm-card-green">
              <div className="pm-card-title">Hoàn thành</div>
              <div className="pm-card-value">15</div>
              <div className="pm-card-subtitle">Dự án</div>
            </div>
          </div>

          <h3 className="pm-section-title" style={{ fontSize: '18px', marginTop: '30px' }}>Thống kê số lượng task</h3>
          
          <div className="pm-chart-container">
            {taskStats.map((stat, index) => (
              <div className="pm-chart-row" key={index}>
                <div className="pm-chart-label">{stat.label}</div>
                <div className="pm-chart-bar-bg">
                  <div className="pm-chart-segment-green" style={{ width: `${stat.completed}%` }}></div>
                  <div className="pm-chart-segment-yellow" style={{ width: `${stat.inProgress}%` }}></div>
                  <div className="pm-chart-segment-red" style={{ width: `${stat.overdue}%` }}></div>
                </div>
              </div>
            ))}
            
            <div className="pm-chart-legend">
              <div className="pm-legend-item">
                <div className="pm-legend-color pm-chart-segment-green"></div>
                Đã hoàn thành
              </div>
              <div className="pm-legend-item">
                <div className="pm-legend-color pm-chart-segment-yellow"></div>
                Đang làm
              </div>
              <div className="pm-legend-item">
                <div className="pm-legend-color pm-chart-segment-red"></div>
                Quá hạn
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Department Workload */}
        <div style={{ width: '400px' }}>
          <h2 className="pm-section-title">Khối lượng công việc theo phòng ban</h2>
          
          <table className="pm-table">
            <thead>
              <tr>
                <th>Phòng ban</th>
                <th className="pm-table-blue">Đã đóng</th>
                <th className="pm-table-red">Còn lại</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((dept, index) => (
                <tr key={index}>
                  <td>{dept.name}</td>
                  <td className="pm-table-blue">{dept.closed}</td>
                  <td className="pm-table-red">{dept.remaining}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
