import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

export default function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div style={{ backgroundColor: '#fff', borderRadius: 12, padding: '48px 24px', textAlign: 'center', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <span style={{ color: '#6B7280', fontSize: '16px' }}>
            No data.
          </span>
        }
      >
      </Empty>
    </div>
  );
}
