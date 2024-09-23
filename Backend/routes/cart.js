const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');

// Lấy giỏ hàng của người dùng
router.get('/', authenticateToken, async (req, res) => {
  try {
    const [cartItems] = await db.promise().query(
      'SELECT c.id, c.product_id, c.quantity, p.title, p.price, p.thumbnail FROM Cart c JOIN Products p ON c.product_id = p.id WHERE c.user_id = ?',
      [req.user.id]
    );
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/add', authenticateToken, async (req, res) => {
  const { product_id, quantity } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + VALUES(quantity)',
      [req.user.id, product_id, quantity]
    );
    res.status(201).json({ message: 'Product added to cart' });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/update/:id', authenticateToken, async (req, res) => {
  const { quantity } = req.body;
  try {
    await db.promise().query(
      'UPDATE Cart SET quantity = ? WHERE id = ? AND user_id = ?',
      [quantity, req.params.id, req.user.id]
    );
    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/remove/:id', authenticateToken, async (req, res) => {
  try {
    await db.promise().query(
      'DELETE FROM Cart WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ message: 'Cart item removed' });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
