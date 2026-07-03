'use strict';
const express = require('express');
const router  = express.Router();
const ctrl    = require('./resources.controller');
const { optionalAuth, verifyToken } = require('../../middleware/auth.middleware');
const { requireRole } = require('../../middleware/role.middleware');
const { createValidation, listQueryValidation } = require('./resources.validation');

// GET  /api/resources
router.get('/', optionalAuth, listQueryValidation, ctrl.listResources);
// GET  /api/resources/:id
router.get('/:id', optionalAuth, ctrl.getResourceById);
// POST /api/resources
router.post('/', verifyToken, requireRole('admin'), createValidation, ctrl.createResource);
// PUT  /api/resources/:id
router.put('/:id', verifyToken, requireRole('admin'), ctrl.updateResource);
// DELETE /api/resources/:id
router.delete('/:id', verifyToken, requireRole('admin'), ctrl.deleteResource);

module.exports = router;
