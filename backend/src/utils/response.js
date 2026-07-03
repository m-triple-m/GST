'use strict';

/**
 * Send a standardised success response.
 *
 * Shape:  { success: true, message, data, [pagination] }
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode
 * @param {string}  message
 * @param {*}       data
 * @param {object}  [pagination]  - { page, limit, total, pages }
 */
const sendSuccess = (res, statusCode = 200, message = 'Success', data = null, pagination = null) => {
  const body = { success: true, message };
  if (data !== null) body.data = data;
  if (pagination)    body.pagination = pagination;
  return res.status(statusCode).json(body);
};

/**
 * Send a standardised error response.
 *
 * Shape:  { success: false, message }
 *
 * @param {import('express').Response} res
 * @param {number}  statusCode
 * @param {string}  message
 */
const sendError = (res, statusCode = 500, message = 'Something went wrong') => {
  return res.status(statusCode).json({ success: false, message });
};

/**
 * Build a pagination metadata object.
 *
 * @param {number} page   - current page (1-indexed)
 * @param {number} limit  - items per page
 * @param {number} total  - total row count
 * @returns {{ page, limit, total, pages }}
 */
const buildPagination = (page, limit, total) => ({
  page:  Number(page),
  limit: Number(limit),
  total: Number(total),
  pages: Math.ceil(Number(total) / Number(limit)),
});

module.exports = { sendSuccess, sendError, buildPagination };
