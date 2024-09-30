const express = require('express');
const router = express.Router();
const db = require('../../config/database');
const authMiddleware = require('../../middleware/adminAuth');

router.get('/', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    const [user] = await db.query(
      'SELECT id, username, email, fullName, gender, image FROM Users WHERE id = ?',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

const userProfileRoutes = router;
module.exports = userProfileRoutes;
