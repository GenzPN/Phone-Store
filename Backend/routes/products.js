const express = require('express');
const router = express.Router();
const db = require('../config/database');
const authenticateToken = require('../middleware/auth');
const { formatProductNameForUrl } = require('../utils/stringUtils');

// Hàm định dạng giá
const formatPrice = (price) => {
  if (typeof price !== 'number' || isNaN(price)) {
    return 'Giá không xác định';
  }
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const offset = (page - 1) * limit;

  try {
    const [products] = await db.promise().query('SELECT * FROM Products LIMIT ? OFFSET ?', [Number(limit), offset]);
    const [countResult] = await db.promise().query('SELECT COUNT(*) as total FROM Products');
    const totalProducts = countResult[0].total;

    if (!products || products.length === 0) {
      console.log('No products found or empty result');
      return res.status(404).json({ message: 'No products found' });
    }

    const formattedProducts = products.map(product => ({
      ...product,
      price: product.price != null ? formatPrice(Number(product.price)) : 'Liên hệ'
    }));

    res.json({
      products: formattedProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Lấy chi tiết sản phẩm
router.get('/:id', async (req, res) => {
  try {
    const [products] = await db.promise().query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const [reviews] = await db.promise().query('SELECT * FROM ProductReviews WHERE product_id = ?', [req.params.id]);
    
    // Định dạng giá cho sản phẩm
    const formattedProduct = {
      ...products[0],
      price: formatPrice(products[0].price)
    };

    res.json({ ...formattedProduct, reviews });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy chi tiết sản phẩm theo tên
router.get('/by-name/:productName', async (req, res) => {
  try {
    const decodedProductName = decodeURIComponent(req.params.productName);
    console.log('Searching for product:', decodedProductName);

    const [products] = await db.promise().query('SELECT * FROM Products WHERE title = ?', [decodedProductName]);
    
    if (products.length === 0) {
      console.log('Product not found:', decodedProductName);
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    console.log('Product found:', product);

    const [reviews] = await db.promise().query('SELECT * FROM ProductReviews WHERE product_id = ?', [product.id]);
    
    const formattedProduct = {
      ...product,
      price: formatPrice(product.price),
      images: JSON.parse(product.images || '[]'),
      details: JSON.parse(product.details || '[]')
    };

    res.json({ ...formattedProduct, reviews });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Lấy sản phẩm theo thương hiệu
router.get('/brand/:brandName', async (req, res) => {
  try {
    const { brandName } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [products] = await db.promise().query(
      'SELECT * FROM Products WHERE brand = ? LIMIT ? OFFSET ?',
      [brandName, Number(limit), offset]
    );

    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as total FROM Products WHERE brand = ?',
      [brandName]
    );

    const totalProducts = countResult[0].total;

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this brand' });
    }

    const formattedProducts = products.map(product => ({
      ...product,
      price: formatPrice(product.price),
      thumbnail: JSON.parse(product.images || '[]')[0] || '', // Lấy ảnh đầu tiên làm thumbnail
    }));

    res.json({
      products: formattedProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    console.error('Get products by brand error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Thêm đánh giá sản phẩm
router.post('/:id/reviews', async (req, res) => {
  const { rating, comment, reviewer_name } = req.body;
  try {
    const [result] = await db.promise().query(
      'INSERT INTO ProductReviews (product_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)',
      [req.params.id, rating, comment, reviewer_name]
    );
    res.status(201).json({ message: 'Review added', id: result.insertId });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;