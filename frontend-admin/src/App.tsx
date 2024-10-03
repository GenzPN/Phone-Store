import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import HeaderAdmin from './components/Header/Header';
import SidebarAdmin from './components/Sidebar/Sidebar';
import DashboardAdmin from './components/Dashboard/Dashboard';
import ProductsAdmin from './components/Products/Products';
import SettingsAdmin from './components/Settings/Settings';
import OrdersAdmin from './components/Orders/Orders';
import UsersAdmin from './components/Users/Users';
const { Content } = Layout;

const App: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <HeaderAdmin onToggleSidebar={toggleSidebar} />
        <Layout>
          <SidebarAdmin collapsed={isSidebarCollapsed} />
          <Layout style={{ marginLeft: isSidebarCollapsed ? 80 : 200, marginTop: 64 }}>
            <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
              <Routes>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/products" element={<ProductsAdmin />} />
                <Route path="/admin/orders" element={<OrdersAdmin />} />
                <Route path="/admin/users" element={<UsersAdmin />} />
                <Route path="/admin/settings" element={<SettingsAdmin />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;