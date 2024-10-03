import express from 'express';
import db from '../../config/database.js';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get all users
router.get('/all', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, fullName, gender, image, isAdmin, created_at FROM Users');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user by ID
router.get('/:id', async (req, res) => {
  try {
    const [users] = await db.query('SELECT id, username, email, fullName, gender, image, isAdmin, created_at FROM Users WHERE id = ?', [req.params.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Create a new user
router.post('/', async (req, res) => {
  const { username, email, password, fullName, gender, isAdmin } = req.body;
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [result] = await db.query(
      'INSERT INTO Users (username, email, password, fullName, gender, isAdmin) VALUES (?, ?, ?, ?, ?, ?)',
      [username, email, hashedPassword, fullName, gender, isAdmin]
    );
    res.status(201).json({ message: 'User created successfully', userId: result.insertId });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Update a user
router.put('/:id', async (req, res) => {
  const { username, email, fullName, gender, isAdmin } = req.body;
  try {
    // Kiểm tra xem username hoặc email đã tồn tại chưa
    const [existingUsers] = await db.query(
      'SELECT id FROM Users WHERE (username = ? OR email = ?) AND id != ?',
      [username, email, req.params.id]
    );
    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }

    const [result] = await db.query(
      'UPDATE Users SET username = ?, email = ?, fullName = ?, gender = ?, isAdmin = ? WHERE id = ?',
      [username, email, fullName, gender, isAdmin, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Change user password
router.put('/:id/change-password', async (req, res) => {
  const { newPassword } = req.body;
  try {
    // Hash mật khẩu mới
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    const [result] = await db.query(
      'UPDATE Users SET password = ? WHERE id = ?',
      [hashedPassword, req.params.id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete a user
router.delete('/:id', async (req, res) => {
  try {
    const [result] = await db.query('DELETE FROM Users WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as adminUserRoutes };