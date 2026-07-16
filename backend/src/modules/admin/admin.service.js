'use strict';
const repo = require('./admin.repository');
const { buildPagination } = require('../../utils/response');

const getStats = () => repo.getDashboardStats();

const getAuditLog = async (query) => {
  const parsedPage = parseInt(query.page, 10);
  const parsedLimit = parseInt(query.limit, 10);
  const page   = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit  = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 20;
  const offset = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    repo.getAuditLog({ limit, offset }),
    repo.countAuditLog(),
  ]);
  return { logs, pagination: buildPagination(page, limit, total) };
};

module.exports = { getStats, getAuditLog };
