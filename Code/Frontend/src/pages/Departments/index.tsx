import React, { useState, useEffect } from 'react';
import { Typography, Input, Row, Col, Card, Space, Tag, Button, Tooltip, Modal, Form, message, Spin, List, Avatar } from 'antd';
import { 
  SearchOutlined, 
  TeamOutlined, 
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import DepartmentService from '../../services/departmentService';

const { Title, Text } = Typography;
const { confirm } = Modal;

interface Department {
  id: number;
  name: string;
  description: string;
  created_at: string;
  users?: number;
}

export default function DepartmentsPage() {
  const { t } = useTranslation();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  
  // Modals state
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedDept, setSelectedDept] = useState<Department | null>(null);
  
  const [members, setMembers] = useState<any[]>([]);
  const [membersLoading, setMembersLoading] = useState(false);
  
  const [form] = Form.useForm();

  const fetchDepartments = async (search: string = '') => {
    setLoading(true);
    try {
      const response = await DepartmentService.getAll(search);
      if (response.success) {
        setDepartments(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách phòng ban');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchText(value);
    fetchDepartments(value);
  };

  // --- Actions ---
  const handleCreate = () => {
    setModalMode('create');
    setSelectedDept(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (dept: Department) => {
    setModalMode('edit');
    setSelectedDept(dept);
    form.setFieldsValue({
      name: dept.name,
      description: dept.description
    });
    setIsModalVisible(true);
  };

  const handleView = async (dept: Department) => {
    setModalMode('view');
    setSelectedDept(dept);
    setIsModalVisible(true);
    
    setMembersLoading(true);
    try {
      const response = await DepartmentService.getMembers(dept.id);
      if (response.success) {
        setMembers(response.data);
      }
    } catch (error: any) {
      message.error(error.message || 'Lỗi khi tải danh sách thành viên');
    } finally {
      setMembersLoading(false);
    }
  };

  const handleDelete = (dept: Department) => {
    confirm({
      title: 'Xóa phòng ban',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa phòng ban "${dept.name}" không? Thao tác này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await DepartmentService.delete(dept.id);
          message.success('Xóa phòng ban thành công');
          fetchDepartments(searchText);
        } catch (error: any) {
          message.error(error.message || 'Lỗi khi xóa phòng ban');
        }
      }
    });
  };

  const handleModalSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      if (modalMode === 'create') {
        await DepartmentService.create(values);
        message.success('Tạo phòng ban thành công');
      } else if (modalMode === 'edit' && selectedDept) {
        await DepartmentService.update(selectedDept.id, values);
        message.success('Cập nhật phòng ban thành công');
      }
      
      setIsModalVisible(false);
      fetchDepartments(searchText);
    } catch (error: any) {
      if (error.errorFields) {
        return; // Form validation error
      }
      message.error(error.message || 'Đã có lỗi xảy ra');
    }
  };

  // Hàm sinh màu ngẫu nhiên nhưng ổn định dựa trên ID
  const getDeptColor = (id: number) => {
    const colors = ['#1677ff', '#52c41a', '#ff4d4f', '#fadb14', '#722ed1', '#13c2c2'];
    return colors[id % colors.length];
  };

  return (
    <div style={{ backgroundColor: '#fff', minHeight: '100%', padding: '24px 32px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ marginTop: 0, marginBottom: 0, fontWeight: 700 }}>
          {t('page.departments.title')}
        </Title>
        <Button type="primary" icon={<PlusOutlined />} style={{ backgroundColor: '#2563EB', borderRadius: 4 }} onClick={handleCreate}>
          {t('page.departments.create')}
        </Button>
      </div>
      
      <div style={{ marginBottom: 32 }}>
        <Input 
          placeholder="Tìm kiếm phòng ban..." 
          size="large"
          value={searchText}
          onChange={handleSearch}
          style={{ width: '100%', maxWidth: 600, borderRadius: 4 }}
          suffix={<SearchOutlined style={{ color: '#8c8c8c', fontSize: 18 }} />}
        />
      </div>

      <Spin spinning={loading}>
        <Row gutter={[24, 24]}>
          {departments.map(dept => {
            const color = getDeptColor(dept.id);
            return (
              <Col xs={24} sm={12} lg={8} key={dept.id}>
                <Card
                  bordered={false}
                  style={{
                    borderRadius: 0,
                    borderLeft: `4px solid ${color}`,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                    backgroundColor: '#fafafa',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column'
                  }}
                  bodyStyle={{ padding: '16px 24px', flex: 1 }}
                  actions={[
                    <Tooltip title="Xem" key="view"><Button type="text" icon={<EyeOutlined />} style={{ color: '#1677ff' }} onClick={() => handleView(dept)}>Xem</Button></Tooltip>,
                    <Tooltip title="Sửa" key="edit"><Button type="text" icon={<EditOutlined />} style={{ color: '#faad14' }} onClick={() => handleEdit(dept)}>Sửa</Button></Tooltip>,
                    <Tooltip title="Xóa" key="delete"><Button type="text" icon={<DeleteOutlined />} danger onClick={() => handleDelete(dept)}>Xóa</Button></Tooltip>,
                  ]}
                >
                  <Title level={4} style={{ color: color, marginTop: 0, marginBottom: 16 }}>
                    {dept.name}
                  </Title>
                  
                  {/* Stats */}
                  <div style={{ display: 'flex', gap: 24 }}>
                    <Space size={4}>
                      <TeamOutlined style={{ color: '#52c41a', fontSize: 16 }} />
                      <Text style={{ color: '#52c41a', fontWeight: 600 }}>{dept.users || 0}</Text>
                    </Space>
                  </div>
                </Card>
              </Col>
            );
          })}
        </Row>
        {!loading && departments.length === 0 && (
           <div style={{ textAlign: 'center', padding: '40px 0', color: '#888' }}>
              Không có dữ liệu phòng ban.
           </div>
        )}
      </Spin>

      <Modal
        title={modalMode === 'create' ? 'Tạo phòng ban mới' : (modalMode === 'edit' ? 'Sửa phòng ban' : 'Thông tin phòng ban')}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        width={modalMode === 'view' ? 600 : 520}
        footer={modalMode === 'view' ? [
          <Button key="close" onClick={() => setIsModalVisible(false)}>Đóng</Button>
        ] : [
          <Button key="cancel" onClick={() => setIsModalVisible(false)}>Hủy</Button>,
          <Button key="submit" type="primary" onClick={handleModalSubmit}>
            {modalMode === 'create' ? 'Tạo mới' : 'Lưu thay đổi'}
          </Button>
        ]}
      >
        {modalMode === 'view' ? (
          <div>
            <div style={{ marginBottom: 20 }}>
              <p><strong>Tên phòng ban:</strong> {selectedDept?.name}</p>
              <p><strong>Mô tả:</strong> {selectedDept?.description || 'Không có mô tả'}</p>
              <p><strong>Ngày tạo:</strong> {selectedDept ? new Date(selectedDept.created_at).toLocaleDateString('vi-VN') : ''}</p>
            </div>
            
            <Title level={5}>Danh sách thành viên ({members.length})</Title>
            <List
              loading={membersLoading}
              itemLayout="horizontal"
              dataSource={members}
              style={{ maxHeight: 300, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 8 }}
              renderItem={user => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} src={user.avatar} />}
                    title={user.full_name}
                    description={`Email: ${user.email} - Vai trò: ${user.role}`}
                  />
                </List.Item>
              )}
            />
          </div>
        ) : (
          <Form form={form} layout="vertical">
            <Form.Item
              name="name"
              label="Tên phòng ban"
              rules={[{ required: true, message: 'Vui lòng nhập tên phòng ban' }]}
            >
              <Input placeholder="Nhập tên phòng ban..." />
            </Form.Item>
            
            <Form.Item
              name="description"
              label="Mô tả"
            >
              <Input.TextArea rows={4} placeholder="Nhập mô tả (không bắt buộc)..." />
            </Form.Item>
          </Form>
        )}
      </Modal>
    </div>
  );
}
