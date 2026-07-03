'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./donations.controller');
const { optionalAuth, verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { donationValidation } = require('./donations.validation');

// POST /api/donations
router.post('/', optionalAuth, donationValidation, ctrl.createDonation);
// GET  /api/donations (admin only)
router.get('/', verifyToken, requireRole('admin'), ctrl.listDonations);

module.exports = router;
