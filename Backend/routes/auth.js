const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { authenticateUser } = require('../middleware/auth');
const router = express.Router();

// Remove the authenticateToken middleware from this file

// Đăng nhập
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const [users] = await db.promise().query('SELECT * FROM Users WHERE username = ?', [username]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const token = jwt.sign({ id: user.id, role: user.isAdmin ? 'admin' : 'user' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Đăng ký
router.post('/register', async (req, res) => {
  const { username, email, password, fullName, gender } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await db.promise().query(
      'INSERT INTO Users (username, email, password, fullName, gender) VALUES (?, ?, ?, ?, ?)',
      [username, email, hashedPassword, fullName, gender]
    );
    const token = jwt.sign({ id: result.insertId, username, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.status(201).json({ 
      user: { 
        id: result.insertId, 
        username, 
        email,
        fullName,
        isAdmin: false
      }, 
      accessToken: token 
    });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy thông tin người dùng hiện tại
router.get('/me', authenticateUser, async (req, res) => {
  try {
    const [users] = await db.promise().query('SELECT id, username, email, fullName, gender, image, isAdmin FROM Users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(users[0]);
  } catch (error) {
    console.error('Get user info error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
