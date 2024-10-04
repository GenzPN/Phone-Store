import { useState, useEffect } from 'react';
import api from '../utils/api';

interface WebsiteConfig {
  name: string;
  logo: string;
}

export const useConfig = () => {
  const [config, setConfig] = useState<WebsiteConfig | null>(null);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await api.get('/api/config');
        setConfig(response.data);
      } catch (error) {
        console.error('Error fetching config:', error);
      }
    };

    fetchConfig();
  }, []);

  return config;
};