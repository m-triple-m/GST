'use strict';
const bcrypt = require('bcrypt');
const repo   = require('./admin.repository');
const { buildPagination } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');

const SALT_ROUNDS = 12;

const getStats = () => repo.getDashboardStats();

const getAuditLog = async (query) => {
  const parsedPage = parseInt(query.page, 10);
  const parsedLimit = parseInt(query.limit, 10);
  const page   = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit  = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 20;
  const offset = (page - 1) * limit;

  const filters = {
    limit,
    offset,
    action_filter: query.action_filter || null,
    actor_id:      query.actor_id ? Number(query.actor_id) : null,
    date_from:     query.date_from || null,
    date_to:       query.date_to   || null,
  };

  const [logs, total] = await Promise.all([
    repo.getAuditLog(filters),
    repo.countAuditLog(filters),
  ]);
  return { logs, pagination: buildPagination(page, limit, total) };
};

// ── Admin Account Management (super_admin only) ──────────

const listAdminAccounts = () => repo.listAdminAccounts();

const createAdminAccount = async ({ email, password, role = 'admin' }) => {
  // Only 'admin' is allowed — the three roles are member, executive, admin
  if (role !== 'admin') {
    throw ApiError.badRequest('Role must be "admin"');
  }
  const existing = await require('../auth/auth.repository').findUserByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const newId = await repo.createAdminAccount(email, passwordHash, role);
  return { id: newId, email, role };
};

const verifyOwnPassword = async (userId, password) => {
  const authRepo = require('../auth/auth.repository');
  const user = await authRepo.findUserByIdWithHash(userId);
  if (!user) throw ApiError.notFound('User not found');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized('Incorrect password');
  return true;
};

const getRevenueAnalytics = (query) => repo.getRevenueAnalytics(query);

module.exports = {
  getStats,
  getAuditLog,
  listAdminAccounts,
  createAdminAccount,
  verifyOwnPassword,
  getRevenueAnalytics,
};
