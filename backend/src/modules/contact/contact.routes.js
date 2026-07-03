'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./contact.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { contactValidation, newsletterValidation } = require('./contact.validation');

// POST /api/contact
router.post('/', contactValidation, ctrl.submitContact);
// POST /api/contact/newsletter
router.post('/newsletter', newsletterValidation, ctrl.subscribe);
// GET  /api/contact/inquiries (admin only)
router.get('/inquiries', verifyToken, requireRole('admin'), ctrl.listInquiries);

module.exports = router;
