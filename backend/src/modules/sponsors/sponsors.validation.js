'use strict';
const { body } = require('express-validator');

const enquiryValidation = [
  body('company_name').trim().notEmpty().withMessage('Company name is required'),
  body('contact_name').trim().notEmpty().withMessage('Contact name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().isString(),
  body('tier_interest').optional().isIn(['Bronze','Silver','Gold','Platinum','Custom']),
  body('message').optional().isString(),
];

module.exports = { enquiryValidation };
