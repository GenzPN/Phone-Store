const express = require('express');
const router = express.Router();
const db = require('../config/database');
// const authenticateToken = require('../middleware/auth'); // Xóa dòng này

// Lấy cài đặt
router.get('/', async (req, res) => {
  try {
    const [settings] = await db.promise().query('SELECT * FROM Settings');
    res.json(settings);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật cài đặt
router.put('/', async (req, res) => {
  const { key, value } = req.body;
  try {
    const [result] = await db.promise().query(
      'UPDATE Settings SET value = ? WHERE key = ?',
      [value, key]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json({ message: 'Setting updated' });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
