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

router.use(authenticateJWT);

// Lấy giỏ hàng của người dùng
router.get('/', async (req, res) => {
  try {
    const [cartItems] = await db.execute(`
      SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail
      FROM Cart c
      JOIN Products p ON c.product_id = p.id
      WHERE c.user_id = ?
    `, [req.user.id]);
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', optionalAuth, async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    if (req.user) {
      const [existingItem] = await db.execute(
        'SELECT * FROM Cart WHERE user_id = ? AND product_id = ?',
        [req.user.id, product_id]
      );
      
      if (existingItem.length > 0) {
        await db.execute(
          'UPDATE Cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?',
          [quantity, req.user.id, product_id]
        );
      } else {
        await db.execute(
          'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
          [req.user.id, product_id, quantity]
        );
      }
      res.status(201).json({ message: 'Product added to cart' });
    } else {
      res.status(401).json({ message: 'Unauthorized' });
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
    await db.execute(
      'UPDATE Cart SET quantity = ? WHERE product_id = ? AND user_id = ?',
      [quantity, product_id, req.user.id]
    );
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
    const [result] = await db.execute(
      'DELETE FROM Cart WHERE product_id = ? AND user_id = ?',
      [product_id, req.user.id]
    );
    if (result.affectedRows > 0) {
      res.json({ message: 'Cart item removed successfully' });
    } else {
      res.status(404).json({ message: 'Cart item not found' });
    }
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

// Thêm route để xóa toàn bộ giỏ hàng
router.delete('/', authenticateJWT, async (req, res) => {
  try {
    await db.execute('DELETE FROM Cart WHERE user_id = ?', [req.user.id]);
    res.json({ message: 'Cart cleared successfully' });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userCartRoutes = router;