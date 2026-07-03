'use strict';
const { validationResult } = require('express-validator');
const service    = require('./contact.service');
const { sendSuccess } = require('../../utils/response');

const submitContact = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await service.submitContact(req.body);
    sendSuccess(res, 201, 'Message received. We will get back to you shortly.');
  } catch (err) { next(err); }
};

const subscribe = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await service.subscribe(req.body.email);
    sendSuccess(res, 201, 'Subscribed to newsletter successfully.');
  } catch (err) { next(err); }
};

const listInquiries = async (req, res, next) => {
  try {
    const { inquiries, pagination } = await service.listInquiries(req.query);
    sendSuccess(res, 200, 'Contact inquiries', inquiries, pagination);
  } catch (err) { next(err); }
};

module.exports = { submitContact, subscribe, listInquiries };
