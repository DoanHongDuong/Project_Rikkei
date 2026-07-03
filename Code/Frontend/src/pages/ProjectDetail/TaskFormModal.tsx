import { Modal, Form, Input, Select, DatePicker, Button, Space, Avatar } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';
import { useEffect } from 'react';

const { Option } = Select;
const { TextArea } = Input;

interface TaskFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues?: any;
  projectMembers?: any[];
  milestones?: any[];
}

export default function TaskFormModal({ visible, onCancel, onOk, initialValues, projectMembers = [], milestones = [] }: TaskFormModalProps) {
  const [form] = Form.useForm();

  // Ant Design Form chỉ đọc initialValues 1 lần khi mount.
  // Khi mở form sửa task mới, cần gọi setFieldsValue để điền lại dữ liệu.
  useEffect(() => {
    if (visible) {
      form.setFieldsValue(initialValues || { status: 'TODO', priority: 'MEDIUM' });
    }
  }, [visible, initialValues]);

  return (
    <Modal
      open={visible}
      maskClosable={false}
      width={600}
      title={
        <div style={{ display: 'flex', alignItems: 'center', width: '100%', marginBottom: 16 }}>
          <Button
            type="text"
            icon={<LeftOutlined />}
            onClick={() => {
              form.resetFields();
              onCancel();
            }}
            style={{ fontSize: 16, fontWeight: 500, paddingLeft: 0 }}
          >
            Trở về <span style={{ marginLeft: 8 }}>{initialValues?.id ? "Sửa công việc" : "Tạo công việc"}</span>
          </Button>
        </div>
      }
      onOk={() => {
        form
          .validateFields()
          .then(values => {
            form.resetFields();
            onOk(values);
          })
          .catch(info => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form
        form={form}
        layout="vertical"
        name="task_form"
        initialValues={initialValues || { status: 'TODO', priority: 'MEDIUM' }}
      >
        <Form.Item
          name="title"
          label="Tên công việc"
          rules={[{ required: true, message: 'Vui lòng nhập tên công việc!' }]}
        >
          <Input placeholder="Nhập tên công việc" />
        </Form.Item>

        <Form.Item
          name="description"
          label="Mô tả"
        >
          <TextArea rows={4} placeholder="Nhập mô tả chi tiết..." />
        </Form.Item>

        <Form.Item
          name="assignee_id"
          label="Người thực hiện"
        >
          <Select placeholder="Chọn người thực hiện" allowClear>
            {projectMembers.filter(m => m.is_active && m.user?.status !== 'DISABLED').map(member => (
              <Option key={member.user_id} value={member.user_id}>
                <Space><Avatar size="small" icon={<UserOutlined />} /> {member.user?.full_name || member.user?.email}</Space>
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="roadmap_item_id"
          label="Thuộc milestone"
        >
          <Select placeholder="Chọn milestone (không bắt buộc)" allowClear>
            {milestones.map(milestone => (
              <Option key={milestone.id} value={milestone.id}>
                {milestone.title}
              </Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item
          name="priority"
          label="Mức độ ưu tiên"
        >
          <Select placeholder="Chọn mức độ ưu tiên" allowClear>
            <Option value="LOW">Thấp</Option>
            <Option value="MEDIUM">Trung bình</Option>
            <Option value="HIGH">Cao</Option>
            <Option value="URGENT">Khẩn cấp</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          hidden
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="deadline"
          label="Hạn chót"
        >
          <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
        </Form.Item>
      </Form>
    </Modal>
  );
}
