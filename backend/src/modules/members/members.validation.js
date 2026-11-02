'use strict';
const { body, query } = require('express-validator');

const applyValidation = [
  body('member_id').optional().isString().trim(),
  body('memberId').optional().isString().trim(),
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
  body('eventAnnouncements').optional().isBoolean(),
  body('event_announcements').optional().isBoolean(),
  body('newsletterOptIn').optional().isBoolean(),
  body('newsletter_opt_in').optional().isBoolean(),
  body('directoryVisible').optional().isBoolean(),
  body('directory_visible').optional().isBoolean(),
  body('isRetired').optional().isBoolean(),
  body('companyName')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val && !req.body.company) throw new Error('Company name is required');
      return true;
    }),
  body('jobTitle')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Job title is required');
      return true;
    }),
  body('companyPhone')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Company phone is required');
      return true;
    }),
  body('companyStreet')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Company street address is required');
      return true;
    }),
  body('companyCity')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Company city is required');
      return true;
    }),
  body('companyState')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Company state is required');
      return true;
    }),
  body('companyZip')
    .custom((val, { req }) => {
      if (req.body.isRetired) return true;
      if (!val || !val.trim()) throw new Error('Company ZIP code is required');
      return true;
    }),
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
    .isIn(['pending', 'active', 'inactive', 'expired'])
    .withMessage('Status must be pending, active, inactive, or expired'),
  body('expires_at')
    .optional({ nullable: true })
    .isISO8601()
    .withMessage('expires_at must be a valid date'),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['pending', 'active', 'inactive', 'expired']),
  query('tier').optional().isIn(['student', 'professional', 'corporate']),
  query('sort').optional().isIn(['joined_at', 'expires_at', 'member_id', 'first_name', 'last_name', 'status', 'company_name', 'tier', 'seg_status']),
  query('order').optional().isIn(['asc', 'desc']),
];

const renewValidation = [
  body('months').optional().isInt({ min: 1, max: 60 }).withMessage('Months must be an integer between 1 and 60'),
];

const expirationValidation = [
  body('expires_at')
    .notEmpty()
    .withMessage('expires_at is required')
    .isISO8601()
    .withMessage('expires_at must be a valid date'),
];

const toggleExecutiveValidation = [
  body('is_executive')
    .isBoolean()
    .withMessage('is_executive must be a boolean'),
];

module.exports = {
  applyValidation, updateStatusValidation, listQueryValidation,
  renewValidation, expirationValidation, toggleExecutiveValidation
};
