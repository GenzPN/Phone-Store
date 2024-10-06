import React from 'react';
import { Card, Avatar, Typography, Row, Col, Descriptions } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Profile.css';
import { User } from '../../types/user';

const { Title } = Typography;

interface ProfileProps {
  user: User | null;
}

// Hàm chuyển đổi giới tính (để đảm bảo)
const translateGender = (gender: string): string => {
  switch (gender.toLowerCase()) {
    case 'male':
      return 'Nam';
    case 'female':
      return 'Nữ';
    case 'other':
      return 'Khác';
    default:
      return gender;
  }
};

const Profile: React.FC<ProfileProps> = ({ user }) => {
  if (!user) {
    return <Typography.Text>Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</Typography.Text>;
  }

  return (
    <Card className="profile-card">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8} md={6} lg={4}>
          <Avatar size={120} src={user.image} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title level={2}>{user.fullName}</Title>
          <Descriptions column={1}>
            <Descriptions.Item label="Tên người dùng">{user.username}</Descriptions.Item>
            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
            <Descriptions.Item label="Giới tính">{translateGender(user.gender)}</Descriptions.Item>
            {user.created_at && (
              <Descriptions.Item label="Đăng ký từ">{new Date(user.created_at).toLocaleDateString()}</Descriptions.Item>
            )}
          </Descriptions>
        </Col>
      </Row>
    </Card>
  );
};

export default Profile;