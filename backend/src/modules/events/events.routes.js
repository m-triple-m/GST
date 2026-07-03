'use strict';
const express    = require('express');
const router     = express.Router();
const ctrl       = require('./events.controller');
const { verifyToken, optionalAuth } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
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
router.post('/', verifyToken, requireRole('admin', 'executive'), createEventValidation, ctrl.createEvent);
// PUT    /api/events/:id
router.put('/:id', verifyToken, requireRole('admin', 'executive'), ctrl.updateEvent);
// DELETE /api/events/:id
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.deleteEvent);
// GET    /api/events/:id/registrations
router.get('/:id/registrations', verifyToken, requireRole('admin', 'executive'), ctrl.getEventRegistrations);

module.exports = router;
