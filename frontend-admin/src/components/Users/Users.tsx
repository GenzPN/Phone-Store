import React, { useState, useEffect } from 'react';
import { Table, Button, Space, message, Modal, Form, Input, Select, Popconfirm } from 'antd';
import axios from 'axios';
import { getToken, getCookie } from '../../utils/tokenStorage';

const { Option } = Select;

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  gender: string;
  image: string;
  isAdmin: boolean;
}

const Users: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [changePasswordModalVisible, setChangePasswordModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form] = Form.useForm();
  const [createForm] = Form.useForm();
  const [changePasswordForm] = Form.useForm();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = getToken() || getCookie('accessToken');
      const response = await axios.get('http://localhost:5000/api/admin/users/all', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('Lỗi khi lấy danh sách người dùng:', error);
      message.error('Không thể lấy danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: User) => {
    setEditingUser(record);
    form.setFieldsValue(record);
    setEditModalVisible(true);
  };

  const handleEditModalOk = async () => {
    try {
      const values = await form.validateFields();
      const token = getToken() || getCookie('accessToken');
      await axios.put(`http://localhost:5000/api/admin/users/${editingUser?.id}`, values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Thông tin người dùng đã được cập nhật thành công');
      setEditModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi cập nhật thông tin người dùng:', error);
      message.error('Không thể cập nhật thông tin người dùng');
    }
  };

  const handleChangePassword = (user: User) => {
    setEditingUser(user);
    setChangePasswordModalVisible(true);
  };

  const handleChangePasswordModalOk = async () => {
    try {
      const values = await changePasswordForm.validateFields();
      const token = getToken() || getCookie('accessToken');
      await axios.put(`http://localhost:5000/api/admin/users/${editingUser?.id}/change-password`, 
        { newPassword: values.newPassword },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      message.success('Mật khẩu đã được thay đổi thành công');
      setChangePasswordModalVisible(false);
      changePasswordForm.resetFields();
    } catch (error) {
      console.error('Lỗi khi thay đổi mật khẩu:', error);
      message.error('Không thể thay đổi mật khẩu');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const token = getToken() || getCookie('accessToken');
      await axios.delete(`http://localhost:5000/api/admin/users/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Người dùng đã được xóa thành công');
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi xóa người dùng:', error);
      message.error('Không thể xóa người dùng');
    }
  };

  const handleCreate = () => {
    createForm.resetFields();
    setCreateModalVisible(true);
  };

  const handleCreateModalOk = async () => {
    try {
      const values = await createForm.validateFields();
      const token = getToken() || getCookie('accessToken');
      await axios.post('http://localhost:5000/api/admin/users', values, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      message.success('Người dùng mới đã được tạo thành công');
      setCreateModalVisible(false);
      fetchUsers();
    } catch (error) {
      console.error('Lỗi khi tạo người dùng mới:', error);
      message.error('Không thể tạo người dùng mới');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: 'Tên đăng nhập',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Họ và tên',
      dataIndex: 'fullName',
      key: 'fullName',
    },
    {
      title: 'Giới tính',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: 'Ảnh',
      dataIndex: 'image',
      key: 'image',
      render: (text: string) => (
        <img src={text} alt="User" style={{ width: 50, height: 50, objectFit: 'cover' }} />
      ),
    },
    {
      title: 'Quản trị viên',
      dataIndex: 'isAdmin',
      key: 'isAdmin',
      render: (isAdmin: boolean) => (isAdmin ? 'Có' : 'Không'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: User) => (
        <Space size="middle">
          <Button onClick={() => handleEdit(record)}>Sửa</Button>
          <Button onClick={() => handleChangePassword(record)}>Đổi mật khẩu</Button>
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa người dùng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button danger>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h1>Quản lý người dùng</h1>
      <Button onClick={handleCreate} type="primary" style={{ marginBottom: 16 }}>
        Tạo người dùng mới
      </Button>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} />
      <Modal
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        onOk={handleEditModalOk}
        title="Chỉnh sửa thông tin người dùng"
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="image" label="Ảnh">
            <Input />
          </Form.Item>
          <Form.Item name="isAdmin" label="Quản trị viên" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        onOk={handleCreateModalOk}
        title="Tạo người dùng mới"
      >
        <Form form={createForm} layout="vertical">
          <Form.Item name="username" label="Tên đăng nhập" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="password" label="Mật khẩu" rules={[{ required: true }]}>
            <Input.Password />
          </Form.Item>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="gender" label="Giới tính" rules={[{ required: true }]}>
            <Select>
              <Option value="male">Nam</Option>
              <Option value="female">Nữ</Option>
              <Option value="other">Khác</Option>
            </Select>
          </Form.Item>
          <Form.Item name="image" label="Ảnh">
            <Input />
          </Form.Item>
          <Form.Item name="isAdmin" label="Quản trị viên" rules={[{ required: true }]}>
            <Select>
              <Option value={true}>Có</Option>
              <Option value={false}>Không</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
      <Modal
        open={changePasswordModalVisible}
        onCancel={() => {
          setChangePasswordModalVisible(false);
          changePasswordForm.resetFields();
        }}
        onOk={handleChangePasswordModalOk}
        title="Đổi mật khẩu"
      >
        <Form form={changePasswordForm} layout="vertical">
          <Form.Item
            name="newPassword"
            label="Mật khẩu mới"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
            ]}
          >
            <Input.Password />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default Users;