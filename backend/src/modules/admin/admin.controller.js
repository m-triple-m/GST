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

// ── Admin Account Management (super_admin only) ──────────

const getAdminAccounts = async (req, res, next) => {
  try {
    const accounts = await service.listAdminAccounts();
    sendSuccess(res, 200, 'Admin accounts', accounts);
  } catch (err) { next(err); }
};

const addAdminAccount = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return next(require('../../utils/ApiError').badRequest('Email and password are required'));
    }
    const account = await service.createAdminAccount({ email, password, role });
    sendSuccess(res, 201, 'Admin account created', account);
  } catch (err) { next(err); }
};

const verifyOwnPassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password) {
      return next(require('../../utils/ApiError').badRequest('Password is required'));
    }
    await service.verifyOwnPassword(req.user.id, password);
    sendSuccess(res, 200, 'Password verified', { verified: true });
  } catch (err) { next(err); }
};

module.exports = { getStats, getAuditLog, getAdminAccounts, addAdminAccount, verifyOwnPassword };
