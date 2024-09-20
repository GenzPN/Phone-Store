import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import 'antd/dist/reset.css';

const container = document.getElementById('root');
const root = createRoot(container!); // Sử dụng non-null assertion operator (!)
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);