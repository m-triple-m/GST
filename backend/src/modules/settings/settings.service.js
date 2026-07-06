'use strict';
const repo = require('./settings.repository');

const getSettings = async () => {
  return await repo.getSettings();
};

const updateSettings = async (data) => {
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      await repo.updateSetting(key, String(value));
    }
  }
  return await repo.getSettings();
};

module.exports = {
  getSettings,
  updateSettings
};
