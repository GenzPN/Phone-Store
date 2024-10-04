import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { message } from 'antd';
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
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);

  const fetchCart = async () => {
    try {
      if (isLoggedIn) {
        const response = await api.get('/api/cart');
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
    try {
      if (isLoggedIn) {
        const response = await api.post('/api/cart', {
          product_id: item.product_id,
          quantity: item.quantity
        });
        if (response.status === 201) {
          await fetchCart();
          message.success('Đã thêm sản phẩm vào giỏ hàng');
        } else {
          throw new Error('Unexpected response status');
        }
      } else {
        const localCart = JSON.parse(localStorage.getItem('cart') || '[]');
        const existingItemIndex = localCart.findIndex((cartItem: CartItem) => cartItem.product_id === item.product_id);
        if (existingItemIndex > -1) {
          localCart[existingItemIndex].quantity += item.quantity;
        } else {
          localCart.push(item);
        }
        localStorage.setItem('cart', JSON.stringify(localCart));
        setCartItems(localCart);
        message.success('Đã thêm sản phẩm vào giỏ hàng');
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      if (axios.isAxiosError(error)) {
        if (error.response) {
          message.error(`Lỗi: ${error.response.data.message || 'Không thể thêm sản phẩm vào giỏ hàng'}`);
        } else if (error.request) {
          message.error('Không thể kết nối đến server. Vui lòng thử lại sau.');
        } else {
          message.error('Đã xảy ra lỗi. Vui lòng thử lại sau.');
        }
      } else {
        message.error('Không thể thêm sản phẩm vào giỏ hàng. Vui lòng thử lại.');
      }
    }
  };

  const removeFromCart = async (id: number) => {
    try {
      await api.delete(`/api/cart/${id}`);
      await fetchCart();
      message.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      console.error('Error removing from cart:', error);
      message.error('Không thể xóa sản phẩm khỏi giỏ hàng. Vui lòng thử lại.');
    }
  };

  const updateQuantity = async (id: number, quantity: number) => {
    try {
      await api.put(`/api/cart/${id}`, { quantity });
      await fetchCart();
      message.success('Đã cập nhật số lượng sản phẩm');
    } catch (error) {
      console.error('Error updating quantity:', error);
      message.error('Không thể cập nhật số lượng sản phẩm. Vui lòng thử lại.');
    }
  };

  const clearCart = async () => {
    try {
      await api.delete('/api/cart');
      setCartItems([]);
      message.success('Đã xóa toàn bộ giỏ hàng');
    } catch (error) {
      console.error('Error clearing cart:', error);
      message.error('Không thể xóa giỏ hàng. Vui lòng thử lại.');
    }
  };

  const login = async () => {
    setIsLoggedIn(true);
    try {
      await api.post('/api/cart/merge');
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
      login, 
      logout 
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