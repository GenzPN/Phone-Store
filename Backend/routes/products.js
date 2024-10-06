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
    const { page = 1, limit = 12, sort = '' } = req.query;
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM Products WHERE brand = ?';
    let queryParams = [brandName];

    if (sort === 'asc' || sort === 'desc') {
      query += ` ORDER BY price ${sort.toUpperCase()}`;
    }

    query += ' LIMIT ? OFFSET ?';
    queryParams.push(Number(limit), offset);

    const [products] = await db.query(query, queryParams);

    const [countResult] = await db.query(
      'SELECT COUNT(*) as total FROM Products WHERE brand = ?',
      [brandName]
    );

    const totalProducts = countResult[0].total;

    if (!products || products.length === 0) {
      return res.status(404).json({ message: 'No products found for this brand' });
    }

    const formattedProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      price: Number(product.price),
      thumbnail: product.thumbnail,
      brand: product.brand
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

// Thay đổi route để lấy chi tiết sản phẩm theo brand và tên sản phẩm
router.get('/:brand/:title', async (req, res) => {
  const { brand, title } = req.params;
  console.log('Searching for product:', { brand, title });
  try {
    const decodedBrand = decodeURIComponent(brand).replace(/\+/g, ' ').trim();
    const decodedTitle = decodeURIComponent(title).replace(/\+/g, ' ').replace(/-/g, ' ').trim();
    console.log('Decoded params:', { decodedBrand, decodedTitle });

    const query = 'SELECT * FROM Products WHERE LOWER(brand) = LOWER(?) AND LOWER(title) = LOWER(?)';
    console.log('Executing query:', query, [decodedBrand, decodedTitle]);

    const [products] = await db.query(query, [decodedBrand, decodedTitle]);
    console.log('Query result:', products);

    if (products.length === 0) {
      console.log('Product not found');
      return res.status(404).json({ message: 'Product not found' });
    }
    
    const product = products[0];
    console.log('Found product:', product);

    // Fetch reviews for the product
    const reviewsQuery = 'SELECT * FROM ProductReviews WHERE product_id = ?';
    const [reviews] = await db.query(reviewsQuery, [product.id]);
    console.log('Fetched reviews:', reviews);

    // Thêm thông số kỹ thuật
    const productDetails = [
      {
        category: 'Màn hình',
        items: [
          { label: 'Công nghệ màn hình', value: product.screen },
        ]
      },
      {
        category: 'Camera sau',
        items: [
          { label: 'Độ phân giải', value: product.back_camera }
        ]
      },
      {
        category: 'Camera trước',
        items: [
          { label: 'Độ phân giải', value: product.front_camera },
        ]
      },
      {
        category: 'Bộ nhớ & Lưu trữ',
        items: [
          { label: 'RAM', value: product.ram },
          { label: 'Bộ nhớ trong', value: product.storage },
        ]
      },
      {
        category: 'Pin & Sạc',
        items: [
          { label: 'Dung lượng pin', value: product.battery }
        ]
      },
    ];

    const formattedProduct = {
      ...product,
      price: Number(product.price),
      images: JSON.parse(product.images || '[]'),
      category: product.category,
      screen: product.screen,
      back_camera: product.back_camera,
      front_camera: product.front_camera,
      ram: product.ram,
      storage: product.storage,
      battery: product.battery,
      discount_percentage: Number(product.discount_percentage),
      warranty_information: product.warranty_information,
      shipping_information: product.shipping_information,
      availability_status: product.availability_status,
      return_policy: product.return_policy,
      reviews: reviews
    };

    res.json({ ...formattedProduct, details: productDetails });
  } catch (error) {
    console.error('Get product details error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

export { router as publicProductRoutes };