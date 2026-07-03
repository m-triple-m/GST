'use strict';
const repo = require('./contact.repository');
const { buildPagination } = require('../../utils/response');

const submitContact = async (data) => { await repo.saveInquiry(data); };

const subscribe    = async (email) => { await repo.subscribe(email); };

const listInquiries = async (query) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 20);
  const offset = (page - 1) * limit;
  const [inquiries, total] = await Promise.all([
    repo.listInquiries({ limit, offset }),
    repo.countInquiries(),
  ]);
  return { inquiries, pagination: buildPagination(page, limit, total) };
};

module.exports = { submitContact, subscribe, listInquiries };
