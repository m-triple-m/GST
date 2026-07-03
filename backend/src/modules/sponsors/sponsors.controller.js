'use strict';
const { validationResult } = require('express-validator');
const service    = require('./sponsors.service');
const { sendSuccess } = require('../../utils/response');

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

module.exports = { submitEnquiry, listEnquiries };
