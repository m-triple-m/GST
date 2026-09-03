'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./sponsors.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { enquiryValidation } = require('./sponsors.validation');
const { uploadSponsorLogo } = require('../../middleware/upload.middleware');

// ── Public ────────────────────────────────────────────────────────────────────
// POST /api/sponsors/enquiry
router.post('/enquiry', enquiryValidation, ctrl.submitEnquiry);

// GET  /api/sponsors  — active sponsors shown on the public site
router.get('/', ctrl.listSponsors);

// ── Admin only ────────────────────────────────────────────────────────────────
router.get('/all',       verifyToken, requireRole('admin'), ctrl.listAllSponsors);
router.post('/',         verifyToken, requireRole('admin'), ctrl.createSponsor);
router.put('/:id',       verifyToken, requireRole('admin'), ctrl.updateSponsor);
router.delete('/:id',    verifyToken, requireRole('admin'), ctrl.deleteSponsor);
router.get('/enquiries', verifyToken, requireRole('admin'), ctrl.listEnquiries);

// POST /api/sponsors/upload-logo — upload a logo file, returns { logo_url }
router.post(
  '/upload-logo',
  verifyToken,
  requireRole('admin'),
  uploadSponsorLogo.single('logo'),
  ctrl.uploadLogo
);

module.exports = router;
