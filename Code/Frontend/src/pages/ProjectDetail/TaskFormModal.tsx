import { Modal, Form, Input, Select, DatePicker, Button, Space, Avatar } from 'antd';
import { LeftOutlined, UserOutlined } from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

interface TaskFormModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (values: any) => void;
  initialValues?: any;
  projectMembers?: any[];
}

export default function TaskFormModal({ visible, onCancel, onOk, initialValues, projectMembers = [] }: TaskFormModalProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      open={visible}
      closeIcon={null}
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
        initialValues={initialValues || { status: 'TODO' }}
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
            {projectMembers.filter(m => m.is_active).map(member => (
              <Option key={member.user_id} value={member.user_id}>
                <Space><Avatar size="small" icon={<UserOutlined />} /> {member.user?.full_name || member.user?.email}</Space>
              </Option>
            ))}
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
