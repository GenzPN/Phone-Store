import React, { useState } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker } from 'antd';
import dayjs from 'dayjs';

const Users = () => {
  const [dataSource, setDataSource] = useState([
    { id: 1, name: 'Nguyễn Văn A', product: 'iPhone 14 Pro Max', warranty: '2024-12-31' },
    { id: 2, name: 'Trần Thị B', product: 'Samsung Galaxy Z Fold 6', warranty: '2025-11-15' },
    { id: 3, name: 'Lê Văn C', product: 'Xiaomi 13', warranty: '2024-10-05' },
    // Add more initial data here if needed
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const handleAdd = (values) => {
    const newRecord = {
      id: dataSource.length + 1,
      name: values.name,
      product: values.product,
      warranty: values.warranty.format('YYYY-MM-DD'),
    };
    setDataSource([...dataSource, newRecord]);
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleEdit = (record) => {
    form.setFieldsValue({
      name: record.name,
      product: record.product,
      warranty: dayjs(record.warranty), // Use moment to set the date
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setDataSource(dataSource.filter(item => item.id !== id));
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên khách',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Sản Phẩm',
      dataIndex: 'product',
      key: 'product',
    },
    {
      title: 'Thời hạn bảo hành',
      dataIndex: 'warranty',
      key: 'warranty',
      render: (date) => dayjs(date).format('DD/MM/YYYY'),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (text, record) => (
        <span>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Xóa</Button>
        </span>
      ),
    },
  ];

  return (
    <>
      <Button type="primary" onClick={() => setIsModalVisible(true)} style={{ marginBottom: 16 }}>
        Thêm đơn hàng
      </Button>
      <Table dataSource={dataSource} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} />
      <Modal
        title="Thêm đơn hàng"
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAdd}>
          <Form.Item name="name" label="Tên khách" rules={[{ required: true, message: 'Vui lòng nhập tên khách!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="product" label="Sản Phẩm" rules={[{ required: true, message: 'Vui lòng chọn sản phẩm!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="warranty" label="Thời hạn bảo hành" rules={[{ required: true, message: 'Vui lòng chọn thời hạn bảo hành!' }]}>
            <DatePicker format="DD/MM/YYYY" defaultValue={dayjs()} />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">
              Thêm
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default Users;
  