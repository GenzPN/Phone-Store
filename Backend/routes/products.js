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
  try {
    const { page = 1, limit = 20, brand, isFeatured } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM Products WHERE 1=1';
    const queryParams = [];

    if (brand) {
      query += ' AND brand IN (?)';
      queryParams.push(brand.split(','));
    }

    if (isFeatured !== undefined) {
      query += ' AND is_featured = ?';
      queryParams.push(isFeatured);
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), offset);

    const [products] = await db.promise().query(query, queryParams);

    const [countResult] = await db.promise().query(
      'SELECT COUNT(*) as total FROM Products WHERE 1=1' +
      (brand ? ' AND brand IN (?)' : '') +
      (isFeatured !== undefined ? ' AND is_featured = ?' : ''),
      brand ? [brand.split(','), isFeatured] : [isFeatured]
    );

    const totalProducts = countResult[0].total;

    const formattedProducts = products.map(product => ({
      ...product,
      price: formatPrice(product.price),
      images: JSON.parse(product.images || '[]'),
      category: product.category,
      screen: product.screen,
      back_camera: product.back_camera,
      front_camera: product.front_camera,
      ram: product.ram,
      storage: product.storage,
      battery: product.battery
    }));

    console.log('Sending products:', formattedProducts);

    res.json({
      products: formattedProducts,
      currentPage: Number(page),
      totalPages: Math.ceil(totalProducts / limit),
      totalProducts
    });
  } catch (error) {
    console.error('Error fetching products:', error);
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
      price: formatPrice(products[0].price),
      images: JSON.parse(products[0].images || '[]'),
      category: products[0].category,
      screen: products[0].screen,
      back_camera: products[0].back_camera,
      front_camera: products[0].front_camera,
      ram: products[0].ram,
      storage: products[0].storage,
      battery: products[0].battery
    };

    console.log('Sending product details:', formattedProduct);

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

// Cập nhật sản phẩm
router.put('/:id', authenticateToken, async (req, res) => {
  const { 
    title, description, price, stock, brand, thumbnail, images, 
    screen, back_camera, front_camera, ram, storage, battery, category,
    sku, warranty_information, shipping_information, availability_status,
    return_policy, minimum_order_quantity, discount_percentage, is_featured, featured_sort_order
  } = req.body;
  
  console.log('Received Product Data:', req.body); // Log the entire request body
  console.log('Images before stringify:', images); // Log the images before stringifying

  try {
    // Check user role
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Bạn không có quyền cập nhật sản phẩm này' });
    }

    const [result] = await db.promise().query(
      `UPDATE Products SET 
        title = ?, description = ?, price = ?, stock = ?, brand = ?, 
        thumbnail = ?, images = ?, screen = ?, back_camera = ?, 
        front_camera = ?, ram = ?, storage = ?, battery = ?, category = ?,
        sku = ?, warranty_information = ?, shipping_information = ?, availability_status = ?,
        return_policy = ?, minimum_order_quantity = ?, discount_percentage = ?, is_featured = ?, featured_sort_order = ?
      WHERE id = ?`,
      [
        title, description, price, stock, brand, thumbnail, 
        JSON.stringify(images), screen, back_camera, front_camera, 
        ram, storage, battery, category, sku, warranty_information, shipping_information, availability_status,
        return_policy, minimum_order_quantity, discount_percentage, is_featured, featured_sort_order, req.params.id
      ]
    );

    console.log('Update result:', result); // Log the result of the update query

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Sản phẩm không tồn tại' });
    }
    res.status(200).json({ message: 'Sản phẩm đã được cập nhật' });
  } catch (error) {
    console.error('Lỗi khi cập nhật sản phẩm:', error);
    res.status(500).json({ message: 'Lỗi server nội bộ', error: error.message });
  }
});

module.exports = router;