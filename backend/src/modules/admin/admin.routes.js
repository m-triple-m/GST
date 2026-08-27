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

// ── Admin Account Management ──
// POST /api/admin/verify-password — password-wall check before creating accounts
router.post('/verify-password', ctrl.verifyOwnPassword);
// GET  /api/admin/accounts  — list all admin accounts
// POST /api/admin/accounts  — create a new admin account
router.get('/accounts',  ctrl.getAdminAccounts);
router.post('/accounts', ctrl.addAdminAccount);

module.exports = router;
