import React, { createContext, useState, useContext, useEffect } from 'react';
import { getToken } from '../utils/tokenStorage';
import { setCookie, getCookie } from '../utils/cookieUtils';

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
    const token = getToken();
    if (token) {
      try {
        const response = await fetch('http://localhost:5000/api/cart', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (!response.ok) {
          throw new Error('Failed to fetch cart items');
        }
        const data = await response.json();
        setCartItems(data);
        updateTotal(data);
        // Save to cookie after fetching from server
        setCookie('cartItems', JSON.stringify(data));
      } catch (error) {
        console.error('Error fetching cart data:', error);
        // If there's an error, try to load from cookie
        const cookieCart = getCookie('cartItems');
        if (cookieCart) {
          const parsedCart = JSON.parse(cookieCart);
          setCartItems(parsedCart);
          updateTotal(parsedCart);
        }
      }
    } else {
      // If no token, load from cookie
      const cookieCart = getCookie('cartItems');
      if (cookieCart) {
        const parsedCart = JSON.parse(cookieCart);
        setCartItems(parsedCart);
        updateTotal(parsedCart);
      }
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
    setCookie('cartItems', JSON.stringify(cartItems));
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