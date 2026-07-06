'use strict';
const db = require('../../config/db');

const getSettings = async () => {
  const [rows] = await db.execute('SELECT setting_key, setting_value FROM system_settings');
  const settings = {};
  rows.forEach(r => {
    settings[r.setting_key] = r.setting_value;
  });
  return settings;
};

const updateSetting = async (key, value) => {
  await db.execute(
    'INSERT INTO system_settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?',
    [key, value, value]
  );
};

module.exports = {
  getSettings,
  updateSetting
};
