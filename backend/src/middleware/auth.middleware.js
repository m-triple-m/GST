'use strict';
const jwt     = require('jsonwebtoken');
const config  = require('../config/env');
const ApiError = require('../utils/ApiError');

/**
 * verifyToken
 * Validates the Bearer access token from the Authorization header.
 * Attaches decoded payload to req.user on success.
 */
const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(ApiError.unauthorized('Access token is required'));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, config.jwt.accessSecret);
    req.user = decoded; // { id, email, role }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(ApiError.unauthorized('Access token has expired'));
    }
    return next(ApiError.unauthorized('Invalid access token'));
  }
};

/**
 * optionalAuth
 * Like verifyToken but does NOT reject if no token is present.
 * Useful for routes that serve different data to guests vs members.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }

  const token = authHeader.split(' ')[1];
  try {
    req.user = jwt.verify(token, config.jwt.accessSecret);
  } catch {
    req.user = null;
  }
  next();
};

module.exports = { verifyToken, optionalAuth };
