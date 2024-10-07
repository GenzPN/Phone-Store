import express from 'express';
import { getConfig, updateConfig } from '../../utils/configManager.js';

const router = express.Router();

// Get all settings
router.get('/', async (req, res) => {
  try {
    const config = await getConfig();
    if (config) {
      res.json(config);
    } else {
      res.status(500).json({ message: 'Error fetching settings' });
    }
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Update settings
router.put('/', async (req, res) => {
  try {
    console.log('Received update request with body:', req.body);
    const success = await updateConfig(req.body);
    if (success) {
      console.log('Đã lưu cài đặt');
      res.json({ message: 'Đã lưu cài đặt' });
    } else {
      console.log('Error updating settings');
      res.status(500).json({ message: 'Error updating settings' });
    }
  } catch (error) {
    console.error('Error updating settings:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export { router as adminSettingsRoutes };