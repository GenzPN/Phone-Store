import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import HeaderAdmin from './components/Admin/Header/Header';
import SidebarAdmin from './components/Admin/Sidebar/Sidebar';
import DashboardAdmin from './components/Admin/Dashboard/Dashboard';
import LoginAdmin from './components/Admin/Login/Login';
import ProductsAdmin from './components/Admin/Products/Products';
import SettingsAdmin from './components/Admin/Settings/Settings';
import OrdersAdmin from './components/Admin/Orders/Orders';
import UsersAdmin from './components/Admin/Users/Users';
import AddressUser from './components/Admin/AddressUser/AddressUser';

import { getToken, setToken, removeToken, setCookie, getCookie, removeCookie } from './utils/tokenStorage';

const { Content } = Layout;

interface AdminData {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
}

const App: React.FC = () => {
  const [admin, setAdmin] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  useEffect(() => {
    const fetchCurrentAdmin = async () => {
      const accessToken = getToken() || getCookie('accessToken');
      console.log('Access token:', accessToken);

      if (accessToken) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/admin/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          console.log('Response status:', response.status);

          if (response.ok) {
            const adminData = await response.json();
            console.log('Admin data:', adminData);
            if (adminData.isAdmin) {
              setAdmin(adminData);
              setToken(accessToken);
              setCookie('accessToken', accessToken, 7);
            } else {
              throw new Error('User is not an admin');
            }
          } else {
            console.log('Invalid token, clearing data');
            removeToken();
            removeCookie('accessToken');
            setAdmin(null);
          }
        } catch (error) {
          console.error('Error fetching admin data:', error);
          removeToken();
          removeCookie('accessToken');
          setAdmin(null);
        }
      } else {
        console.log('No access token found');
        setAdmin(null);
      }
      setLoading(false);
    };

    fetchCurrentAdmin();
  }, []);

  const handleLogin = (adminData: AdminData, accessToken: string) => {
    setAdmin(adminData);
    setToken(accessToken);
    setCookie('accessToken', accessToken, 7);
  };

  const handleLogout = () => {
    setAdmin(null);
    removeToken();
    removeCookie('accessToken');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const AdminLayout = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/admin/auth';

    return (
      <Layout style={{ minHeight: '100vh' }}>
        {!isLoginPage && <HeaderAdmin onToggleSidebar={toggleSidebar} onLogout={handleLogout} />}
        <Layout>
          {!isLoginPage && (
            <SidebarAdmin collapsed={isSidebarCollapsed} />
          )}
          <Layout style={{ marginLeft: isSidebarCollapsed ? 80 : 200, marginTop: 64 }}>
            <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
              <Routes>
                <Route path="/dashboard" element={<DashboardAdmin />} />
                <Route path="/products" element={<ProductsAdmin />} />
                <Route path="/orders" element={<OrdersAdmin />} />
                <Route path="/users" element={<UsersAdmin />} />
                <Route path="/settings" element={<SettingsAdmin />} />
                <Route path="/addressuser" element={<AddressUser />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/admin/auth" 
          element={
            !admin ? <LoginAdmin onLogin={handleLogin} /> : <Navigate to="/admin/dashboard" />
          } 
        />
        <Route 
          path="/admin/*" 
          element={
            admin ? <AdminLayout /> : <Navigate to="/admin/auth" />
          } 
        />
        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
      </Routes>
    </Router>
  );
};

export default App;