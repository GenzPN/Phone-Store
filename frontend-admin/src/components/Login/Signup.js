import React from 'react';
import { Form, Input, Button, message } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Signup = () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    const { password, confirmPassword } = values;
    if (password === confirmPassword) {
      console.log('Signup successful');
      message.success('Đăng ký thành công');
      // You can add your signup logic here, e.g., sending data to your server
      navigate('/login'); // Redirect to login page after signup
    } else {
      message.error('Mật khẩu không khớp');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-image"></div>
        <div className="auth-form-container">
          <Form
            name="normal_signup"
            className="auth-form"
            initialValues={{ remember: true }}
            onFinish={onFinish}
          >
            <h2 className="auth-title">Đăng Ký</h2>
            <Form.Item
              name="username"
              rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
            >
              <Input prefix={<UserOutlined className="site-form-item-icon" />} placeholder="Tên đăng nhập" />
            </Form.Item>
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Vui lòng nhập email!' },
                { type: 'email', message: 'Email không hợp lệ!' }
              ]}
            >
              <Input prefix={<MailOutlined className="site-form-item-icon" />} placeholder="Email" />
            </Form.Item>
            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
            >
              <Input.Password
                prefix={<LockOutlined className="site-form-item-icon" />}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" className="auth-form-button">
                Đăng Ký
              </Button>
            </Form.Item>
            <div className="auth-link">
              Hoặc <Link to="/login">Đăng nhập ngay!</Link>
            </div>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Signup;
