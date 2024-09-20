import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { Layout } from 'antd';
import Home from './components/Home/Home';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import BrandPage from './components/BrandPage/BrandPage';

const { Content } = Layout;

const App: React.FC = () => {
  const brands = ["Apple", "Samsung", "Oppo", "Huawei", "Realme", "Vivo", "Xiaomi", "Nokia"];

  return (
    <Router>
      <Layout>
        <Header brands={brands} />
        <Content style={{ padding: '20px 50px', backgroundColor: '#fff' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/brand/:brandName" element={<BrandPage />} />
            {/* Thêm các route khác ở đây */}
          </Routes>
        </Content>
        <Footer />
      </Layout>
    </Router>
  );
};

export default App;