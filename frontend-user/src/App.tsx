import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
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

import { getToken, setToken, removeToken, setCookie, getCookie, removeCookie } from './utils/tokenStorage';
import axios from 'axios';

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
  const [loading, setLoading] = useState(true);
  const brands = ["Apple", "Samsung", "Oppo", "Huawei", "Realme", "Vivo", "Xiaomi", "Nokia"];

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const accessToken = getToken() || getCookie('accessToken') || localStorage.getItem('token');
      console.log('Access token:', accessToken);

      if (accessToken) {
        try {
          const response = await axios.get('http://localhost:5000/api/auth/me', {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          console.log('User data response:', response);

          if (response.status === 200 && response.data) {
            setUser(response.data);
            setToken(accessToken);
            setCookie('accessToken', accessToken, 7);
            localStorage.setItem('token', accessToken);
            axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
          } else {
            throw new Error('Invalid user data response');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          if (axios.isAxiosError(error) && error.response?.status === 401) {
            console.log('Token expired or invalid, logging out user');
            handleLogout();
          } else {
            console.error('Unexpected error:', error);
          }
        }
      } else {
        console.log('No access token found');
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const handleLogin = useCallback((userData: UserData, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    setCookie('accessToken', accessToken, 7);
    localStorage.setItem('token', accessToken);
    axios.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
  }, []);

  const handleLogout = () => {
    setUser(null);
    removeToken();
    removeCookie('accessToken');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CartProvider>
        <Routes>
          <Route path="/api/payment/*" element={user ? <Payment /> : <Navigate to="/api/auth/login" state={{ from: '/api/payment' }} />} />
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
                  <Route path="/details/:productName" element={<Details />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/products/checkout" element={<Checkout />} />
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
    </Router>
  );
};

export default App;