import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { message } from 'antd';
import { setCookie, getCookie } from '../utils/cookies';

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
  updateCartItem: (id: number, quantity: number) => Promise<void>;
  removeCartItem: (id: number) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_COOKIE_NAME = 'cart_items';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [total, setTotal] = useState(0);

  const saveCartToCookie = useCallback((items: CartItem[]) => {
    setCookie(CART_COOKIE_NAME, JSON.stringify(items), 7); // Save for 7 days
  }, []);

  const fetchCartItems = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Fetch cart items from server if user is logged in
        const response = await axios.get('http://localhost:5000/api/cart', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (response.status === 200 && Array.isArray(response.data)) {
          setCartItems(response.data);
          saveCartToCookie(response.data);
        } else {
          throw new Error('Invalid response data');
        }
      } else {
        // Load cart items from cookie if user is not logged in
        const cookieCart = getCookie(CART_COOKIE_NAME);
        if (cookieCart) {
          setCartItems(JSON.parse(cookieCart));
        }
      }
    } catch (error) {
      console.error('Error fetching cart data:', error);
      message.error('Failed to fetch cart items. Please try again later.');
      setCartItems([]);
    }
  }, [saveCartToCookie]);

  const updateCartItem = useCallback(async (id: number, quantity: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Update cart item on server if user is logged in
        await axios.put(`http://localhost:5000/api/cart/${id}`, { quantity }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update local state
      const updatedItems = cartItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      );
      setCartItems(updatedItems);
      saveCartToCookie(updatedItems);
    } catch (error) {
      console.error('Error updating cart item:', error);
      message.error('Failed to update cart item. Please try again.');
    }
  }, [cartItems, saveCartToCookie]);

  const removeCartItem = useCallback(async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        // Remove cart item from server if user is logged in
        await axios.delete(`http://localhost:5000/api/cart/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      // Update local state
      const updatedItems = cartItems.filter(item => item.id !== id);
      setCartItems(updatedItems);
      saveCartToCookie(updatedItems);
    } catch (error) {
      console.error('Error removing cart item:', error);
      message.error('Failed to remove cart item. Please try again.');
    }
  }, [cartItems, saveCartToCookie]);

  const updateTotal = (items: CartItem[]) => {
    const newTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotal(newTotal);
  };

  useEffect(() => {
    fetchCartItems();
  }, [fetchCartItems]);

  useEffect(() => {
    // Save to cookie whenever cartItems changes
    saveCartToCookie(cartItems);
    updateTotal(cartItems);
  }, [cartItems]);

  return (
    <CartContext.Provider value={{ 
      cartItems, 
      setCartItems, 
      total, 
      setTotal, 
      fetchCartItems, 
      updateCartItem, 
      removeCartItem 
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