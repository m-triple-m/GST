'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./sponsors.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { enquiryValidation } = require('./sponsors.validation');

// POST /api/sponsors/enquiry
router.post('/enquiry', enquiryValidation, ctrl.submitEnquiry);
// GET  /api/sponsors/enquiries (admin only)
router.get('/enquiries', verifyToken, requireRole('admin'), ctrl.listEnquiries);

module.exports = router;
