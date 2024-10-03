import asyncHandler from 'express-async-handler';
import pool from '../config/database.js';

// @desc    Get reviews for a specific product
// @route   GET /api/reviews/product/:productId
// @access  Public
const getReviewsByProductId = asyncHandler(async (req, res) => {
  const productId = req.params.productId;

  const [reviews] = await pool.query(
    'SELECT * FROM ProductReviews WHERE product_id = ? ORDER BY created_at DESC',
    [productId]
  );

  res.json(reviews);
});

export { getReviewsByProductId };
