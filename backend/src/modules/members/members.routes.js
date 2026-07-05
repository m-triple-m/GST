'use strict';
const express    = require('express');
const router     = express.Router();
const ctrl       = require('./members.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { applyValidation, updateStatusValidation, listQueryValidation, toggleExecutiveValidation } = require('./members.validation');
const { uploadAvatar } = require('../../middleware/upload.middleware');

// ── Public ────────────────────────────────────────────────
// GET /api/members/executive
router.get('/executive', ctrl.getExecutiveBoard);
// GET /api/members/executive/:id
router.get('/executive/:id', ctrl.getExecutiveById);

// ── Member ────────────────────────────────────────────────
// POST /api/members/apply  (public — no token required to submit an application)
router.post('/apply', applyValidation, ctrl.applyMembership);
// GET  /api/members/me
router.get('/me', verifyToken, ctrl.getMyProfile);
// PUT  /api/members/me
router.put('/me', verifyToken, ctrl.updateMyProfile);
// POST /api/members/me/avatar
router.post('/me/avatar', verifyToken, uploadAvatar.single('avatar'), ctrl.uploadAvatar);
// GET  /api/members/me/events
router.get('/me/events', verifyToken, ctrl.getMyEvents);


// ── Admin ─────────────────────────────────────────────────
// GET    /api/members
router.get('/', verifyToken, requireRole('admin', 'executive'), listQueryValidation, ctrl.listMembers);
// GET    /api/members/:id
router.get('/:id', verifyToken, requireRole('admin', 'executive'), ctrl.getMemberById);
// PATCH  /api/members/:id/status
router.patch('/:id/status', verifyToken, requireRole('admin'), updateStatusValidation, ctrl.updateMemberStatus);
// PATCH  /api/members/:id/executive
router.patch('/:id/executive', verifyToken, requireRole('admin'), toggleExecutiveValidation, ctrl.toggleExecutive);
// PATCH  /api/members/:id/reset-password
router.patch('/:id/reset-password', verifyToken, requireRole('admin'), ctrl.resetMemberPassword);
// DELETE /api/members/:id
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.deleteMember);

module.exports = router;
