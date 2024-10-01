import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const userId = 1; // Dummy user ID for testing
    const [users] = await db.promise().query(
      'SELECT id, username, email, fullName, gender, image FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(users[0]);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userProfileRoutes = router;
