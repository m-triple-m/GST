'use strict';
const { validationResult } = require('express-validator');
const authService  = require('./auth.service');
const { sendSuccess } = require('../../utils/response');
const ApiError     = require('../../utils/ApiError');

const register = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());

    const result = await authService.register(req.body);
    sendSuccess(res, 201, 'Account created successfully', result);
  } catch (err) { next(err); }
};

const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());

    const result = await authService.login(req.body);
    sendSuccess(res, 200, 'Login successful', result);
  } catch (err) { next(err); }
};

const refresh = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());

    const { refreshToken } = req.body;
    const tokens = await authService.refreshAccessToken(refreshToken);
    sendSuccess(res, 200, 'Token refreshed', tokens);
  } catch (err) { next(err); }
};

const logout = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await authService.logout(refreshToken);
    sendSuccess(res, 200, 'Logged out successfully');
  } catch (err) { next(err); }
};

const logoutAll = async (req, res, next) => {
  try {
    await authService.logoutAll(req.user.id);
    sendSuccess(res, 200, 'All sessions terminated');
  } catch (err) { next(err); }
};

const me = async (req, res, next) => {
  try {
    sendSuccess(res, 200, 'Current user', req.user);
  } catch (err) { next(err); }
};

const changePassword = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await authService.changePassword(req.user.id, req.body.currentPassword, req.body.newPassword);
    sendSuccess(res, 200, 'Password updated successfully');
  } catch (err) { next(err); }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return next(ApiError.badRequest('Email is required'));
    await authService.requestPasswordReset(email);
    // Always success — never confirm whether email exists
    sendSuccess(res, 200, 'If that email is registered, an OTP has been sent.');
  } catch (err) { next(err); }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return next(ApiError.badRequest('Email and OTP are required'));
    await authService.verifyOtp(email, otp);
    sendSuccess(res, 200, 'OTP verified successfully');
  } catch (err) { next(err); }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return next(ApiError.badRequest('Email, OTP and new password are required'));
    if (newPassword.length < 8) return next(ApiError.badRequest('Password must be at least 8 characters'));
    await authService.resetPasswordWithOtp(email, otp, newPassword);
    sendSuccess(res, 200, 'Password reset successfully. Please log in with your new password.');
  } catch (err) { next(err); }
};

module.exports = { register, login, refresh, logout, logoutAll, me, changePassword, forgotPassword, verifyOtp, resetPassword };
