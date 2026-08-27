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
  const [logs, total] = await Promise.all([
    repo.getAuditLog({ limit, offset }),
    repo.countAuditLog(),
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

/**
 * verifyOwnPassword — password-wall check.
 * Used by the frontend before showing the "Add Admin" form.
 * Compares the submitted plain-text password against the caller's stored hash.
 */
const verifyOwnPassword = async (userId, password) => {
  const authRepo = require('../auth/auth.repository');
  const user = await authRepo.findUserByIdWithHash(userId);
  if (!user) throw ApiError.notFound('User not found');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized('Incorrect password');
  return true;
};

module.exports = { getStats, getAuditLog, listAdminAccounts, createAdminAccount, verifyOwnPassword };
