'use strict';
const { body, query } = require('express-validator');

const applyValidation = [
  body('firstName').trim().notEmpty().withMessage('First name is required'),
  body('lastName').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('nickname').optional().isString().trim(),
  body('phone').trim().notEmpty().withMessage('Phone number is required'),
  body('homeStreet').trim().notEmpty().withMessage('Home street address is required'),
  body('homeCity').trim().notEmpty().withMessage('Home city is required'),
  body('homeState').trim().notEmpty().withMessage('Home state is required'),
  body('homeZip').trim().notEmpty().withMessage('Home ZIP code is required'),
  body('avatarUrl').optional().isString().trim(),
  body('privacyPolicy')
    .custom((val) => val === true || val === 1 || val === 'true')
    .withMessage('You must agree to the Privacy Policy and Membership Terms'),
  body('companyName')
    .custom((val, { req }) => {
      if (!val && !req.body.company) throw new Error('Company name is required');
      return true;
    }),
  body('jobTitle').trim().notEmpty().withMessage('Job title is required'),
  body('companyPhone').trim().notEmpty().withMessage('Company phone is required'),
  body('companyStreet').trim().notEmpty().withMessage('Company street address is required'),
  body('companyCity').trim().notEmpty().withMessage('Company city is required'),
  body('companyState').trim().notEmpty().withMessage('Company state is required'),
  body('companyZip').trim().notEmpty().withMessage('Company ZIP code is required'),
  body('boardPosition').optional().isString().trim(),
  body('segStatus')
    .notEmpty()
    .isIn(['active', 'associate', 'emeritus', 'student', 'non-member'])
    .withMessage('SEG status is required and must be active, associate, emeritus, student, or non-member'),
  body('tgsMember').optional().isBoolean(),
  body('education')
    .custom((val, { req }) => {
      // Check if primary college details provided either in flat fields or education array
      const firstEdu = Array.isArray(val) && val.length > 0 ? val[0] : null;
      const uni = firstEdu?.university || req.body.university;
      const deg = firstEdu?.degree || req.body.degree;
      const maj = firstEdu?.major || req.body.major;
      if (!uni || !uni.trim()) throw new Error('University/College name is required for primary degree');
      if (!deg || !deg.trim()) throw new Error('Degree is required for primary degree');
      if (!maj || !maj.trim()) throw new Error('Major is required for primary degree');
      return true;
    }),
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
