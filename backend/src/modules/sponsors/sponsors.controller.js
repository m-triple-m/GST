'use strict';
const { validationResult } = require('express-validator');
const service    = require('./sponsors.service');
const { sendSuccess } = require('../../utils/response');

// ── Enquiries ─────────────────────────────────────────────────────────────────

const submitEnquiry = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.submitEnquiry(req.body);
    sendSuccess(res, 201, 'Sponsorship enquiry received. Our team will contact you within 48 hours.', data);
  } catch (err) { next(err); }
};

const listEnquiries = async (req, res, next) => {
  try {
    const { enquiries, pagination } = await service.listEnquiries(req.query);
    sendSuccess(res, 200, 'Sponsor enquiries', enquiries, pagination);
  } catch (err) { next(err); }
};

const updateEnquiryStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status || !['new', 'read', 'in_review', 'approved', 'declined'].includes(status)) {
      return next(require('../../utils/ApiError').badRequest('Invalid status'));
    }
    await service.updateEnquiryStatus(Number(req.params.id), status);
    sendSuccess(res, 200, 'Sponsor enquiry status updated');
  } catch (err) { next(err); }
};

// ── Sponsors CRUD ─────────────────────────────────────────────────────────────

/** Public — only active sponsors */
const listSponsors = async (req, res, next) => {
  try {
    const sponsors = await service.listSponsors(true);
    sendSuccess(res, 200, 'Sponsors', sponsors);
  } catch (err) { next(err); }
};

/** Admin — all sponsors including inactive */
const listAllSponsors = async (req, res, next) => {
  try {
    const sponsors = await service.listSponsors(false);
    sendSuccess(res, 200, 'All sponsors', sponsors);
  } catch (err) { next(err); }
};

const createSponsor = async (req, res, next) => {
  try {
    const sponsor = await service.createSponsor(req.body);
    sendSuccess(res, 201, 'Sponsor created', sponsor);
  } catch (err) { next(err); }
};

const updateSponsor = async (req, res, next) => {
  try {
    const sponsor = await service.updateSponsor(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Sponsor updated', sponsor);
  } catch (err) { next(err); }
};

const deleteSponsor = async (req, res, next) => {
  try {
    await service.deleteSponsor(Number(req.params.id));
    sendSuccess(res, 200, 'Sponsor deleted');
  } catch (err) { next(err); }
};

const uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(require('../../utils/ApiError').badRequest('No image file provided'));
    }
    // Build the public URL — served via express.static from /public
    const logo_url = `/uploads/sponsors/${req.file.filename}`;
    sendSuccess(res, 200, 'Logo uploaded', { logo_url });
  } catch (err) { next(err); }
};

const reorderSponsors = async (req, res, next) => {
  try {
    await service.reorderSponsors(req.body.items);
    sendSuccess(res, 200, 'Sponsor order saved');
  } catch (err) { next(err); }
};

module.exports = { submitEnquiry, listEnquiries, updateEnquiryStatus, listSponsors, listAllSponsors, createSponsor, updateSponsor, deleteSponsor, uploadLogo, reorderSponsors };
