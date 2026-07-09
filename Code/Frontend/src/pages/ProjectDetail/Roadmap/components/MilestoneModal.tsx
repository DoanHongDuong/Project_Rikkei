import React, { useEffect } from 'react';
import { Modal, Form, Input, DatePicker, Select } from 'antd';
import dayjs from 'dayjs';
import type { Milestone } from '../types/roadmap';

const { Option } = Select;

interface MilestoneModalProps {
  open: boolean;
  onCancel: () => void;
  onSubmit: (values: any) => void;
  initialValues?: Milestone | null;
  projectStartDate?: string;
  projectEndDate?: string;
}

const MilestoneModal: React.FC<MilestoneModalProps> = ({ open, onCancel, onSubmit, initialValues, projectStartDate, projectEndDate }) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (initialValues) {
        form.setFieldsValue({
          title: initialValues.title,
          start_date: dayjs(initialValues.start_date),
          end_date: dayjs(initialValues.end_date),
          status: initialValues.status,
          sort_order: initialValues.sort_order,
        });
      } else {
        form.resetFields();
      }
    }
  }, [open, initialValues, form]);

  const handleOk = () => {
    form.validateFields().then((values) => {
      onSubmit({
        ...values,
        start_date: values.start_date.format('YYYY-MM-DD'),
        end_date: values.end_date.format('YYYY-MM-DD'),
      });
    });
  };

  return (
    <Modal
      title={initialValues ? 'Cập nhật mốc thời gian' : 'Thêm mốc thời gian mới'}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      okText="Lưu"
      cancelText="Hủy"
    >
      <Form form={form} layout="vertical" initialValues={{ status: 'TODO', sort_order: 0 }}>
        <Form.Item
          name="title"
          label="Tên mốc"
          rules={[{ required: true, message: 'Vui lòng nhập tên mốc thời gian!' }]}
        >
          <Input placeholder="Nhập tên mốc (VD: Phase 1: Planning)" />
        </Form.Item>

        <Form.Item
          name="start_date"
          label="Ngày bắt đầu"
          rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY" 
            disabledDate={(current) => {
              if (!current) return false;
              let isDisabled = false;
              if (projectStartDate) {
                isDisabled = isDisabled || current < dayjs(projectStartDate).startOf('day');
              }
              if (projectEndDate) {
                isDisabled = isDisabled || current > dayjs(projectEndDate).endOf('day');
              }
              return isDisabled;
            }}
          />
        </Form.Item>

        <Form.Item
          name="end_date"
          label="Ngày kết thúc"
          dependencies={['start_date']}
          rules={[
            { required: true, message: 'Vui lòng chọn ngày kết thúc!' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || !getFieldValue('start_date')) {
                  return Promise.resolve();
                }
                if (value.isBefore(getFieldValue('start_date'))) {
                  return Promise.reject(new Error('Ngày kết thúc không được trước ngày bắt đầu!'));
                }
                return Promise.resolve();
              },
            }),
          ]}
        >
          <DatePicker 
            style={{ width: '100%' }} 
            format="DD/MM/YYYY" 
            disabledDate={(current) => {
              if (!current) return false;
              let isDisabled = false;
              if (projectStartDate) {
                isDisabled = isDisabled || current < dayjs(projectStartDate).startOf('day');
              }
              if (projectEndDate) {
                isDisabled = isDisabled || current > dayjs(projectEndDate).endOf('day');
              }
              return isDisabled;
            }}
          />
        </Form.Item>

        <Form.Item
          name="status"
          label="Trạng thái"
          rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
        >
          <Select>
            <Option value="TODO">Cần làm (TODO)</Option>
            <Option value="IN_PROGRESS">Đang tiến hành (IN_PROGRESS)</Option>
            <Option value="DONE">Hoàn thành (DONE)</Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="sort_order"
          label="Thứ tự hiển thị"
          rules={[{ required: true, message: 'Vui lòng nhập thứ tự!' }]}
        >
          <Input type="number" min={0} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default MilestoneModal;
