'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./admin.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// All admin routes require authentication + admin role
router.use(verifyToken, requireRole('admin'));

// GET /api/admin/stats
router.get('/stats', ctrl.getStats);
// GET /api/admin/audit
router.get('/audit', ctrl.getAuditLog);

module.exports = router;
