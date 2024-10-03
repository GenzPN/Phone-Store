import fs from 'fs/promises';
import path from 'path';

const configPath = path.join(process.cwd(), 'config', 'config.json');

export async function getConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    return null;
  }
}

export async function updateConfig(newConfig) {
  try {
    // Đọc cấu hình hiện tại
    const currentConfig = await getConfig();
    if (!currentConfig) {
      throw new Error('Unable to read current configuration');
    }

    // Merge cấu hình mới với cấu hình hiện tại
    const updatedConfig = {
      ...currentConfig,
      ...newConfig,
      website: { ...currentConfig.website, ...newConfig.website },
      bank: { ...currentConfig.bank, ...newConfig.bank },
      momo: { ...currentConfig.momo, ...newConfig.momo },
    };

    // Ghi cấu hình đã được cập nhật vào file
    await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating config file:', error);
    return false;
  }
}