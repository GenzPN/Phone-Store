import express from 'express';
import db from '../../config/database.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = express.Router();

// Middleware để kiểm tra xác thực (tùy chọn)
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    authenticateJWT(req, res, next);
  } else {
    next();
  }
};

router.use(optionalAuth);

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    if (req.user) {
      const [cartItems] = await db.execute(`
        SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
        FROM Cart c
        JOIN Products p ON c.product_id = p.id
        WHERE c.user_id = ?
      `, [req.user.id]);
      res.json(cartItems);
    } else {
      res.json([]);
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
    if (req.user) {
      await db.execute(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [req.user.id, product_id, quantity]
      );
      res.status(201).json({ message: 'Product added to cart' });
    } else {
      res.status(401).json({ message: 'User not authenticated' });
    }
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
    if (req.user) {
      await db.execute(
        'UPDATE Cart SET quantity = ? WHERE product_id = ? AND user_id = ?',
        [quantity, product_id, req.user.id]
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
    if (req.user) {
      await db.execute(
        'DELETE FROM Cart WHERE product_id = ? AND user_id = ?',
        [product_id, req.user.id]
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
    const localCart = req.body.cart || [];
    for (const item of localCart) {
      await db.execute(
        'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
        [req.user.id, item.product_id, item.quantity]
      );
    }
    res.json({ message: 'Cart merged successfully' });
  } catch (error) {
    console.error('Merge cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userCartRoutes = router;