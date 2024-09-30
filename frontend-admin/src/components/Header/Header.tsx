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
    <AntHeader className="header" style={{ position: 'fixed', zIndex: 1, width: '100%', padding: '0 16px' }}>
      <Row justify="space-between" align="middle" style={{ height: '100%' }}>
        <Col>
          <div className="header-left" style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<MenuOutlined />} onClick={onToggleSidebar} className="menu-button" style={{ color: 'white' }} />
            <img src="http://localhost:3000/logo192.png" alt="Logo" className="logo" style={{ height: '32px', marginLeft: '16px' }} />
          </div>
        </Col>
        <Col>
          <div className="header-right" style={{ display: 'flex', alignItems: 'center' }}>
            <Button type="text" icon={<ProfileOutlined />} onClick={() => navigate('/admin/products')} style={{ color: 'white' }} />
            <Button type="text" icon={<ShoppingCartOutlined />} onClick={() => navigate('/admin/orders')} style={{ color: 'white' }} />
            <Dropdown menu={{ items: menuItems }} trigger={['click']}>
              <Button type="text" className="ant-dropdown-link" onClick={e => e.preventDefault()} style={{ color: 'white' }}>
                <Avatar icon={<UserOutlined />} />
                <Text className="username" style={{ color: 'white', margin: '0 8px' }}>Admin</Text>
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