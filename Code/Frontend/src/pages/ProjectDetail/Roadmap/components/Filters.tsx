import { Space, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

export default function Filters() {
  return (
    <Space style={{ marginBottom: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
        <FilterOutlined style={{ color: '#6B7280' }} />
        <span style={{ color: '#374151', fontWeight: 500 }}>Filter by:</span>
      </div>
      
      <Select placeholder="Status" style={{ width: 120, borderRadius: 6 }} allowClear>
        <Option value="Completed">Completed</Option>
        <Option value="In Progress">In Progress</Option>
        <Option value="Planning">Planning</Option>
        <Option value="Delayed">Delayed</Option>
      </Select>
      
      <Select placeholder="Owner" style={{ width: 140, borderRadius: 6 }} allowClear>
        <Option value="John Doe">John Doe</Option>
        <Option value="Sarah Connor">Sarah Connor</Option>
        <Option value="Bruce Wayne">Bruce Wayne</Option>
      </Select>
      
      <Select placeholder="Priority" style={{ width: 120, borderRadius: 6 }} allowClear>
        <Option value="High">High</Option>
        <Option value="Medium">Medium</Option>
        <Option value="Low">Low</Option>
      </Select>
      
      <Select placeholder="Quarter" style={{ width: 120, borderRadius: 6 }} allowClear>
        <Option value="Q1">Q1</Option>
        <Option value="Q2">Q2</Option>
        <Option value="Q3">Q3</Option>
        <Option value="Q4">Q4</Option>
      </Select>
      
      <Select placeholder="Year" style={{ width: 100, borderRadius: 6 }} allowClear>
        <Option value="2025">2025</Option>
        <Option value="2026">2026</Option>
      </Select>
    </Space>
  );
}
