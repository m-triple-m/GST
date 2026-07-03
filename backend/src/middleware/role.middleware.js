'use strict';
const ApiError = require('../utils/ApiError');

/**
 * requireRole
 * Factory that returns middleware enforcing a minimum role.
 *
 * Role hierarchy:  member < executive < admin
 *
 * Usage:
 *   router.get('/admin/stats', verifyToken, requireRole('admin'), controller)
 *   router.get('/exec/profile', verifyToken, requireRole('executive'), controller)
 *
 * @param {...string} roles - Allowed roles (e.g. 'admin', 'executive')
 * @returns {import('express').RequestHandler}
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user) {
    return next(ApiError.unauthorized('Authentication required'));
  }

  if (!roles.includes(req.user.role)) {
    return next(ApiError.forbidden(`Access restricted to: ${roles.join(', ')}`));
  }

  next();
};

module.exports = { requireRole };
