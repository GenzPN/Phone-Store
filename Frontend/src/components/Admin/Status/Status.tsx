import React from 'react';
import { Steps } from 'antd';

const { Step } = Steps;

const Status = ({ currentStatus }) => {
  const steps = [
    { title: 'Order Placed', description: 'Your order has been received' },
    { title: 'Processing', description: 'We are preparing your order' },
    { title: 'Shipped', description: 'Your order is on its way' },
    { title: 'Delivered', description: 'Order has been delivered' },
  ];

  const getCurrentStep = () => {
    if (!currentStatus) return 0; // Default to first step if no status is provided
    return steps.findIndex(step => step.title.toLowerCase() === currentStatus.toLowerCase()) || 0;
  };

  return (
    <Steps current={getCurrentStep()} direction="vertical">
      {steps.map(step => (
        <Step key={step.title} title={step.title} description={step.description} />
      ))}
    </Steps>
  );
};

export default Status;
