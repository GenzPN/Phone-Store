import React from 'react';
import { Card, Typography, List } from 'antd';
import { GiftOutlined, CreditCardOutlined, TagOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const benefits = [
  {
    icon: <GiftOutlined />,
    text: 'Xem chính sách ưu đãi dành cho thành viên Smember'
  },
  {
    icon: <CreditCardOutlined />,
    text: 'Giảm đến 2.000.000đ khi thanh toán bằng thẻ tín dụng VIB'
  },
  {
    icon: <TagOutlined />,
    text: 'Giảm đến 500K khi thanh toán bằng thẻ tín dụng HSBC'
  }
];

const benefits2 = [
    {
      icon: <DollarOutlined />,
      text: 'Máy mới 100% , chính hãng Apple Việt Nam.'
    },
    {
      icon: <CreditCardOutlined />,
      text: 'DVT hiện là đại lý bán lẻ uỷ quyền iPhone chính hãng VN/A của Apple Việt Nam'
    },
    {
      icon: <TagOutlined />,
      text: 'Hộp, Sách hướng dẫn, Cây lấy sim, Cáp Type C 1 ĐỔI 1 trong 30 ngày nếu có lỗi phần cứng nhà sản xuất. Bảo hành 12 tháng tại trung tâm bảo hành chính hãng Apple'
    },
    {
        icon: <TagOutlined />,
        text: 'Giá sản phẩm đã bao gồm VAT'
    }
  ];

const BenefitsCard = () => (
  <Card>
    <Title level={4} style={{ marginTop: '20px', textAlign: 'center' }}>Khuyến mãi khi mua</Title>
    <List
      itemLayout="horizontal"
      dataSource={benefits}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            avatar={item.icon}
            title={item.text}
          />
        </List.Item>
      )}
    />
    <Title level={4} style={{ marginTop: '20px', textAlign: 'center' }}>Thông tin sản phẩm</Title>
    <List
      itemLayout="horizontal"
      dataSource={benefits2}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            avatar={item.icon}
            title={item.text}
          />
        </List.Item>
      )}
    />
  </Card>
);

export default BenefitsCard;