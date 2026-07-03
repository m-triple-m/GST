'use strict';
const { body } = require('express-validator');

const contactValidation = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('subject').trim().notEmpty().withMessage('Subject is required'),
  body('message').trim().isLength({ min: 10 }).withMessage('Message must be at least 10 characters'),
];

const newsletterValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
];

module.exports = { contactValidation, newsletterValidation };
