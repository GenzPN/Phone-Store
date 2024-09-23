const express = require('express');
const router = express.Router();

// Lưu đơn hàng vào cookie
router.post('/save-order', (req, res) => {
  const order = req.body;
  const orderString = JSON.stringify(order);

  res.cookie('lastOrder', orderString, { 
    maxAge: 24 * 60 * 60 * 1000, // Cookie hết hạn sau 24 giờ
    httpOnly: true
  });

  res.json({ message: 'Đơn hàng đã được lưu vào cookie' });
});

// Đọc đơn hàng từ cookie
router.get('/get-last-order', (req, res) => {
  const lastOrder = req.cookies.lastOrder;
  if (lastOrder) {
    const order = JSON.parse(lastOrder);
    res.json(order);
  } else {
    res.json({ message: 'Không tìm thấy đơn hàng nào' });
  }
});

// Xóa cookie đơn hàng
router.get('/clear-order', (req, res) => {
  res.clearCookie('lastOrder');
  res.json({ message: 'Cookie đơn hàng đã được xóa' });
});

module.exports = router;
