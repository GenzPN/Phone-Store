import React, { useState, useEffect } from 'react';
import { Form, Input, InputNumber, Button, message, Tabs } from 'antd';
import axios from 'axios';

const Settings: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get<AdminSettings>('http://localhost:5000/api/admin/settings', {
          headers: { 
            'Content-Type': 'application/json'
          }
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
      const response = await axios.put('http://localhost:5000/api/admin/settings', values, {
        headers: { 
          'Content-Type': 'application/json'
        }
      });
      if (response.data.message === 'Đã lưu cài đặt') {
        message.success('Đã lưu cài đặt');
      } else {
        message.error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      message.error('Failed to update settings');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  const tabItems = [
    {
      key: '1',
      label: 'Website',
      children: (
        <>
          <Form.Item name={['website', 'name']} label="Website Name" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name={['website', 'logo']} label="Logo URL">
            <Input />
          </Form.Item>
        </>
      ),
    },
    {
      key: '2',
      label: 'Bank',
      children: (
        <>
          <Form.Item name={['bank', 'name']} label="Bank Name">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'logo']} label="Bank Logo URL">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'token']} label="Bank Token">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'accountHolder']} label="Account Holder">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'accountNumber']} label="Account Number">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'transferContent']} label="Transfer Content">
            <Input />
          </Form.Item>
          <Form.Item name={['bank', 'orderTimeout']} label="Order Timeout (minutes)">
            <InputNumber min={1} />
          </Form.Item>
        </>
      ),
    },
    {
      key: '3',
      label: 'Momo',
      children: (
        <>
          <Form.Item name={['momo', 'name']} label="Momo Name">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'logo']} label="Momo Logo URL">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'accountHolder']} label="Account Holder">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'accountNumber']} label="Account Number">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'transferContent']} label="Transfer Content">
            <Input />
          </Form.Item>
          <Form.Item name={['momo', 'orderTimeout']} label="Order Timeout (minutes)">
            <InputNumber min={1} />
          </Form.Item>
        </>
      ),
    },
  ];

  return (
    <div>
      <h1>Admin Settings</h1>
      <Form form={form} onFinish={onFinish} layout="vertical">
        <Tabs defaultActiveKey="1" items={tabItems} />
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