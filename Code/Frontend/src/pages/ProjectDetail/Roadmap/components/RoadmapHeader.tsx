import { Input, Button, Space, Typography, Dropdown, DatePicker } from 'antd';
import type { MenuProps } from 'antd';
import { SearchOutlined, PlusOutlined, MoreOutlined, ExportOutlined, ShareAltOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { RangePicker } = DatePicker;

interface RoadmapHeaderProps {
  onSearch: (value: string) => void;
  onAddMilestone: () => void;
}

export default function RoadmapHeader({ onSearch, onAddMilestone }: RoadmapHeaderProps) {
  const moreMenu: MenuProps = {
    items: [
      { key: '1', label: 'Export to CSV', icon: <ExportOutlined /> },
      { key: '2', label: 'Share Roadmap', icon: <ShareAltOutlined /> },
    ]
  };

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
        <RangePicker style={{ borderRadius: 6 }} />
        <Button type="primary" icon={<PlusOutlined />} onClick={onAddMilestone} style={{ borderRadius: 6 }}>
          Add Milestone
        </Button>
        <Dropdown menu={moreMenu} placement="bottomRight">
          <Button icon={<MoreOutlined />} style={{ borderRadius: 6 }} />
        </Dropdown>
      </Space>
    </div>
  );
}
