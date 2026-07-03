'use strict';
const express    = require('express');
const router     = express.Router();
const controller = require('./auth.controller');
const { verifyToken } = require('../../middleware/auth.middleware');
const { registerValidation, loginValidation, refreshValidation, changePasswordValidation } = require('./auth.validation');

// POST /api/auth/register
router.post('/register', registerValidation, controller.register);

// POST /api/auth/login
router.post('/login', loginValidation, controller.login);

// POST /api/auth/refresh
router.post('/refresh', refreshValidation, controller.refresh);

// POST /api/auth/logout   (requires token to revoke the refresh token)
router.post('/logout', controller.logout);

// POST /api/auth/logout-all  (revokes all sessions for the current user)
router.post('/logout-all', verifyToken, controller.logoutAll);

// GET  /api/auth/me
router.get('/me', verifyToken, controller.me);

// PUT  /api/auth/change-password
router.put('/change-password', verifyToken, changePasswordValidation, controller.changePassword);

module.exports = router;
