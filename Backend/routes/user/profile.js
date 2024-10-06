import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

// Hàm chuyển đổi giá trị gender
function translateGender(gender) {
  switch (gender) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    case 'other':
      return 'Khác';
    default:
      return gender;
  }
}

router.get('/', async (req, res) => {
  try {
    const userId = req.user.id; // Assuming the user ID is stored in the request object after authentication
    const [users] = await db.promise().query(
      'SELECT id, username, email, fullName, gender, image, created_at FROM Users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Chuyển đổi giá trị gender
    const user = users[0];
    user.gender = translateGender(user.gender);

    res.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export const userProfileRoutes = router;
