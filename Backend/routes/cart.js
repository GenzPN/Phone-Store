const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const authenticateToken = require('../middleware/auth'); // Xóa dòng này

// Lấy giỏ hàng của người dùng
router.get('/:userId', async (req, res) => {
  try {
    const [cartItems] = await db.promise().query('SELECT * FROM Cart WHERE user_id = ?', [req.params.userId]);
    res.json(cartItems);
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm sản phẩm vào giỏ hàng
router.post('/', async (req, res) => {
  const { user_id, product_id, quantity } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO Cart (user_id, product_id, quantity) VALUES (?, ?, ?)',
      [user_id, product_id, quantity]
    );
    res.status(201).json({ message: 'Product added to cart', id: result.insertId });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật số lượng sản phẩm trong giỏ hàng
router.put('/:id', async (req, res) => {
  const { quantity } = req.body;
  try {
    const [result] = await db.promise().query(
      'UPDATE Cart SET quantity = ? WHERE id = ?',
      [quantity, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item updated' });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Xóa sản phẩm khỏi giỏ hàng
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.promise().query('DELETE FROM Cart WHERE id = ?', [req.params.id]);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    res.json({ message: 'Cart item deleted' });
  } catch (error) {
    console.error('Delete cart error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
