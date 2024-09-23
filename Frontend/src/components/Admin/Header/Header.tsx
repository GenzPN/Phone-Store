import React from 'react';
import { Layout, Typography, Avatar, Dropdown, Button, Row, Col } from 'antd';
import { UserOutlined, DownOutlined, MenuOutlined, ShoppingCartOutlined, ProfileOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import './Header.css'; // Make sure to create this CSS file

const { Header: AntHeader } = Layout;
const { Text } = Typography;

interface HeaderAdminProps {
  onToggleSidebar: () => void;
}

const HeaderAdmin: React.FC<HeaderAdminProps> = ({ onToggleSidebar }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    navigate('/login');
  };

  const menuItems = [
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout
    }
  ];

  return (
    <AntHeader className="header">
      <Row justify="space-between" align="middle">
        <Col>
          <div className="header-left">
            <Button type="text" icon={<MenuOutlined />} onClick={onToggleSidebar} className="menu-button" />
            <img src="http://localhost:3000/logo192.png" alt="Logo" className="logo" />
          </div>
        </Col>
        <Col>
          <div className="header-right">
            <Button type="text" icon={<ProfileOutlined />} onClick={() => navigate('/admin/products')} />
            <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => navigate('/admin/orders')} />
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" className="ant-dropdown-link" onClick={e => e.preventDefault()}>
                <Avatar icon={<UserOutlined />} />
                <Text className="username">Admin</Text>
                <DownOutlined />
              </Button>
            </Dropdown>
          </div>
        </Col>
      </Row>
    </AntHeader>
  );
};

export default HeaderAdmin;