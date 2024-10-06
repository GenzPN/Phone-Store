import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import { CartProvider } from './contexts/CartContext';
// User components
import HeaderUser from './components/Header/Header';
import FooterUser from './components/Footer/Footer';
import Home from './components/Home/Home';
import BrandPage from './components/BrandPage/BrandPage';
import Payment from './components/Payment/Payment';
import Auth from './components/Auth/Auth';
import Profile from './components/Profile/Profile';
import Details from './components/Details/Details';
import Cart from './components/Cart/Cart';
import Products from './components/Products/Products';
import Checkout from './components/Checkout/Checkout';
import Order from './components/Order/Order';
import Status from './components/Status/Status';

import { getToken, setToken, removeToken, setCookie, getCookie, removeCookie } from './utils/tokenStorage';
import axios from 'axios';
import api from './utils/api';

const { Content } = Layout;

interface UserData {
  id: number;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  gender: string;
  image: string;
  fullName: string;
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const brands = ["Apple", "Samsung", "Oppo", "Huawei", "Realme", "Vivo", "Xiaomi", "Nokia"];

  const handleLogout = useCallback(async () => {
    try {
      await api.post('/api/auth/logout');
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, [navigate]);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('Access token:', token);

      if (token) {
        try {
          const response = await api.get('/api/auth/me');
          console.log('User data response:', response);

          if (response.status === 200 && response.data) {
            setUser(response.data);
            api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          } else {
            throw new Error('Invalid user data response');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          handleLogout();
        }
      } else {
        console.log('No access token found');
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, [handleLogout]);

  const handleLogin = useCallback((userData: UserData, accessToken: string) => {
    setUser(userData);
    localStorage.setItem('token', accessToken);
    localStorage.setItem('user', JSON.stringify(userData));
    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <CartProvider>
      <Routes>
        <Route path="/payment" element={user ? <Payment /> : <Navigate to="/api/auth/login" state={{ from: '/payment' }} />} />
        <Route path="/api/auth/*" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="*" element={
          <Layout style={{ minHeight: '100vh' }}>
            <HeaderUser brands={brands} user={user} onLogout={handleLogout} />
            <Content 
              style={{ 
                padding: 0,
                backgroundColor: '#fff',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/brand/:brandName" element={<BrandPage />} />
                <Route path="/details/:brand/:title" element={<Details />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/checkout" element={<Checkout />} />
                <Route path="/order" element={<Order />} />
                <Route path="/order-confirmation/:orderId" element={<Status />} />
                <Route 
                  path="/profile" 
                  element={
                    user ? <Profile user={user} /> : <Navigate to="/api/auth/login" state={{ from: '/profile' }} />
                  } 
                />
              </Routes>
            </Content>
            <FooterUser />
          </Layout>
        } />
      </Routes>
    </CartProvider>
  );
};

export default App;