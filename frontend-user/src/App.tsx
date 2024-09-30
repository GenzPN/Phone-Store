import React, { useState, useEffect } from 'react';
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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <CartProvider>
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
              <Route 
                path="/profile" 
                element={
                  user ? <Profile user={user} /> : <Navigate to="/api/auth/login" state={{ from: '/profile' }} />
                } 
              />
              <Route 
                path="/api/payment/*" 
                element={user ? <Payment /> : <Navigate to="/api/auth/login" state={{ from: '/api/payment' }} />} 
              />
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
            </Routes>
          </Content>
          <FooterUser />
        </Layout>
      </CartProvider>
    </Router>
  );
};

export default App;