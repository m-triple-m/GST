'use strict';
const { body, query } = require('express-validator');

const applyValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isMobilePhone().withMessage('Invalid phone number'),
  body('linkedin_url').optional().isURL().withMessage('Invalid LinkedIn URL'),
  body('company').optional().isLength({ max: 255 }),
  body('job_title').optional().isLength({ max: 255 }),
  body('experience').optional().isString(),
  body('industry').optional().isString(),
  body('motivation').optional().isString(),
  body('referred').optional().isBoolean(),
  body('tier')
    .optional()
    .isIn(['student', 'professional', 'corporate'])
    .withMessage('Tier must be student, professional, or corporate'),
];

const updateStatusValidation = [
  body('status')
    .isIn(['pending', 'active', 'inactive'])
    .withMessage('Status must be pending, active, or inactive'),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['pending', 'active', 'inactive']),
  query('tier').optional().isIn(['student', 'professional', 'corporate']),
  query('sort').optional().isIn(['joined_at', 'first_name', 'last_name', 'status']),
  query('order').optional().isIn(['asc', 'desc']),
];

const toggleExecutiveValidation = [
  body('is_executive')
    .isBoolean()
    .withMessage('is_executive must be a boolean'),
];

module.exports = { applyValidation, updateStatusValidation, listQueryValidation, toggleExecutiveValidation };
