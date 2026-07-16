'use strict';
const repo = require('./contact.repository');
const { buildPagination } = require('../../utils/response');

const submitContact = async (data) => { await repo.saveInquiry(data); };

const subscribe    = async (email) => { await repo.subscribe(email); };

const listInquiries = async (query) => {
  const parsedPage = parseInt(query.page, 10);
  const parsedLimit = parseInt(query.limit, 10);
  const page   = !isNaN(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const limit  = !isNaN(parsedLimit) && parsedLimit > 0 ? Math.min(100, parsedLimit) : 20;
  const offset = (page - 1) * limit;
  const [inquiries, total] = await Promise.all([
    repo.listInquiries({ limit, offset }),
    repo.countInquiries(),
  ]);
  return { inquiries, pagination: buildPagination(page, limit, total) };
};

const markAsRead = async (id) => { await repo.markAsRead(id); };

module.exports = { submitContact, subscribe, listInquiries, markAsRead };

