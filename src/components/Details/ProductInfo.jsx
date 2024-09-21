import React, { useState } from 'react';
import { Card, Typography, List, Button, Modal, Row, Col } from 'antd';

const { Title, Text } = Typography;

const productInfo = [
  {
    category: 'Màn hình',
    items: [
      { label: 'Kích thước màn hình', value: '6.7 inches' },
      { label: 'Công nghệ màn hình', value: 'Super Retina XDR OLED' },
      { label: 'Độ phân giải màn hình', value: '2796 x 1290-pixel' },
      { label: 'Tính năng màn hình', value: 'Tốc độ làm mới 120Hz\n460 ppi\n2000 nits\nHDR\nTrue Tone\nDải màu rộng (P3)\nHaptic Touch\nTỷ lệ tương phản 2.000.000:1' },
      { label: 'Tần số quét', value: '120Hz' },
      { label: 'Kiểu màn hình', value: 'Dynamic Island' },
    ]
  },
  {
    category: 'Camera sau',
    items: [
      { label: 'Camera sau', value: 'Camera chính: 48MP, 24 mm, ƒ/1.78\nCamera góc siêu rộng: 12 MP, 13 mm, ƒ/2.2\nCamera Tele: 12 MP' },
      { label: 'Quay video', value: '4K@24/25/30/60 fps\nHD 1080p@25/30/60 fps\nHD 720p@30 fps' },
      { label: 'Tính năng camera', value: 'Flash True Tone Thích Ứng\nPhotonic Engine\nDeep Fusion\nHDR thông minh thế hệ 5\nẢnh chân dung thế hệ mới với Focus và Depth Control\nHiệu ứng Chiếu Sáng Chân Dung với sáu chế độ\nChế độ Ban Đêm' },
    ]
  },
  {
    category: 'Camera trước',
    items: [
      { label: 'Camera trước', value: '12MP, ƒ/1.9' },
      { label: 'Quay video trước', value: '4K@24/25/30/60 fps\nHD 1080p@25/30/60 fps' },
    ]
  },
  {
    category: 'Vi xử lý & đồ họa',
    items: [
      { label: 'Chipset', value: 'Apple A17 Pro 6 nhân' },
      { label: 'Loại CPU', value: 'CPU 6 lõi mới với 2 lõi hiệu năng và 4 lõi hiệu suất' },
      { label: 'GPU', value: 'GPU 6 nhân mới' },
    ]
  },
  {
    category: 'Giao tiếp & kết nối',
    items: [
      { label: 'Công nghệ NFC', value: 'Có' },
      { label: 'Thẻ SIM', value: '2 SIM (nano‑SIM và eSIM)' },
      { label: 'Hệ điều hành', value: 'iOS 17' },
      { label: 'Hồng ngoại', value: 'Có' },
      { label: 'Jack tai nghe 3.5', value: 'Không' },
      { label: 'Hỗ trợ mạng', value: '5G' },
      { label: 'Wi-Fi', value: 'Wi‑Fi 6E (802.11ax)' },
      { label: 'Bluetooth', value: 'v5.3' },
      { label: 'GPS', value: 'GPS tần số kép chính xác (GPS, GLONASS, Galileo, QZSS, BeiDou và NavIC)' },
    ]
  },
  {
    category: 'RAM & lưu trữ',
    items: [
      { label: 'Dung lượng RAM', value: '8 GB' },
      { label: 'Bộ nhớ trong', value: '256 GB' },
      { label: 'Khe cắm thẻ nhớ', value: 'Không' },
    ]
  },
  {
    category: 'Pin & công nghệ sạc',
    items: [
      { label: 'Pin', value: '4422 mAh' },
      { label: 'Công nghệ sạc', value: 'Sạc nhanh 20 W\nSạc không dây 15W\nSạc không dây Qi 7.5W' },
      { label: 'Cổng sạc', value: 'USB Type-C' },
    ]
  },
  {
    category: 'Thiết kế & Trọng lượng',
    items: [
      { label: 'Kích thước', value: '159,9 x 76,7 x 8,25 mm' },
      { label: 'Trọng lượng', value: '221 g' },
      { label: 'Chất liệu mặt lưng', value: 'Kính' },
      { label: 'Chất liệu khung viền', value: 'Titanium' },
    ]
  },
  {
    category: 'Thông số khác',
    items: [
      { label: 'Chỉ số kháng nước, bụi', value: 'Đạt mức IP68 (chống nước ở độ sâu tối đa 6 mét trong vòng tối đa 30 phút)' },
      { label: 'Công nghệ - Tiện ích', value: 'Camera TrueDepth hỗ trợ nhận diện khuôn mặt' },
      { label: 'Tiện ích khác', value: 'SOS Khẩn Cấp\nPhát Hiện Va Chạm' },
      { label: 'Công nghệ âm thanh', value: 'AAC, MP3, Apple Lossless, FLAC, Dolby Digital, Dolby Digital Plus và Dolby Atmos' },
      { label: 'Cảm biến vân tay', value: 'Không' },
      { label: 'Các loại cảm biến', value: 'Cảm biến gia tốc, Cảm biến tiệm cận, Cảm biến ánh sáng, La bàn, Con quay hồi chuyển, Cảm biến áp kế, Cảm biến trọng lực' },
      { label: 'Tính năng đặc biệt', value: 'Hỗ trợ 5G, Sạc không dây, Nhận diện khuôn mặt, Kháng nước, kháng bụi' },
    ]
  },
    {
        category: 'Tiện ích khác',
        items: [
        { label: 'Cảm biến vân tay', value: 'Không' },
        { label: 'Các loại cảm biến', value: 'Cảm biến gia tốc, Cảm biến tiệm cận, Cảm biến ánh sáng, La bàn, Con quay hồi chuyển, Cảm biến áp kế, Cảm biến trọng lực' },
        { label: 'Tính năng đặc biệt', value: 'Hỗ trợ 5G, Sạc không dây, Nhận diện khuôn mặt, Kháng nước, kháng bụi' },
        ]
    },
    {
      category: 'Thông tin chung',
      items: [
      { label: 'Thời điểm ra mắt', value: '09/2023' },
    ]
  },
];

const ProductInfo = () => {
  const [modalVisible, setModalVisible] = useState(false);

  const renderCategory = (category, items) => (
    <div key={category} style={{ marginBottom: '20px' }}>
      <Title level={5} strong>{category}</Title>
      <List
        itemLayout="horizontal"
        dataSource={items}
        renderItem={item => (
          <List.Item>
            <Row style={{ width: '100%' }}>
              <Col span={12}>
                <Text strong>{item.label}</Text>
              </Col>
              <Col span={12} style={{ textAlign: 'right' }}>
                <Text strong>{item.value}</Text>
              </Col>
            </Row>
          </List.Item>
        )}
      />
    </div>
  );

  const limitedInfo = [
    {
      ...productInfo[0],
      items: productInfo[0].items.slice(0, 3) // Show only up to "Độ phân giải màn hình"
    }
  ];

  return (
    <Card title={<Title level={4}>Thông số kỹ thuật</Title>}>
      {limitedInfo.map(({ category, items }) => renderCategory(category, items))}
      <Button onClick={() => setModalVisible(true)} style={{ marginTop: 16 }}>Xem thêm</Button>

      <Modal
        title="Thông số kỹ thuật chi tiết"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={700}
        bodyStyle={{ maxHeight: '80vh', overflowY: 'auto', padding: '0 24px' }}
      >
        <div style={{ padding: '0 20px' }}>
          {productInfo.map(({ category, items }) => renderCategory(category, items))}
        </div>
      </Modal>
    </Card>
  );
};

export default ProductInfo;