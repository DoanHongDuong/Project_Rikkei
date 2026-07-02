import { Space, Select } from 'antd';
import { FilterOutlined } from '@ant-design/icons';

const { Option } = Select;

export interface FilterValues {
  status?: string;
  quarter?: string;
  year?: string;
}

export default function Filters({
  filters,
  onChange
}: {
  filters: FilterValues;
  onChange: (newFilters: FilterValues) => void;
}) {
  const handleChange = (key: keyof FilterValues, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  return (
    <Space style={{ marginBottom: 24, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 16 }}>
        <FilterOutlined style={{ color: '#6B7280' }} />
        <span style={{ color: '#374151', fontWeight: 500 }}>Filter by:</span>
      </div>
      
      <Select 
        placeholder="Status" 
        style={{ width: 120, borderRadius: 6 }} 
        allowClear
        value={filters.status}
        onChange={(val) => handleChange('status', val)}
      >
        <Option value="DONE">Completed</Option>
        <Option value="IN_PROGRESS">In Progress</Option>
        <Option value="TODO">Planning</Option>
      </Select>
      
      <Select 
        placeholder="Quarter" 
        style={{ width: 120, borderRadius: 6 }} 
        allowClear
        value={filters.quarter}
        onChange={(val) => handleChange('quarter', val)}
      >
        <Option value="Q1">Q1</Option>
        <Option value="Q2">Q2</Option>
        <Option value="Q3">Q3</Option>
        <Option value="Q4">Q4</Option>
      </Select>
      
      <Select 
        placeholder="Year" 
        style={{ width: 100, borderRadius: 6 }} 
        allowClear
        value={filters.year}
        onChange={(val) => handleChange('year', val)}
      >
        <Option value="2025">2025</Option>
        <Option value="2026">2026</Option>
      </Select>
    </Space>
  );
}
