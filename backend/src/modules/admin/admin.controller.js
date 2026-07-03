'use strict';
const service    = require('./admin.service');
const { sendSuccess } = require('../../utils/response');

const getStats = async (req, res, next) => {
  try {
    const data = await service.getStats();
    sendSuccess(res, 200, 'Dashboard stats', data);
  } catch (err) { next(err); }
};

const getAuditLog = async (req, res, next) => {
  try {
    const { logs, pagination } = await service.getAuditLog(req.query);
    sendSuccess(res, 200, 'Audit log', logs, pagination);
  } catch (err) { next(err); }
};

module.exports = { getStats, getAuditLog };
