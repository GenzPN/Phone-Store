import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const [products] = await db.promise().query(
      'SELECT * FROM Products LIMIT ? OFFSET ?',
      [Number(limit), offset]
    );

    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as total FROM Products'
    );

    const totalProducts = countResult[0].total;

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      name: product.title,
      price: Number(product.price),
      thumbnail: product.thumbnail, // Sử dụng trực tiếp trường thumbnail
      brand: product.brand
    }));

    res.json({
      products: formattedProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ message: 'Internal server error' });
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
    
    const formattedProduct = {
      ...products[0],
      price: Number(products[0].price),
      images: JSON.parse(products[0].images || '[]'),
      category: products[0].category,
      screen: products[0].screen,
      back_camera: products[0].back_camera,
      front_camera: products[0].front_camera,
      ram: products[0].ram,
      storage: products[0].storage,
      battery: products[0].battery
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
      price: Number(product.price),
      thumbnail: product.thumbnail, // Sử dụng trực tiếp trường thumbnail
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

export { router as publicProductRoutes };