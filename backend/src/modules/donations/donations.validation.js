'use strict';
const { body } = require('express-validator');

const donationValidation = [
  body('donor_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('amount').isFloat({ min: 1 }).withMessage('Amount must be at least $1'),
  body('is_monthly').optional().isBoolean(),
  body('payment_method').optional().isIn(['card','paypal','check']),
  body('donor_name').optional().isString(),
];

module.exports = { donationValidation };
