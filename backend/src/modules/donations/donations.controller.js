'use strict';
const { validationResult } = require('express-validator');
const service    = require('./donations.service');
const { sendSuccess } = require('../../utils/response');

const createDonation = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.createDonation(req.body, req.user);
    sendSuccess(res, 201, 'Thank you for your donation!', data);
  } catch (err) { next(err); }
};

const listDonations = async (req, res, next) => {
  try {
    const { donations, pagination, totalAmount } = await service.listDonations(req.query);
    sendSuccess(res, 200, 'Donations list', { donations, totalAmount }, pagination);
  } catch (err) { next(err); }
};

module.exports = { createDonation, listDonations };
