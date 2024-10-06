import React from 'react';
import { Result, Button } from 'antd';
import { Link, useParams } from 'react-router-dom';
import { ShoppingOutlined } from '@ant-design/icons';

const Status: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();

  return (
    <Result
      status="success"
      title="Đặt hàng thành công!"
      subTitle={`Mã đơn hàng: ${orderId}. Cảm ơn bạn đã mua hàng tại cửa hàng chúng tôi.`}
      extra={[
        <Button type="primary" key="console">
          <Link to={`/order/`}>Xem chi tiết đơn hàng</Link>
        </Button>,
        <Button key="buy" icon={<ShoppingOutlined />}>
          <Link to="/products">Tiếp tục mua sắm</Link>
        </Button>,
      ]}
    />
  );
};

export default Status;
