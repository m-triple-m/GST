'use strict';

/**
 * Custom application error class.
 * Extends Error to carry an HTTP status code.
 */
class ApiError extends Error {
  /**
   * @param {number} statusCode - HTTP status code (e.g. 400, 401, 403, 404, 500)
   * @param {string} message    - Human-readable error message
   */
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguish from programming errors
    Error.captureStackTrace(this, this.constructor);
  }

  // ── Factory helpers ─────────────────────────────
  static badRequest(msg = 'Bad request')           { return new ApiError(400, msg); }
  static unauthorized(msg = 'Unauthorized')        { return new ApiError(401, msg); }
  static forbidden(msg = 'Forbidden')              { return new ApiError(403, msg); }
  static notFound(msg = 'Resource not found')      { return new ApiError(404, msg); }
  static conflict(msg = 'Conflict')                { return new ApiError(409, msg); }
  static internal(msg = 'Internal server error')   { return new ApiError(500, msg); }
}

module.exports = ApiError;
