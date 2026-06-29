import { Link } from 'react-router-dom';
import '../Dashboard/PMStyles.css';

export default function PMCreateProjectPage() {
  return (
    <div className="pm-dashboard-container">
      <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: '40px' }}>
        <Link to="/projects" className="pm-back-link" style={{ position: 'absolute', left: 0 }}>{'<'} Back</Link>
        <h2 className="pm-section-title" style={{ margin: 0 }}>Tạo dự án mới</h2>
      </div>

      <div style={{ width: '100%' }}>
        <div className="pm-form-group">
          <label className="pm-form-label">Tên dự án</label>
          <input 
            type="text" 
            className="pm-form-input" 
            defaultValue="Abcdefg Mno"
          />
        </div>

        <div className="pm-form-group">
          <label className="pm-form-label">Mô tả</label>
          <textarea 
            className="pm-form-textarea" 
            defaultValue="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Morbi ullamcorper molestie nunc, non venenatis arcu commodo non. Praesent non eros fermentum, sollicitudin ligula a, efficitur magna. Aliquam dictum dolor id sapien pharetra interdum."
          ></textarea>
        </div>

        <div className="pm-submit-btn-container">
          <button className="pm-submit-btn">Tạo dự án</button>
        </div>
      </div>
    </div>
  );
}
