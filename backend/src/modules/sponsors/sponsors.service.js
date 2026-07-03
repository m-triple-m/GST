'use strict';
const repo = require('./sponsors.repository');
const { buildPagination } = require('../../utils/response');

const submitEnquiry = async (data) => {
  const id = await repo.saveEnquiry(data);
  return { enquiry_id: id };
};

const listEnquiries = async (query) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 20);
  const offset = (page - 1) * limit;
  const [enquiries, total] = await Promise.all([
    repo.listEnquiries({ limit, offset }),
    repo.countEnquiries(),
  ]);
  return { enquiries, pagination: buildPagination(page, limit, total) };
};

module.exports = { submitEnquiry, listEnquiries };
