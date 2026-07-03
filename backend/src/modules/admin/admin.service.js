'use strict';
const repo = require('./admin.repository');
const { buildPagination } = require('../../utils/response');

const getStats = () => repo.getDashboardStats();

const getAuditLog = async (query) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 20);
  const offset = (page - 1) * limit;
  const [logs, total] = await Promise.all([
    repo.getAuditLog({ limit, offset }),
    repo.countAuditLog(),
  ]);
  return { logs, pagination: buildPagination(page, limit, total) };
};

module.exports = { getStats, getAuditLog };
