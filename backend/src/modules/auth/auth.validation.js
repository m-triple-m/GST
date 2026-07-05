'use strict';
const { body } = require('express-validator');

const registerValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number'),
  body('firstName')
    .trim().notEmpty().withMessage('First name is required')
    .isLength({ max: 100 }),
  body('lastName')
    .trim().notEmpty().withMessage('Last name is required')
    .isLength({ max: 100 }),
];

const loginValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
];

const refreshValidation = [
  body('refreshToken').notEmpty().withMessage('Refresh token is required'),
];

const changePasswordValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain a number'),
];

const forgotPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
];

const verifyOtpValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number')
    .isNumeric().withMessage('OTP must contain only digits'),
];

const resetPasswordValidation = [
  body('email')
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('otp')
    .isLength({ min: 6, max: 6 }).withMessage('OTP must be a 6-digit number')
    .isNumeric().withMessage('OTP must contain only digits'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('New password must contain an uppercase letter')
    .matches(/[0-9]/).withMessage('New password must contain a number'),
];

module.exports = {
  registerValidation,
  loginValidation,
  refreshValidation,
  changePasswordValidation,
  forgotPasswordValidation,
  verifyOtpValidation,
  resetPasswordValidation,
};
