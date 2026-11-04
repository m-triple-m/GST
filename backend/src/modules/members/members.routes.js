'use strict';
const express    = require('express');
const router     = express.Router();
const ctrl       = require('./members.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const activityLog = require('../../middleware/activityLog.middleware');
const {
  applyValidation, updateStatusValidation, listQueryValidation,
  toggleExecutiveValidation, renewValidation, expirationValidation
} = require('./members.validation');
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
// POST /api/members/me/renew  (self-service member renewal)
router.post('/me/renew', verifyToken, renewValidation, ctrl.renewMyMembership);
// POST /api/members/me/avatar
router.post('/me/avatar', verifyToken, uploadAvatar.single('avatar'), ctrl.uploadAvatar);
// GET  /api/members/me/events
router.get('/me/events', verifyToken, ctrl.getMyEvents);


// ── Admin ─────────────────────────────────────────────────
// GET    /api/members/export
router.get('/export', verifyToken, requireRole('admin', 'executive'), ctrl.exportMembers);
// GET    /api/members
router.get('/', verifyToken, requireRole('admin', 'executive'), listQueryValidation, ctrl.listMembers);
// GET    /api/members/:id
router.get('/:id', verifyToken, requireRole('admin', 'executive'), ctrl.getMemberById);
// PUT    /api/members/:id
router.put('/:id', verifyToken, requireRole('admin'),
  activityLog(
    'MEMBER_PROFILE_UPDATED',
    (req) => `member:${req.params.id}`,
    (req) => ({ member_id: req.params.id, name: `${req.body.firstName || req.body.first_name || ''} ${req.body.lastName || req.body.last_name || ''}`.trim() })
  ),
  ctrl.updateMemberById
);
// PATCH  /api/members/:id/status
router.patch('/:id/status', verifyToken, requireRole('admin'), updateStatusValidation,
  activityLog(
    'MEMBER_STATUS_CHANGE',
    (req) => `member:${req.params.id}`,
    (req) => ({ member_id: req.params.id, new_status: req.body.status, expires_at: req.body.expires_at })
  ),
  ctrl.updateMemberStatus
);
// PATCH  /api/members/:id/renew
router.patch('/:id/renew', verifyToken, requireRole('admin'), renewValidation,
  activityLog('MEMBER_RENEWED', (req) => `member:${req.params.id}`, (req) => ({ member_id: req.params.id, months: req.body.months })),
  ctrl.renewMember
);
// PATCH  /api/members/:id/expiration
router.patch('/:id/expiration', verifyToken, requireRole('admin'), expirationValidation,
  activityLog('MEMBER_EXPIRATION_UPDATED', (req) => `member:${req.params.id}`, (req) => ({ member_id: req.params.id, expires_at: req.body.expires_at })),
  ctrl.updateMemberExpiration
);
// PATCH  /api/members/:id/executive
router.patch('/:id/executive', verifyToken, requireRole('admin'), toggleExecutiveValidation,
  activityLog(
    'MEMBER_EXECUTIVE_TOGGLED',
    (req) => `member:${req.params.id}`,
    (req) => ({ member_id: req.params.id, is_executive: req.body.is_executive })
  ),
  ctrl.toggleExecutive
);
// PATCH  /api/members/:id/reset-password
router.patch('/:id/reset-password', verifyToken, requireRole('admin'),
  activityLog('MEMBER_PASSWORD_RESET', (req) => `member:${req.params.id}`, (req) => ({ member_id: req.params.id })),
  ctrl.resetMemberPassword
);
// DELETE /api/members/:id
router.delete('/:id', verifyToken, requireRole('admin'),
  activityLog('MEMBER_DELETED', (req) => `member:${req.params.id}`, (req) => ({ member_id: req.params.id })),
  ctrl.deleteMember
);

module.exports = router;

