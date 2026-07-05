'use strict';
const db = require('../../config/db');

// ── Users ────────────────────────────────────────────────

const findUserByEmail = async (email) => {
  const [rows] = await db.execute(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE email = ? LIMIT 1',
    [email]
  );
  return rows[0] || null;
};

const findUserById = async (id) => {
  const [rows] = await db.execute(
    'SELECT id, email, role, is_active FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

const createUser = async (email, passwordHash, role = 'member') => {
  const [result] = await db.execute(
    'INSERT INTO users (email, password_hash, role) VALUES (?, ?, ?)',
    [email, passwordHash, role]
  );
  return result.insertId;
};

// ── Members (auto-create on register) ───────────────────

const createMember = async (userId, firstName, lastName) => {
  await db.execute(
    'INSERT INTO members (user_id, first_name, last_name) VALUES (?, ?, ?)',
    [userId, firstName, lastName]
  );
};

// ── Refresh Tokens ───────────────────────────────────────

const saveRefreshToken = async (userId, token, expiresAt) => {
  await db.execute(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt]
  );
};

const findRefreshToken = async (token) => {
  const [rows] = await db.execute(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > UTC_TIMESTAMP() LIMIT 1',
    [token]
  );
  return rows[0] || null;
};

const deleteRefreshToken = async (token) => {
  await db.execute('DELETE FROM refresh_tokens WHERE token = ?', [token]);
};

const deleteAllUserRefreshTokens = async (userId) => {
  await db.execute('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
};

const updateUserPassword = async (userId, newHash) => {
  await db.execute(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [newHash, userId]
  );
};

const findUserByIdWithHash = async (id) => {
  const [rows] = await db.execute(
    'SELECT id, email, password_hash, role, is_active FROM users WHERE id = ? LIMIT 1',
    [id]
  );
  return rows[0] || null;
};

// ── Password Reset OTPs ─────────────────────────────────

const createOtp = async (email, otpCode, expiresAt) => {
  // Invalidate any prior OTPs for this email first
  await db.execute('UPDATE password_reset_otps SET used = 1 WHERE email = ?', [email]);
  await db.execute(
    'INSERT INTO password_reset_otps (email, otp_code, expires_at) VALUES (?, ?, ?)',
    [email, otpCode, expiresAt]
  );
};

const findValidOtp = async (email, otpCode) => {
  const [rows] = await db.execute(
    'SELECT * FROM password_reset_otps WHERE email = ? AND otp_code = ? AND used = 0 AND expires_at > UTC_TIMESTAMP() LIMIT 1',
    [email, otpCode]
  );
  return rows[0] || null;
};

const markOtpUsed = async (id) => {
  await db.execute('UPDATE password_reset_otps SET used = 1 WHERE id = ?', [id]);
};

module.exports = {
  findUserByEmail,
  findUserById,
  findUserByIdWithHash,
  createUser,
  createMember,
  saveRefreshToken,
  findRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  updateUserPassword,
  createOtp,
  findValidOtp,
  markOtpUsed,
};
