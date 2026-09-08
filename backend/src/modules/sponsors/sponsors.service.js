'use strict';
const repo = require('./sponsors.repository');
const { buildPagination } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');

// ── Enquiries ────────────────────────────────────────────────────────────────

const submitEnquiry = async (data) => {
  const id = await repo.saveEnquiry(data);
  return { enquiry_id: id };
};

const listEnquiries = async (query) => {
  const page   = Math.max(1, parseInt(query.page, 10)  || 1);
  const limit  = Math.min(100, parseInt(query.limit, 10) || 20);
  const offset = (page - 1) * limit;
  const [enquiries, total] = await Promise.all([
    repo.listEnquiries({ limit, offset }),
    repo.countEnquiries(),
  ]);
  return { enquiries, pagination: buildPagination(page, limit, total) };
};

const updateEnquiryStatus = async (id, status) => {
  await repo.updateEnquiryStatus(id, status);
};

// ── Sponsors (admin CRUD) ────────────────────────────────────────────────────

const VALID_TIERS = ['bronze', 'silver', 'gold', 'platinum'];

const listSponsors = (activeOnly = false) => repo.listSponsors({ activeOnly });

const getSponsor = async (id) => {
  const s = await repo.getSponsorById(id);
  if (!s) throw ApiError.notFound('Sponsor not found');
  return s;
};

const createSponsor = async (body) => {
  const { name, logo_url, website_url, tier, is_active, sort_order } = body;
  if (!name || !logo_url) throw ApiError.badRequest('Name and logo URL are required');
  if (tier && !VALID_TIERS.includes(tier)) throw ApiError.badRequest('Invalid tier');
  const id = await repo.createSponsor({ name, logo_url, website_url, tier, is_active, sort_order });
  return repo.getSponsorById(id);
};

const updateSponsor = async (id, body) => {
  const existing = await repo.getSponsorById(id);
  if (!existing) throw ApiError.notFound('Sponsor not found');
  if (body.tier && !VALID_TIERS.includes(body.tier)) throw ApiError.badRequest('Invalid tier');
  await repo.updateSponsor(id, body);
  return repo.getSponsorById(id);
};

const deleteSponsor = async (id) => {
  const existing = await repo.getSponsorById(id);
  if (!existing) throw ApiError.notFound('Sponsor not found');
  await repo.deleteSponsor(id);
};

const reorderSponsors = async (items) => {
  if (!Array.isArray(items) || !items.length) throw ApiError.badRequest('items array is required');
  await repo.reorderSponsors(items);
};

module.exports = { submitEnquiry, listEnquiries, updateEnquiryStatus, listSponsors, getSponsor, createSponsor, updateSponsor, deleteSponsor, reorderSponsors };
