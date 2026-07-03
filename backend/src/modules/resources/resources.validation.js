'use strict';
const { body, query } = require('express-validator');

const createValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('access').optional().isIn(['public','members']),
  body('has_video').optional().isBoolean(),
  body('has_slides').optional().isBoolean(),
  body('has_paper').optional().isBoolean(),
  body('year').optional().isInt({ min: 2000, max: 2100 }),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('year').optional().isInt({ min: 2000 }).toInt(),
  query('category').optional().isString().trim(),
  query('access').optional().isIn(['public','members']),
];

module.exports = { createValidation, listQueryValidation };
