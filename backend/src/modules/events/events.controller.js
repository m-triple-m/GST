'use strict';
const { validationResult } = require('express-validator');
const service    = require('./events.service');
const { sendSuccess } = require('../../utils/response');

const listEvents = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const { events, pagination } = await service.listEvents(req.query);
    sendSuccess(res, 200, 'Events list', events, pagination);
  } catch (err) { next(err); }
};

const getEventById = async (req, res, next) => {
  try {
    const data = await service.getEventById(Number(req.params.id));
    sendSuccess(res, 200, 'Event detail', data);
  } catch (err) { next(err); }
};

const createEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.createEvent(req.body, req.user.id);
    sendSuccess(res, 201, 'Event created', data);
  } catch (err) { next(err); }
};

const updateEvent = async (req, res, next) => {
  try {
    const data = await service.updateEvent(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Event updated', data);
  } catch (err) { next(err); }
};

const deleteEvent = async (req, res, next) => {
  try {
    await service.deleteEvent(Number(req.params.id));
    sendSuccess(res, 200, 'Event deleted');
  } catch (err) { next(err); }
};

const registerForEvent = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const id = await service.registerForEvent(
      Number(req.params.id),
      req.body,
      req.user?.id || null
    );
    sendSuccess(res, 201, 'Registration confirmed', { registration_id: id });
  } catch (err) { next(err); }
};

const getEventRegistrations = async (req, res, next) => {
  try {
    const data = await service.getEventRegistrations(Number(req.params.id));
    sendSuccess(res, 200, 'Event registrations', data);
  } catch (err) { next(err); }
};

const uploadImage = (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const url = `/uploads/events/images/${req.file.filename}`;
    sendSuccess(res, 200, 'Image uploaded', { url });
  } catch (err) { next(err); }
};

const uploadResource = (req, res, next) => {
  try {
    if (!req.file) throw new Error('No file uploaded');
    const url = `/uploads/events/resources/${req.file.filename}`;
    sendSuccess(res, 200, 'Resource uploaded', { url });
  } catch (err) { next(err); }
};

module.exports = {
  listEvents, getEventById, createEvent, updateEvent, deleteEvent,
  registerForEvent, getEventRegistrations, uploadImage, uploadResource
};
