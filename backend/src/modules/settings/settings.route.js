'use strict';
const express = require('express');
const router = express.Router();
const controller = require('./settings.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');

// GET is public — any page can read global settings (e.g. ticket prices)
// PUT is restricted to admins
router.get('/', controller.getSettings);
router.put('/', verifyToken, requireRole('admin'), controller.updateSettings);

module.exports = router;
