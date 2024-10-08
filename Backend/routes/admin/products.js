import express from 'express';
import db from '../../config/database.js';

const router = express.Router();

// Định nghĩa các route ở đây
router.get('/', (req, res) => {
  // Xử lý GET request
});

// Thêm sản phẩm mới
router.post('/', async (req, res) => {
  try {
    const newProduct = req.body;

    // Chuẩn bị dữ liệu để thêm mới
    const {
      title, price, stock, thumbnail, images, category, screen, back_camera, front_camera,
      ram, storage, battery, sku, warranty_information, shipping_information,
      availability_status, return_policy, minimum_order_quantity, discount_percentage,
      is_featured, featured_sort_order, brand, description
    } = newProduct;

    // Thêm sản phẩm mới vào cơ sở dữ liệu
    const insertQuery = `
      INSERT INTO Products (
        title, price, stock, thumbnail, images, category, screen, back_camera, front_camera,
        ram, storage, battery, sku, warranty_information, shipping_information,
        availability_status, return_policy, minimum_order_quantity, discount_percentage,
        is_featured, featured_sort_order, brand, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const insertValues = [
      title, price, stock, thumbnail, JSON.stringify(images), category,
      screen, back_camera, front_camera, ram, storage, battery, sku,
      warranty_information, shipping_information, availability_status,
      return_policy, minimum_order_quantity, discount_percentage,
      is_featured, featured_sort_order, brand, description
    ];

    const [result] = await db.query(insertQuery, insertValues);

    res.status(201).json({ message: 'Product added successfully', productId: result.insertId });
  } catch (error) {
    console.error('Add product error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

// Cập nhật sản phẩm
router.put('/:id', async (req, res) => {
  try {
    const productId = req.params.id;
    const updatedProduct = req.body;

    // Kiểm tra xem sản phẩm có tồn tại không
    const [existingProduct] = await db.query('SELECT * FROM Products WHERE id = ?', [productId]);
    if (existingProduct.length === 0) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Chuẩn bị dữ liệu để cập nhật
    const {
      title, price, stock, thumbnail, images, category, screen, back_camera, front_camera,
      ram, storage, battery, sku, warranty_information, shipping_information,
      availability_status, return_policy, minimum_order_quantity, discount_percentage,
      is_featured, featured_sort_order, brand, description
    } = updatedProduct;

    // Cập nhật sản phẩm trong cơ sở dữ liệu
    const updateQuery = `
      UPDATE Products SET
        title = ?, price = ?, stock = ?, thumbnail = ?, images = ?, category = ?,
        screen = ?, back_camera = ?, front_camera = ?, ram = ?, storage = ?,
        battery = ?, sku = ?, warranty_information = ?, shipping_information = ?,
        availability_status = ?, return_policy = ?, minimum_order_quantity = ?,
        discount_percentage = ?, is_featured = ?, featured_sort_order = ?,
        brand = ?, description = ?
      WHERE id = ?
    `;

    const updateValues = [
      title, price, stock, thumbnail, JSON.stringify(images), category,
      screen, back_camera, front_camera, ram, storage, battery, sku,
      warranty_information, shipping_information, availability_status,
      return_policy, minimum_order_quantity, discount_percentage,
      is_featured, featured_sort_order, brand, description, productId
    ];

    await db.query(updateQuery, updateValues);

    res.json({ message: 'Product updated successfully', productId });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});

export { router as adminProductRoutes };