import { SearchOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import '../Dashboard/PMStyles.css';

export default function PMProjectsPage() {
  const projects = [
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno',
    'Abcdefg Mno'
  ];

  return (
    <div className="pm-dashboard-container">
      <div className="pm-header-with-btn">
        <h2 className="pm-section-title" style={{ marginBottom: 0 }}>Danh sách dự án</h2>
        <Link to="/projects/create" className="pm-add-btn">Thêm dự án</Link>
      </div>
      
      <div className="pm-search-container">
        <input 
          type="text" 
          className="pm-search-input" 
          placeholder="Tìm kiếm dự án..." 
        />
        <div className="pm-search-icon">
          <SearchOutlined />
        </div>
      </div>
      
      <ul className="pm-project-list">
        {projects.map((project, index) => (
          <li className="pm-project-item" key={index}>
            {project}
          </li>
        ))}
      </ul>
    </div>
  );
}
