import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Switch, Button, message } from 'antd';
import axios from 'axios';

interface AdminSettings {
  siteName: string;
  logoUrl: string;
  theme: string;
  language: string;
  itemsPerPage: number;
  enableNotifications: boolean;
}

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<AdminSettings>('http://localhost:5000/api/settings', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          withCredentials: true
        });
        form.setFieldsValue(response.data);
      } catch (error) {
        console.error('Error fetching settings:', error);
        message.error('Failed to fetch settings');
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, [form]);

  const onFinish = async (values: AdminSettings) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('http://localhost:5000/api/settings', values, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        withCredentials: true
      });
      message.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Admin Settings</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Form.Item name="siteName" label="Site Name" rules={[{ required: true }]}>
          <Input />
        </Form.Item>
        <Form.Item name="logoUrl" label="Logo URL">
          <Input />
        </Form.Item>
        <Form.Item name="theme" label="Theme">
          <Input />
        </Form.Item>
        <Form.Item name="language" label="Language">
          <Input />
        </Form.Item>
        <Form.Item name="itemsPerPage" label="Items Per Page" rules={[{ type: 'number', min: 1 }]}>
          <InputNumber />
        </Form.Item>
        <Form.Item name="enableNotifications" label="Enable Notifications" valuePropName="checked">
          <Switch />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Save Settings
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default Settings;
