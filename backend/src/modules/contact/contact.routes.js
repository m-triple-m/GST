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
// GET  /api/contact/inquiries (admin + executive)
router.get('/inquiries', verifyToken, requireRole('admin', 'executive'), ctrl.listInquiries);
// PATCH /api/contact/inquiries/:id/read (admin + executive)
router.patch('/inquiries/:id/read', verifyToken, requireRole('admin', 'executive'), ctrl.markAsRead);

module.exports = router;
