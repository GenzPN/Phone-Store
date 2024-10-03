import React, { useEffect, useState } from 'react';
import { Layout, Menu } from 'antd';
import { SettingOutlined, UsergroupAddOutlined, HomeOutlined, ProfileOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const { Sider } = Layout;

interface SidebarAdminProps {
  collapsed: boolean;
}

const SidebarAdmin: React.FC<SidebarAdminProps> = ({ collapsed }) => {
  const location = useLocation();
  const [selectedKey, setSelectedKey] = useState('1');

  useEffect(() => {
    const path = location.pathname;
    const key = getKeyFromPath(path);
    setSelectedKey(key);
    localStorage.setItem('selectedMenuKey', key);
  }, [location]);

  useEffect(() => {
    const savedKey = localStorage.getItem('selectedMenuKey');
    if (savedKey) {
      setSelectedKey(savedKey);
    }
  }, []);

  const getKeyFromPath = (path: string) => {
    switch (true) {
      case path.includes('/admin/dashboard'):
        return '1';
      case path.includes('/admin/products'):
        return '2';
      case path.includes('/admin/orders'):
        return '3';
      case path.includes('/admin/users'):
        return '4';
      case path.includes('/admin/settings'):
        return '6';
      default:
        return '1';
    }
  };

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
      key: '6',
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
        selectedKeys={[selectedKey]}
        style={{ height: '100%', borderRight: 0 }}
        theme="dark"
        items={menuItems}
      />
    </Sider>
  );
};

export default SidebarAdmin;
