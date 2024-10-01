import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { message } from 'antd';

export interface CartItem {
  id: number;
  product_id: number;
  quantity: number;
  title: string;
  price: number;
  thumbnail: string;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    Cookies.set('cart', JSON.stringify(cartItems), { expires: 7 });
  }, [cartItems]);

  const fetchCart = async () => {
    try {
      const token = Cookies.get('token');
      console.log('Fetching cart with token:', token); // Log để kiểm tra token
      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Cart response:', response.data); // Log response để kiểm tra
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart:', error);
      if (axios.isAxiosError(error)) {
        console.error('Response data:', error.response?.data);
        console.error('Response status:', error.response?.status);
      }
      message.error('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
    }
  };

  const addToCart = async (item: CartItem) => {
    try {
      const token = Cookies.get('token');
      if (!token) {
        message.error('Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng');
        return;
      }

      const response = await axios.post('/api/cart', 
        { product_id: item.product_id, quantity: item.quantity },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.status === 200 || response.status === 201) {
        await fetchCart(); // Cập nhật giỏ hàng từ server
        message.success(`Đã thêm ${item.title} vào giỏ hàng`);
      } else {
        throw new Error('Unexpected response status');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('Error data:', error.response.data);
          console.error('Error status:', error.response.status);
          message.error(`Lỗi: ${error.response.data.message || 'Không thể thêm sản phẩm vào giỏ hàng'}`);
        } else if (error.request) {
          // The request was made but no response was received
          console.error('Error request:', error.request);
          message.error('Không nhận được phản hồi từ server. Vui lòng kiểm tra kết nối mạng.');
        } else {
          // Something happened in setting up the request that triggered an Error
          console.error('Error message:', error.message);
          message.error('Có lỗi xảy ra khi thêm sản phẩm vào giỏ hàng');
        }
      } else {
        message.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      const token = Cookies.get('token');
      await axios.delete(`/api/cart/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing from cart:', error);
      message.error('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.');
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      const token = Cookies.get('token');
      await axios.put(`/api/cart/${id}`, { quantity }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchCart();
      message.success('Đã cập nhật số lượng sản phẩm');
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.');
    }
  };

  const clearCart = async () => {
    try {
      const token = Cookies.get('token');
      await axios.delete('/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems([]);
      Cookies.remove('cart');
      message.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  };

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};