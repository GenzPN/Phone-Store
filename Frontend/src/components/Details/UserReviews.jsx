import React, { useState } from 'react';
import { Card, Typography, Rate, Button, List, Avatar, Modal, Radio, Pagination } from 'antd';

const { Title, Text } = Typography;

const reviews = [
  { id: 1, user: 'Minh', rating: 5, comment: 'Sản phẩm tuyệt vời, đáng giá từng đồng!' },
  { id: 2, user: 'Hương', rating: 4, comment: 'Chất lượng tốt, giao hàng nhanh.' },
  { id: 3, user: 'Tuấn', rating: 3, comment: 'Tạm được, cần cải thiện dịch vụ khách hàng.' },
  { id: 4, user: 'Linh', rating: 5, comment: 'Rất hài lòng, sẽ mua lại!' },
  { id: 5, user: 'Hoàng', rating: 2, comment: 'Không như mong đợi, hơi thất vọng.' },
  { id: 6, user: 'Mai', rating: 4, comment: 'Giá cả hợp lý, sản phẩm ổn.' },
  { id: 7, user: 'Đức', rating: 5, comment: 'Xuất sắc! Không có gì để phàn nàn.' },
  { id: 8, user: 'Thảo', rating: 3, comment: 'Bình thường, không có gì đặc biệt.' },
  { id: 9, user: 'Phong', rating: 4, comment: 'Khá tốt, có thể cải thiện thêm.' },
  { id: 10, user: 'Hà', rating: 5, comment: 'Tuyệt vời, vượt quá mong đợi!' },
  { id: 11, user: 'Hà', rating: 1, comment: 'Quá tệ' },
  { id: 12, user: 'Tùng', rating: 4, comment: 'Sản phẩm chất lượng, đáng mua.' },
  { id: 13, user: 'Lan', rating: 5, comment: 'Rất ấn tượng với thiết kế và hiệu năng.' },
  { id: 14, user: 'Quang', rating: 3, comment: 'Ổn, nhưng pin hơi yếu.' },
  { id: 15, user: 'Ngọc', rating: 4, comment: 'Camera chụp đẹp, rất hài lòng.' },
  { id: 16, user: 'Trung', rating: 2, comment: 'Giao hàng chậm, sản phẩm tạm được.' },
  { id: 17, user: 'Hạnh', rating: 5, comment: 'Màn hình sắc nét, âm thanh tuyệt vời!' },
  { id: 18, user: 'Dũng', rating: 4, comment: 'Đáng tiền, sẽ giới thiệu cho bạn bè.' },
  { id: 19, user: 'Thủy', rating: 3, comment: 'Không tệ, nhưng cũng không quá xuất sắc.' },
  { id: 20, user: 'Sơn', rating: 5, comment: 'Cấu hình mạnh mẽ, chơi game rất mượt.' },
  { id: 21, user: 'Hồng', rating: 4, comment: 'Thiết kế đẹp, nhẹ và sang trọng.' },
  { id: 22, user: 'Bình', rating: 3, comment: 'Tính năng bảo mật tốt, nhưng giá hơi cao.' },
  { id: 23, user: 'Yến', rating: 5, comment: 'Chụp ảnh đẹp, pin trâu, rất hài lòng!' },
  { id: 24, user: 'Khoa', rating: 4, comment: 'Sản phẩm tốt, dịch vụ hậu mãi chu đáo.' },
  { id: 25, user: 'Trang', rating: 2, comment: 'Hơi thất vọng với chất lượng loa.' },
  { id: 26, user: 'Đạt', rating: 5, comment: 'Hoàn hảo từ A-Z, không có gì để chê.' },
  { id: 27, user: 'Vy', rating: 4, comment: 'Màu sắc đẹp, cầm rất vừa tay.' },
  { id: 28, user: 'Lâm', rating: 3, comment: 'Ổn định, nhưng cần cải thiện thời lượng pin.' },
  { id: 29, user: 'Quỳnh', rating: 5, comment: 'Rất hài lòng, xứng đáng với giá tiền bỏ ra.' },
  { id: 30, user: 'Kiên', rating: 4, comment: 'Hiệu năng tốt, camera chụp đẹp trong điều kiện thiếu sáng.' },
  { id: 31, user: 'Nhi', rating: 5, comment: 'Sản phẩm chính hãng, yên tâm sử dụng.' },
];

const UserReviews = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [filterRating, setFilterRating] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  const averageRating = (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1);

  const ReviewList = ({ data }) => (
    <List
      itemLayout="horizontal"
      dataSource={data}
      renderItem={item => (
        <List.Item>
          <List.Item.Meta
            avatar={<Avatar>{item.user[0]}</Avatar>}
            title={<><Rate disabled defaultValue={item.rating} /> {item.user}</>}
            description={item.comment}
          />
        </List.Item>
      )}
    />
  );

  const filteredReviews = filterRating === 0 ? reviews : reviews.filter(review => review.rating === filterRating);
  const paginatedReviews = filteredReviews.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <Card title={<Title level={4}>Đánh giá người dùng</Title>}>
      <Rate disabled allowHalf defaultValue={parseFloat(averageRating)} />
      <Text strong> {averageRating}/5</Text>
      <ReviewList data={reviews.slice(0, 2)} />
      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'space-between' }}>
        <Button onClick={() => setModalVisible(true)}>Xem thêm</Button>
        <Button type="primary">Đánh giá ngay</Button>
      </div>
      <Modal
        title="Tất cả đánh giá"
        visible={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
      >
        <Radio.Group 
          onChange={(e) => {
            setFilterRating(e.target.value);
            setCurrentPage(1);
          }} 
          value={filterRating}
          style={{ marginBottom: 16 }}
        >
          <Radio.Button value={0}>Tất cả</Radio.Button>
          <Radio.Button value={5}>5 sao</Radio.Button>
          <Radio.Button value={4}>4 sao</Radio.Button>
          <Radio.Button value={3}>3 sao</Radio.Button>
          <Radio.Button value={2}>2 sao</Radio.Button>
          <Radio.Button value={1}>1 sao</Radio.Button>
        </Radio.Group>
        <ReviewList data={paginatedReviews} />
        {filteredReviews.length > pageSize && (
          <Pagination
            current={currentPage}
            total={filteredReviews.length}
            pageSize={pageSize}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: 16, textAlign: 'right' }}
          />
        )}
      </Modal>
    </Card>
  );
};

export default UserReviews;