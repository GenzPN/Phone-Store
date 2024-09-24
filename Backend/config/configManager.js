const fs = require('fs').promises;
const path = require('path');

const configPath = path.join(__dirname, '..', 'config.json');

async function readConfig() {
  try {
    const data = await fs.readFile(configPath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading config file:', error);
    return {};
  }
}

async function writeConfig(config) {
  try {
    await fs.writeFile(configPath, JSON.stringify(config, null, 2));
  } catch (error) {
    console.error('Error writing config file:', error);
  }
}

async function getAdminSettings() {
  const config = await readConfig();
  return config.adminSettings || {};
}

async function updateAdminSettings(newSettings) {
  const config = await readConfig();
  config.adminSettings = { ...config.adminSettings, ...newSettings };
  await writeConfig(config);
  return config.adminSettings;
}

module.exports = {
  getAdminSettings,
  updateAdminSettings
};
