import React from 'react';
import { Card, Avatar, Typography, Row, Col } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import './Profile.css';

const { Title, Text } = Typography;

interface ProfileProps {
  user: {
    id: number;
    username: string;
    email: string;
    fullName: string;
    gender: string;
    image: string;
  } | null;
}

const Profile: React.FC<ProfileProps> = ({ user }) => {
  if (!user) {
    return <Text>Không thể tải thông tin người dùng. Vui lòng đăng nhập lại.</Text>;
  }

  return (
    <Card className="profile-card">
      <Row gutter={[16, 16]} align="middle">
        <Col xs={24} sm={8} md={6} lg={4}>
          <Avatar size={120} src={user.image} icon={<UserOutlined />} />
        </Col>
        <Col xs={24} sm={16} md={18} lg={20}>
          <Title level={2}>{user.fullName}</Title>
          <Text strong>Username: </Text><Text>{user.username}</Text><br />
          <Text strong>Email: </Text><Text>{user.email}</Text><br />
          <Text strong>Gender: </Text><Text>{user.gender}</Text><br />
        </Col>
      </Row>
    </Card>
  );
};

export default Profile;