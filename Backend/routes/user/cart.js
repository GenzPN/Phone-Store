import express from 'express';
import db from '../../config/database.js';
import jwt from 'jsonwebtoken';
import NodeCache from 'node-cache';

const router = express.Router();
const cache = new NodeCache({ stdTTL: 3600 }); // Cache sẽ hết hạn sau 1 giờ

// Hàm để lấy giỏ hàng từ cache hoặc cookie
const getCart = (req) => {
  if (req.user) {
    return cache.get(`cart_${req.user.id}`) || [];
  } else {
    return req.cookies.cart ? JSON.parse(req.cookies.cart) : [];
  }
};

// Hàm để lưu giỏ hàng vào cache và cookie
const saveCart = (req, res, cart) => {
  if (req.user) {
    cache.set(`cart_${req.user.id}`, cart);
  } else {
    res.cookie('cart', JSON.stringify(cart), { 
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production'
    });
  }
};

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    const cart = getCart(req);
    if (req.user) {
      const user_id = req.user.id;
      const [cartItems] = await db.execute(`
        SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
        FROM Cart c
        JOIN Products p ON c.product_id = p.id
        WHERE c.user_id = ?
      `, [user_id]);
      res.json(cartItems);
    } else {
      res.json(cart);
    }
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    let cart = getCart(req);

    const existingItem = cart.find(item => item.product_id === product_id);
    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ product_id, quantity });
    }

    saveCart(req, res, cart);

    if (req.user) {
      const user_id = req.user.id;
      await db.promise().query(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [user_id, product_id, quantity]
      );
    }

    res.status(201).json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const product_id = parseInt(req.params.id);
    let cart = getCart(req);

    const item = cart.find(item => item.product_id === product_id);
    if (item) {
      item.quantity = quantity;
    }

    saveCart(req, res, cart);

    if (req.user) {
      const user_id = req.user.id;
      await db.promise().query(
        'UPDATE Cart SET quantity = ? WHERE product_id = ? AND user_id = ?',
        [quantity, product_id, user_id]
      );
    }

    res.json({ message: 'Cart item updated successfully' });
  } catch (error) {
    console.error('Update cart item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', async (req, res) => {
  try {
    const product_id = parseInt(req.params.id);
    let cart = getCart(req);

    cart = cart.filter(item => item.product_id !== product_id);

    saveCart(req, res, cart);

    if (req.user) {
      const user_id = req.user.id;
      await db.promise().query(
        'DELETE FROM Cart WHERE product_id = ? AND user_id = ?',
        [product_id, user_id]
      );
    }

    res.json({ message: 'Cart item removed successfully' });
  } catch (error) {
    console.error('Remove cart item error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Merge giỏ hàng khi đăng nhập
router.post('/merge', async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user_id = req.user.id;
    const cookieCart = getCart(req);

    for (const item of cookieCart) {
      await db.promise().query(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [user_id, item.product_id, item.quantity]
      );
    }

    res.clearCookie('cart');
    cache.del(`cart_${user_id}`);
    res.json({ message: 'Cart merged successfully' });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route test
router.get('/test', (req, res) => {
  res.json({ message: 'Cart route is working' });
});

export const userCartRoutes = router;