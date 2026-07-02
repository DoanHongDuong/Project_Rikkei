import { Input, Button, Space, Typography, Dropdown, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined, MoreOutlined, ExportOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface RoadmapHeaderProps {
  onSearch: (value: string) => void;
  onAddMilestone: () => void;
  isMember?: boolean;
  onDateChange?: (dates: any) => void;
}

export default function RoadmapHeader({ onSearch, onAddMilestone, isMember, onDateChange }: RoadmapHeaderProps) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
      <Title level={3} style={{ margin: 0, fontWeight: 700 }}>Roadmap</Title>

      <Space wrap>
        <Input
          placeholder="Search milestones..."
          prefix={<SearchOutlined style={{ color: '#9CA3AF' }} />}
          style={{ width: 250, borderRadius: 6 }}
          onChange={(e) => onSearch(e.target.value)}
          allowClear
        />
        <RangePicker style={{ borderRadius: 6 }} onChange={onDateChange} />
        {!isMember && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAddMilestone} style={{ borderRadius: 6 }}>
            Add Milestone
          </Button>
        )}
      </Space>
    </div>
  );
}
