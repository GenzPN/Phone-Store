import express from 'express';
import { getReviewsByProductId } from '../controllers/reviewController.js';

const router = express.Router();

// Route để lấy đánh giá cho một sản phẩm cụ thể
router.get('/product/:productId', getReviewsByProductId);

export { router as reviewRoutes };