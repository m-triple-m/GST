'use strict';
const express    = require('express');
const router     = express.Router();
const ctrl       = require('./events.controller');
const { verifyToken, optionalAuth } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const activityLog = require('../../middleware/activityLog.middleware');
const { createEventValidation, registerEventValidation, listQueryValidation } = require('./events.validation');
const { uploadEventImage, uploadEventResource } = require('../../middleware/upload.middleware');

// ── Public ────────────────────────────────────────────────
// GET  /api/events
router.get('/', listQueryValidation, ctrl.listEvents);
// GET  /api/events/:id
router.get('/:id', ctrl.getEventById);

// ── Event Registration (public + optional auth) ───────────
// POST /api/events/:id/register
router.post('/:id/register', optionalAuth, registerEventValidation, ctrl.registerForEvent);

// ── Executive + Admin ────────────────────────────────────
// POST   /api/events/upload/image
router.post('/upload/image', verifyToken, requireRole('admin', 'executive'), uploadEventImage.single('file'), ctrl.uploadImage);
// POST   /api/events/upload/resource
router.post('/upload/resource', verifyToken, requireRole('admin', 'executive'), uploadEventResource.single('file'), ctrl.uploadResource);

// POST   /api/events
router.post('/', verifyToken, requireRole('admin', 'executive'), createEventValidation,
  activityLog('EVENT_CREATED', null, (req) => ({ title: req.body.title, event_date: req.body.event_date })),
  ctrl.createEvent
);
// PUT    /api/events/:id
router.put('/:id', verifyToken, requireRole('admin', 'executive'),
  activityLog('EVENT_UPDATED', (req) => `event:${req.params.id}`, (req) => ({ event_id: req.params.id, title: req.body.title })),
  ctrl.updateEvent
);
// DELETE /api/events/:id
router.delete('/:id', verifyToken, requireRole('admin'),
  activityLog('EVENT_DELETED', (req) => `event:${req.params.id}`, (req) => ({ event_id: req.params.id })),
  ctrl.deleteEvent
);
// GET    /api/events/:id/registrations
router.get('/:id/registrations', verifyToken, requireRole('admin', 'executive'), ctrl.getEventRegistrations);
// PATCH  /api/events/registrations/:regId/status
router.patch('/registrations/:regId/status', verifyToken, requireRole('admin', 'executive'),
  activityLog(
    'PAYMENT_STATUS_UPDATED',
    (req) => `registration:${req.params.regId}`,
    (req) => ({ registration_id: req.params.regId, payment_status: req.body.payment_status, payment_method: req.body.payment_method })
  ),
  ctrl.updateRegistrationStatus
);

module.exports = router;

