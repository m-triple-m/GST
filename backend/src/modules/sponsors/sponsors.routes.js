'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./sponsors.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const activityLog = require('../../middleware/activityLog.middleware');
const { enquiryValidation } = require('./sponsors.validation');
const { uploadSponsorLogo } = require('../../middleware/upload.middleware');

// ── Public ────────────────────────────────────────────────────────────────────
// POST /api/sponsors/enquiry
router.post('/enquiry', enquiryValidation, ctrl.submitEnquiry);

// GET  /api/sponsors  — active sponsors shown on the public site
router.get('/', ctrl.listSponsors);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get('/all',      verifyToken, requireRole('admin'), ctrl.listAllSponsors);
router.post('/reorder', verifyToken, requireRole('admin'),
  activityLog('SPONSOR_REORDERED', null, () => null),
  ctrl.reorderSponsors
);
router.post('/', verifyToken, requireRole('admin'),
  activityLog('SPONSOR_CREATED', null, (req) => ({ name: req.body.name, tier: req.body.tier })),
  ctrl.createSponsor
);
router.put('/:id', verifyToken, requireRole('admin'),
  activityLog('SPONSOR_UPDATED', (req) => `sponsor:${req.params.id}`, (req) => ({ sponsor_id: req.params.id, name: req.body.name })),
  ctrl.updateSponsor
);
router.delete('/:id', verifyToken, requireRole('admin'),
  activityLog('SPONSOR_DELETED', (req) => `sponsor:${req.params.id}`, (req) => ({ sponsor_id: req.params.id })),
  ctrl.deleteSponsor
);
router.get('/enquiries', verifyToken, requireRole('admin'), ctrl.listEnquiries);
router.patch('/enquiries/:id/status', verifyToken, requireRole('admin'),
  activityLog('SPONSOR_ENQUIRY_STATUS_UPDATED', (req) => `sponsor_enquiry:${req.params.id}`, (req) => ({ enquiry_id: req.params.id, status: req.body.status })),
  ctrl.updateEnquiryStatus
);

// POST /api/sponsors/upload-logo — upload a logo file, returns { logo_url }
router.post(
  '/upload-logo',
  verifyToken,
  requireRole('admin'),
  uploadSponsorLogo.single('logo'),
  ctrl.uploadLogo
);

module.exports = router;

