'use strict';
const { body, query } = require('express-validator');

const createEventValidation = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('status').optional().isIn(['upcoming','past','draft','cancelled']),
  body('event_type').custom((val, { req }) => {
    if (req.body.status !== 'draft' && (!val || !val.trim())) {
      throw new Error('Event type is required when publishing');
    }
    return true;
  }),
  body('event_date').custom((val, { req }) => {
    if (req.body.status !== 'draft' && (!val || isNaN(Date.parse(val)))) {
      throw new Error('Valid date is required (YYYY-MM-DD) when publishing');
    }
    return true;
  }),
  body('location_type').optional().isIn(['online','physical','hybrid']),
  body('capacity').optional().isInt({ min: 0 }),
  body('ticket_cost').optional().isFloat({ min: 0 }),
  body('member_ticket_cost').optional().isFloat({ min: 0 }),
  body('non_member_ticket_cost').optional().isFloat({ min: 0 }),
  body('featured').optional().isBoolean(),
  body('duration_minutes').optional({ nullable: true }).isInt({ min: 1, max: 1440 })
    .withMessage('Duration must be between 1 and 1440 minutes').toInt(),
];


const registerEventValidation = [
  body('attendee_name').trim().notEmpty().withMessage('Attendee name is required'),
  body('attendee_email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('company').optional().isString(),
  body('attendee_type').optional().isIn(['member','guest']),
  body('payment_method').optional().isIn(['card','at_door','waived']),
  body('guests').optional().isArray(),
  body('guests.*').optional().isString().trim().notEmpty(),
];

const listQueryValidation = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(['upcoming','past','draft','cancelled']),
  query('category').optional().isString().trim(),
  query('type').optional().isString().trim(),
  query('sort').optional().isIn(['event_date','title','created_at']),
  query('order').optional().isIn(['asc','desc']),
];

module.exports = { createEventValidation, registerEventValidation, listQueryValidation };

