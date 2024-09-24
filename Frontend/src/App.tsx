import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Layout } from 'antd';
import { CartProvider } from './contexts/CartContext';
// User
import HeaderUser from './components/User/Header/Header';
import FooterUser from './components/User/Footer/Footer';
// User
import Home from './components/User/Home/Home';
import BrandPage from './components/User/BrandPage/BrandPage';
import Payment from './components/User/Payment/Payment';
import Auth from './components/User/Auth/Auth';
import Profile from './components/User/Profile/Profile';
import Details from './components/User/Details/Details';
import Cart from './components/User/Cart/Cart';
import Products from './components/User/Products/Products';
import Checkout from './components/User/Checkout/Checkout';
// Admin
import HeaderAdmin from './components/Admin/Header/Header';
import SidebarAdmin from './components/Admin/Sidebar/Sidebar';
// Admin
import DashboardAdmin from './components/Admin/Dashboard/Dashboard';
import LoginAdmin from './components/Admin/Login/Login';
import ProductsAdmin from './components/Admin/Products/Products';
import SettingsAdmin from './components/Admin/Settings/Settings';
import OrdersAdmin from './components/Admin/Orders/Orders';
import UsersAdmin from './components/Admin/Users/Users';

import { getToken, setToken, removeToken, setCookie, getCookie, removeCookie } from './utils/tokenStorage';

const { Content } = Layout;

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  fullName: string; // Thêm trường này
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const brands = ["Apple", "Samsung", "Oppo", "Huawei", "Realme", "Vivo", "Xiaomi", "Nokia"];

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const accessToken = getToken() || getCookie('accessToken');
      console.log('Access token:', accessToken);

      if (accessToken) {
        try {
          const response = await fetch('http://localhost:5000/api/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          console.log('Response status:', response.status);

          if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData);
            setUser(userData);
            setToken(accessToken);
            setCookie('accessToken', accessToken, 7);
          } else {
            console.log('Invalid token, clearing data');
            removeToken();
            removeCookie('accessToken');
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          removeToken();
          removeCookie('accessToken');
          setUser(null);
        }
      } else {
        console.log('No access token found');
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const handleLogin = (userData: UserData, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    setCookie('accessToken', accessToken, 7);
  };

  const handleLogout = () => {
    setUser(null);
    removeToken();
    removeCookie('accessToken');
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const AdminLayout = () => {
    const location = useLocation();
    const isLoginPage = location.pathname === '/admin/auth';

    return (
      <Layout style={{ minHeight: '100vh' }}>
        {!isLoginPage && <HeaderAdmin onToggleSidebar={toggleSidebar} />}
        <Layout>
          {!isLoginPage && (
            <SidebarAdmin collapsed={isSidebarCollapsed} />
          )}
          <Layout style={{ marginLeft: isSidebarCollapsed ? 80 : 200, marginTop: 64 }}>
            <Content style={{ padding: 24, margin: 0, minHeight: 280 }}>
              <Routes>
                <Route path="/dashboard" element={<DashboardAdmin />} />
                <Route path="/auth" element={<LoginAdmin />} />
                <Route path="/orders" element={<OrdersAdmin />} />
                <Route path="/users" element={<UsersAdmin />} />
                <Route path="/settings" element={<SettingsAdmin />} />
                <Route path="/products" element={<ProductsAdmin />} />
                <Route path="*" element={<Navigate to="/admin/dashboard" />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    );
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/api/payment/*" element={user ? <Payment /> : <Navigate to="/api/auth/login" state={{ from: '/api/payment' }} />} />
          <Route 
            path="/api/auth/*" 
            element={
              !user ? (
                <Routes>
                  <Route path="login" element={<Auth onLogin={handleLogin} />} />
                  <Route path="register" element={<Auth onLogin={handleLogin} />} />
                  <Route path="" element={<Navigate to="/api/auth/login" />} />
                </Routes>
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route path="/admin/*" element={<AdminLayout />} />
          <Route path="*" element={
            <Layout>
              <HeaderUser brands={brands} user={user} onLogout={handleLogout} />
              <Content style={{ padding: '20px 50px', backgroundColor: '#fff' }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/brand/:brandName" element={<BrandPage />} />
                  <Route path="/details/:productName" element={<Details />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/checkout" element={<Checkout />} />
                  {/* Removed the Address route */}
                  <Route 
                    path="/profile" 
                    element={
                      loading ? (
                        <div>Loading...</div>
                      ) : user ? (
                        <Profile user={user} />
                      ) : (
                        <Navigate to="/api/auth/login" state={{ from: '/profile' }} />
                      )
                    } 
                  />
                </Routes>
              </Content>
              <FooterUser />
            </Layout>
          } />
        </Routes>
      </CartProvider>
    </Router>
  );
};

export default App;