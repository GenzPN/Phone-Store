import React from 'react';
import { Layout, Menu } from 'antd';
import { SettingOutlined, UsergroupAddOutlined, HomeOutlined, ProfileOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarAdminProps {
  collapsed: boolean;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ collapsed }) => {
  const menuItems = [
    {
      key: '1',
      icon: <HomeOutlined />,
      label: <Link to="/admin/dashboard">Dashboard</Link>,
    },
    {
      key: '2',
      icon: <ProfileOutlined />,
      label: <Link to="/admin/products">Products</Link>,
    },
    {
      key: '3',
      icon: <ShoppingCartOutlined />,
      label: <Link to="/admin/orders">Orders</Link>,
    },
    {
      key: '4',
      icon: <UsergroupAddOutlined />,
      label: <Link to="/admin/users">Users</Link>,
    },
    {
      key: '5',
      icon: <SettingOutlined />,
      label: <Link to="/admin/settings">Settings</Link>,
    },
  ];

  return (
    <Sider 
      collapsible 
      collapsed={collapsed} 
      trigger={null} 
      width={200} 
      collapsedWidth={80}
      style={{ height: '100vh', position: 'fixed', left: 0, top: 64 }}
    >
      <Menu
        mode="inline"
        defaultSelectedKeys={['1']}
        style={{ height: '100%', borderRight: 0 }}
        theme="dark"
        items={menuItems}
      />
    </Sider>
  );
};

export default SidebarAdmin;
