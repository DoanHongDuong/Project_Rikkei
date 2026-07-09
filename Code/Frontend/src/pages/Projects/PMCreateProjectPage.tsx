import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { message } from 'antd';
import ProjectService from '../../services/projectService';
import '../Dashboard/PMStyles.css';

export default function PMCreateProjectPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    start_date: '',
    end_date: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.start_date || !formData.end_date) {
      message.error('Vui lòng điền tên dự án và ngày bắt đầu, kết thúc!');
      return;
    }

    try {
      setLoading(true);
      await ProjectService.createProject({
        ...formData,
        status: 'ACTIVE'
      });
      message.success('Tạo dự án thành công!');
      navigate('/projects');
    } catch (error: any) {
      message.error(error.message || 'Có lỗi xảy ra khi tạo dự án');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pm-dashboard-container">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>
        <Link to="/projects" className="pm-back-link" style={{ position: 'absolute', left: 0 }}>{'<'} Back</Link>
        <h2 className="pm-section-title" style={{ margin: 0 }}>Tạo dự án mới</h2>
      </div>

      <form onSubmit={handleSubmit} style={{ width: '100%' }}>
        <div className="pm-form-group">
          <label className="pm-form-label">Tên dự án *</label>
          <input 
            type="text" 
            name="name"
            className="pm-form-input" 
            placeholder="Nhập tên dự án..."
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="pm-form-group" style={{ display: 'flex', gap: '16px' }}>
          <div style={{ flex: 1 }}>
            <label className="pm-form-label">Ngày bắt đầu *</label>
            <input 
              type="date" 
              name="start_date"
              className="pm-form-input" 
              value={formData.start_date}
              onChange={handleChange}
              required
            />
          </div>
          <div style={{ flex: 1 }}>
            <label className="pm-form-label">Ngày kết thúc *</label>
            <input 
              type="date" 
              name="end_date"
              className="pm-form-input" 
              value={formData.end_date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="pm-form-group">
          <label className="pm-form-label">Mô tả</label>
          <textarea 
            name="description"
            className="pm-form-textarea" 
            placeholder="Nhập mô tả..."
            value={formData.description}
            onChange={handleChange}
          ></textarea>
        </div>

        <div className="pm-submit-btn-container">
          <button type="submit" className="pm-submit-btn" disabled={loading}>
            {loading ? 'Đang tạo...' : 'Tạo dự án'}
          </button>
        </div>
      </form>
    </div>
  );
}
