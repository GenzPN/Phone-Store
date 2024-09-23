const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const bcrypt = require('bcrypt');

// Cập nhật thông tin người dùng
router.put('/update', authenticateToken, async (req, res) => {
  const { fullName, gender, image } = req.body;
  try {
    await db.promise().query(
      'UPDATE Users SET fullName = ?, gender = ?, image = ? WHERE id = ?',
      [fullName, gender, image, req.user.id]
    );
    res.json({ message: 'User information updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thay đổi mật khẩu
router.put('/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await db.promise().query('SELECT password FROM Users WHERE id = ?', [req.user.id]);
    const user = users[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, req.user.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy địa chỉ của người dùng
router.get('/addresses', authenticateToken, async (req, res) => {
  try {
    const [addresses] = await db.promise().query('SELECT * FROM UserAddresses WHERE user_id = ?', [req.user.id]);
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm địa chỉ mới
router.post('/addresses', authenticateToken, async (req, res) => {
  const { fullName, phone, address, is_default, address_type, company_name } = req.body;
  try {
    if (is_default) {
      await db.promise().query('UPDATE UserAddresses SET is_default = 0 WHERE user_id = ?', [req.user.id]);
    }
    const [result] = await db.promise().query(
      'INSERT INTO UserAddresses (user_id, fullName, phone, address, is_default, address_type, company_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.user.id, fullName, phone, address, is_default, address_type, company_name]
    );
    res.status(201).json({ message: 'Address added', id: result.insertId });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;