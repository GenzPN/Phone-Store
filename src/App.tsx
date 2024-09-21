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
import { getToken, setToken, removeToken } from './utils/tokenStorage';

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
      const accessToken = getToken();
      if (accessToken) {
        try {
          const response = await fetch('https://dummyjson.com/auth/me', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
            },
          });
          if (response.ok) {
            const userData = await response.json();
            setUser(userData);
          } else {
            // If the token is invalid, clear it and the user data
            removeToken();
            setUser(null);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          // Clear token and user data on error
          removeToken();
          setUser(null);
        }
      } else {
        // If no token, ensure user is null
        setUser(null);
      }
      setLoading(false);
    };

    fetchCurrentUser();
  }, []);

  const handleLogin = (userData: UserData, accessToken: string) => {
    setUser(userData);
    setToken(accessToken);
  };

  const handleLogout = () => {
    setUser(null);
    removeToken();
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
                <Route path="/details/:productName" element={<Details />} /> {/* New route for product details */}
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