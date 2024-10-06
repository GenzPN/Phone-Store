import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

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
  login: () => void;
  logout: () => void;
  clearCartAfterPayment: () => Promise<void>;
  isLoggedIn: boolean; // Thêm dòng này
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const fetchCart = async () => {
    try {
      if (isLoggedIn) {
        const response = await api.get('/api/user/cart');
        setCartItems(response.data);
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartItems(localCart);
      }
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  };

  useEffect(() => {
    fetchCart();
  }, [isLoggedIn]); // Thêm isLoggedIn vào dependencies

  const addToCart = async (item: CartItem) => {
    if (isLoggedIn) {
      try {
        const response = await api.post('/api/user/cart', {
          product_id: item.product_id,
          quantity: item.quantity
        });
        if (response.status === 201) {
          await fetchCart();
          message.success(`Đã thêm ${item.title} vào giỏ hàng`);
        }
      } catch (error) {
        console.error('Error adding to cart:', error);
        message.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    } else {
      Modal.confirm({
        title: 'Bạn cần đăng nhập',
        content: 'Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.',
        okText: 'Đăng nhập',
        cancelText: 'Hủy',
        onOk() {
          navigate('/api/auth');
        },
      });
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      if (isLoggedIn) {
        await api.delete(`/api/user/cart/${id}`); // Thay đổi đường dẫn API
        await fetchCart();
        message.success('Đã xóa sản phẩm khỏi giỏ hàng');
      } else {
        // Xử lý xóa sản phẩm khỏi giỏ hàng local
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = localCart.filter((item: CartItem) => item.product_id !== id);
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        message.success('Đã xóa sản phẩm khỏi giỏ hàng');
      }
    } catch (error) {
      console.error('Error removing from cart:', error);
      message.error('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.');
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      if (isLoggedIn) {
        await api.put(`/api/user/cart/${id}`, { quantity });
        await fetchCart();
        message.success('Đã cập nhật số lượng sản phẩm');
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const updatedCart = localCart.map((item: CartItem) => 
          item.product_id === id ? { ...item, quantity } : item
        );
        localStorage.setItem('cart', JSON.stringify(updatedCart));
        setCartItems(updatedCart);
        message.success('Đã cập nhật số lượng sản phẩm');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.');
    }
  };

  const clearCart = async () => {
    try {
      if (isLoggedIn) {
        await api.delete('/api/user/cart');
        setCartItems([]);
        message.success('Đã xóa toàn bộ giỏ hàng');
      } else {
        message.warning('Vui lòng đăng nhập để xóa giỏ hàng');
      }
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  };

  const clearCartAfterPayment = async () => {
    try {
      if (isLoggedIn) {
        await api.delete('/api/user/cart');
      } else {
        localStorage.removeItem('cart');
      }
      setCartItems([]);
      message.success('Đơn hàng đã được xử lý và giỏ hàng đã được xóa');
    } catch (error) {
      console.error('Error clearing cart after payment:', error);
      message.error('Không thể xóa giỏ hàng sau khi thanh toán. Vui lòng thử lại.');
    }
  };

  const login = async () => {
    setIsLoggedIn(true);
    try {
      const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
      if (localCart.length > 0) {
        await api.post('/api/user/cart/merge', { cart: localCart });
        localStorage.removeItem('cart');
      }
      await fetchCart();
    } catch (error) {
      console.error('Error merging cart:', error);
    }
  };

  const logout = () => {
    setIsLoggedIn(false);
    setCartItems([]);
  };

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      addToCart, 
      removeFromCart, 
      updateQuantity, 
      clearCart,
      clearCartAfterPayment, // Add this new function to the context
      login, 
      logout,
      isLoggedIn // Thêm isLoggedIn vào context
    }}>
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