const express = require('express');
const router = express.Router();
const { getAdminSettings, updateAdminSettings } = require('../config/configManager');
const authenticateToken = require('../middleware/auth');

// Lấy cài đặt admin
router.get('/', authenticateToken, async (req, res) => {
  try {
    const settings = await getAdminSettings();
    res.json(settings);
  } catch (error) {
    console.error('Error getting admin settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Cập nhật cài đặt admin
router.put('/', authenticateToken, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    const updatedSettings = await updateAdminSettings(req.body);
    res.json(updatedSettings);
  } catch (error) {
    console.error('Error updating admin settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;
