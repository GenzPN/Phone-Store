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
import Details from './components/Details/Details'; // Import Details component
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
}

const App: React.FC = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const brands = ["Apple", "Samsung", "Oppo", "Huawei", "Realme", "Vivo", "Xiaomi", "Nokia"];

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const accessToken = getToken() || getCookie('accessToken');
      console.log('Access token:', accessToken); // Log the access token

      if (accessToken) {
        try {
          const response = await fetch('https://dummyjson.com/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          console.log('Response status:', response.status); // Log the response status

          if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData); // Log the user data
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
  }, []); // Empty dependency array

  const handleLogin = (userData: UserData, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
    setCookie('accessToken', accessToken, 7); // Store for 7 days
  };

  const handleLogout = () => {
    setUser(null);
    removeToken();
    removeCookie('accessToken');
  };

  if (loading) {
    return <div>Loading...</div>; // Or use a loading spinner
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
                <Route path="/checkout" element={<Checkout />} />
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
                {/* Add other routes here */}
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