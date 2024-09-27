const express = require('express');
const router = express.Router();
const db = require('../config/database');
const bcrypt = require('bcrypt');

// Cập nhật thông tin người dùng
router.put('/update', async (req, res) => {
  const { fullName, gender, image } = req.body;
  try {
    await db.promise().query(
      'UPDATE Users SET fullName = ?, gender = ?, image = ? WHERE id = ?',
      [fullName, gender, image, 1] // Giả lập user_id là 1
    );
    res.json({ message: 'User information updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thay đổi mật khẩu
router.put('/change-password', async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  try {
    const [users] = await db.promise().query('SELECT password FROM Users WHERE id = ?', [1]); // Giả lập user_id là 1
    const user = users[0];
    const passwordMatch = await bcrypt.compare(currentPassword, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.promise().query('UPDATE Users SET password = ? WHERE id = ?', [hashedPassword, 1]); // Giả lập user_id là 1
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy địa chỉ của người dùng
router.get('/addresses', async (req, res) => {
  try {
    const [addresses] = await db.promise().query('SELECT * FROM UserAddresses WHERE user_id = ?', [1]); // Giả lập user_id là 1
    res.json(addresses);
  } catch (error) {
    console.error('Get addresses error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm địa chỉ mới
router.post('/addresses', async (req, res) => {
  const { fullName, phone, address, is_default, address_type, company_name } = req.body;
  try {
    if (is_default) {
      await db.promise().query('UPDATE UserAddresses SET is_default = 0 WHERE user_id = ?', [1]); // Giả lập user_id là 1
    }
    const [result] = await db.promise().query(
      'INSERT INTO UserAddresses (user_id, fullName, phone, address, is_default, address_type, company_name) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [1, fullName, phone, address, is_default, address_type, company_name] // Giả lập user_id là 1
    );
    res.status(201).json({ message: 'Address added', id: result.insertId });
  } catch (error) {
    console.error('Add address error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy danh sách người dùng
router.get('/', async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, username, email, fullName, gender, image, isAdmin FROM Users');
    res.json(users);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật thông tin người dùng bởi admin
router.put('/:id', async (req, res) => {
  const { fullName, gender, image, isAdmin } = req.body;
  try {
    await db.promise().query(
      'UPDATE Users SET fullName = ?, gender = ?, image = ?, isAdmin = ? WHERE id = ?',
      [fullName, gender, image, isAdmin, req.params.id]
    );
    res.json({ message: 'User information updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Thêm route để xóa người dùng
router.delete('/:id', async (req, res) => {
  try {
    await db.promise().query('DELETE FROM Users WHERE id = ?', [req.params.id]);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật route để thêm người dùng mới
router.post('/', async (req, res) => {
  const { username, email, fullName, gender, image, isAdmin, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO Users (username, email, fullName, gender, image, isAdmin, password) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [username, email, fullName, gender, image, isAdmin, hashedPassword]
    );
    res.status(201).json({ message: 'User added successfully', id: result.insertId });
  } catch (error) {
    console.error('Add user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật route để sửa thông tin người dùng
router.put('/:id', async (req, res) => {
  const { fullName, gender, image, isAdmin, password } = req.body;
  try {
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.promise().query(
        'UPDATE Users SET fullName = ?, gender = ?, image = ?, isAdmin = ?, password = ? WHERE id = ?',
        [fullName, gender, image, isAdmin, hashedPassword, req.params.id]
      );
    } else {
      await db.promise().query(
        'UPDATE Users SET fullName = ?, gender = ?, image = ?, isAdmin = ? WHERE id = ?',
        [fullName, gender, image, isAdmin, req.params.id]
      );
    }
    res.json({ message: 'User information updated' });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;