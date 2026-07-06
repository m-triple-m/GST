'use strict';
const service = require('./settings.service');

const getSettings = async (req, res, next) => {
  try {
    const settings = await service.getSettings();
    res.json({ success: true, data: settings });
  } catch (err) {
    next(err);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const updated = await service.updateSettings(req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getSettings,
  updateSettings
};
