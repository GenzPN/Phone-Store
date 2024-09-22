import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BrandPage from './components/BrandPage/BrandPage';
import Payment from './components/Payment/Payment';
import Auth from './components/Auth/Auth';
import Profile from './components/Profile/Profile';
import Details from './components/Details/Details';
import Cart from './components/Cart/Cart';
import Products from './components/Products/Products';
import Checkout from './components/Checkout/Checkout';
import Address from './components/Address/Address';
import Test from './components/Test';

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
      <Routes>
        <Route path="/api/payment/*" element={user ? <Payment /> : <Navigate to="/api/auth" state={{ from: '/api/payment' }} />} />
        <Route path="/api/auth/*" element={!user ? <Auth onLogin={handleLogin} /> : <Navigate to="/" />} />
        <Route path="*" element={
          <Layout>
            <Header brands={brands} user={user} onLogout={handleLogout} />
            <Content style={{ padding: '20px 50px', backgroundColor: '#fff' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/brand/:brandName" element={<BrandPage />} />
                <Route path="/details/:productName" element={<Details />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/checkout" element={<Checkout />} />
                <Route path="/products/checkout/address" element={user ? <Address userId={user.id} /> : <Navigate to="/api/auth" state={{ from: '/products/checkout/address' }} />} />
                <Route path="/test" element={<Test />} />
                <Route 
                  path="/profile" 
                  element={
                    loading ? (
                      <div>Loading...</div>
                    ) : user ? (
                      <Profile user={user} />
                    ) : (
                      <Navigate to="/api/auth" state={{ from: '/profile' }} />
                    )
                  } 
                />
              </Routes>
            </Content>
            <Footer />
          </Layout>
        } />
      </Routes>
    </Router>
  );
};

export default App;