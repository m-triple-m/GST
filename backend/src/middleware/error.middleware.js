'use strict';
const config    = require('../config/env');
const { sendError } = require('../utils/response');

/**
 * Global error handler — must be registered LAST in Express.
 * Handles both operational ApiErrors and unexpected programming errors.
 */
// eslint-disable-next-line no-unused-vars
const errorMiddleware = (err, req, res, next) => {
  // Validation errors from express-validator are forwarded as arrays
  if (Array.isArray(err)) {
    return sendError(res, 422, err[0].msg || 'Validation error');
  }

  const statusCode = err.statusCode || 500;
  const message    = err.isOperational
    ? err.message
    : config.nodeEnv === 'production'
      ? 'Internal server error'
      : err.message;

  if (config.nodeEnv !== 'production') {
    console.error(`[ERROR] ${statusCode} — ${err.message}`);
    if (!err.isOperational) console.error(err.stack);
  }

  return sendError(res, statusCode, message);
};

/**
 * 404 handler — catches requests that reached no route.
 */
const notFoundMiddleware = (req, res) => {
  sendError(res, 404, `Cannot ${req.method} ${req.originalUrl}`);
};

module.exports = { errorMiddleware, notFoundMiddleware };
