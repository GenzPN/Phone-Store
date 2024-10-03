import express from 'express';
import db from '../config/database.js';

const router = express.Router();

// Lấy danh sách sản phẩm
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, brand, isFeatured } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM Products';
    let queryParams = [];
    let countQuery = 'SELECT COUNT(*) as total FROM Products';

    if (brand || isFeatured !== undefined) {
      query += ' WHERE';
      countQuery += ' WHERE';
      const conditions = [];

      if (brand) {
        conditions.push('brand = ?');
        queryParams.push(brand);
      }

      if (isFeatured !== undefined) {
        conditions.push('is_featured = ?');
        queryParams.push(isFeatured === '1' ? 1 : 0);
      }

      query += ' ' + conditions.join(' AND ');
      countQuery += ' ' + conditions.join(' AND ');
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), offset);

    const [products] = await db.query(query, queryParams);
    const [countResult] = await db.query(countQuery, queryParams.slice(0, -2));

    const totalProducts = countResult[0].total;

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found' });
    }

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      stock: product.stock,
      thumbnail: product.thumbnail,
      images: JSON.parse(product.images || '[]'),
      category: product.category,
      screen: product.screen,
      back_camera: product.back_camera,
      front_camera: product.front_camera,
      ram: product.ram,
      storage: product.storage,
      battery: product.battery,
      sku: product.sku,
      warranty_information: product.warranty_information,
      shipping_information: product.shipping_information,
      availability_status: product.availability_status,
      return_policy: product.return_policy,
      minimum_order_quantity: product.minimum_order_quantity,
      discount_percentage: Number(product.discount_percentage),
      is_featured: product.is_featured,
      featured_sort_order: product.featured_sort_order,
      brand: product.brand,
      description: product.description
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
    const [products] = await db.query('SELECT * FROM Products WHERE id = ?', [req.params.id]);
    if (products.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const [reviews] = await db.query('SELECT * FROM ProductReviews WHERE product_id = ?', [req.params.id]);
    
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

    const [products] = await db.query(
      'SELECT * FROM Products WHERE brand = ? LIMIT ? OFFSET ?',
      [brandName, Number(limit), offset]
    );

    const [countResult] = await db.query(
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