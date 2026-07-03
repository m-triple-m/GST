'use strict';
const repo     = require('./donations.repository');
const { buildPagination } = require('../../utils/response');

const createDonation = async (data, user) => {
  const id = await repo.createDonation(data, user?.id || null);
  return { donation_id: id };
};

const listDonations = async (query) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 20);
  const offset = (page - 1) * limit;
  const [donations, total] = await Promise.all([
    repo.listDonations({ limit, offset }),
    repo.countDonations(),
  ]);
  const totalAmount = await repo.getTotalDonated();
  return { donations, pagination: buildPagination(page, limit, total), totalAmount };
};

module.exports = { createDonation, listDonations };
