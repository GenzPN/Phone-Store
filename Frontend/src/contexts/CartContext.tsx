import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { setCookie } from '../utils/cookies';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  thumbnail: string;
  brand: string;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  setCartItems: React.Dispatch<React.SetStateAction<CartItem[]>>;
  total: number;
  setTotal: React.Dispatch<React.SetStateAction<number>>;
  fetchCartItems: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const fetchCartItems = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // Nếu không có token, có thể người dùng chưa đăng nhập
        console.log('User not logged in');
        return;
      }

      const response = await axios.get('http://localhost:5000/api/cart', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCartItems(response.data);
    } catch (error) {
      console.error('Error fetching cart data:', error);
      message.error('Failed to fetch cart items');
    }
  };

  const updateTotal = (items: CartItem[]) => {
    const newTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  useEffect(() => {
    // Save to cookie whenever cartItems changes
    setCookie('cartItems', JSON.stringify(cartItems), 7);
    updateTotal(cartItems);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, total, setTotal, fetchCartItems }}>
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