'use strict';
const bcrypt   = require('bcrypt');
const jwt      = require('jsonwebtoken');
const config   = require('../../config/env');
const ApiError = require('../../utils/ApiError');
const repo     = require('./auth.repository');

// ── Token helpers ────────────────────────────────────────

const generateAccessToken = (payload) =>
  jwt.sign(payload, config.jwt.accessSecret, { expiresIn: config.jwt.accessExpires });

const generateRefreshToken = (payload) =>
  jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: config.jwt.refreshExpires });

const getRefreshExpiry = () => {
  // "7d" → now + 7 days as a MySQL-compatible datetime string
  const ms = 7 * 24 * 60 * 60 * 1000;
  return new Date(Date.now() + ms).toISOString().slice(0, 19).replace('T', ' ');
};

// ── Service methods ──────────────────────────────────────

const register = async ({ email, password, firstName, lastName }) => {
  const existing = await repo.findUserByEmail(email);
  if (existing) throw ApiError.conflict('An account with this email already exists');

  const hash   = await bcrypt.hash(password, config.bcryptSaltRounds);
  const userId = await repo.createUser(email, hash);
  await repo.createMember(userId, firstName, lastName);

  const payload = { id: userId, email, role: 'member' };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await repo.saveRefreshToken(userId, refreshToken, getRefreshExpiry());

  return { accessToken, refreshToken, user: { id: userId, email, role: 'member' } };
};

const login = async ({ email, password }) => {
  const user = await repo.findUserByEmail(email);
  if (!user) throw ApiError.unauthorized('Invalid email or password');
  if (!user.is_active) throw ApiError.unauthorized('Your account has been deactivated');

  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) throw ApiError.unauthorized('Invalid email or password');

  const payload = { id: user.id, email: user.email, role: user.role };
  const accessToken  = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  await repo.saveRefreshToken(user.id, refreshToken, getRefreshExpiry());

  return {
    accessToken,
    refreshToken,
    user: { id: user.id, email: user.email, role: user.role },
  };
};

const refreshAccessToken = async (refreshToken) => {
  // 1. Verify signature & expiry
  let decoded;
  try {
    decoded = jwt.verify(refreshToken, config.jwt.refreshSecret);
  } catch {
    throw ApiError.unauthorized('Invalid or expired refresh token');
  }

  // 2. Check the token is still in DB (not revoked)
  const stored = await repo.findRefreshToken(refreshToken);
  if (!stored) throw ApiError.unauthorized('Refresh token has been revoked');

  const user = await repo.findUserById(decoded.id);
  if (!user || !user.is_active) throw ApiError.unauthorized('User not found or deactivated');

  const payload     = { id: user.id, email: user.email, role: user.role };
  const newAccess   = generateAccessToken(payload);
  const newRefresh  = generateRefreshToken(payload);

  // Rotate: delete old, save new
  await repo.deleteRefreshToken(refreshToken);
  await repo.saveRefreshToken(user.id, newRefresh, getRefreshExpiry());

  return { accessToken: newAccess, refreshToken: newRefresh };
};

const logout = async (refreshToken) => {
  await repo.deleteRefreshToken(refreshToken);
};

const logoutAll = async (userId) => {
  await repo.deleteAllUserRefreshTokens(userId);
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const user = await repo.findUserByIdWithHash(userId);
  if (!user) throw ApiError.notFound('User not found');

  const match = await bcrypt.compare(currentPassword, user.password_hash);
  if (!match) throw ApiError.unauthorized('Current password is incorrect');

  const newHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  await repo.updateUserPassword(userId, newHash);
};

module.exports = { register, login, refreshAccessToken, logout, logoutAll, changePassword };
