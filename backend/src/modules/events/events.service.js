'use strict';
const repo     = require('./events.repository');
const ApiError = require('../../utils/ApiError');
const mailerService = require('../../services/mailer.service');
const { buildPagination } = require('../../utils/response');

const listEvents = async (query) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 12);
  const offset = (page - 1) * limit;

  const filters = {
    search:   query.search   || null,
    status:   query.status   || null,
    category: query.category || null,
    type:     query.type     || null,
    sort:     query.sort     || 'event_date',
    order:    query.order    || 'asc',
    limit,
    offset,
  };

  const [events, total] = await Promise.all([
    repo.listEvents(filters),
    repo.countEvents(filters),
  ]);

  return { events, pagination: buildPagination(page, limit, total) };
};

const getEventById = async (id) => {
  const event = await repo.getEventById(id);
  if (!event) throw ApiError.notFound('Event not found');

  const attendeeCount = await repo.countRegistrations(id);
  return { ...event, attendee_count: attendeeCount };
};

const createEvent = async (data, userId) => {
  const id = await repo.createEvent(data, userId);
  return repo.getEventById(id);
};

const updateEvent = async (id, data) => {
  const event = await repo.getEventById(id);
  if (!event) throw ApiError.notFound('Event not found');
  await repo.updateEvent(id, data);
  return repo.getEventById(id);
};

const deleteEvent = async (id) => {
  const deleted = await repo.deleteEvent(id);
  if (!deleted) throw ApiError.notFound('Event not found');
};

const registerForEvent = async (eventId, data, userId) => {
  const event = await repo.getEventById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.status !== 'upcoming') throw ApiError.badRequest('Event is not open for registration');

  // Check capacity
  if (event.capacity > 0) {
    const count = await repo.countRegistrations(eventId);
    if (count >= event.capacity) throw ApiError.conflict('This event has reached full capacity');
  }

  // Check RSVP deadline
  if (event.rsvp_deadline && new Date(event.rsvp_deadline) < new Date()) {
    throw ApiError.badRequest('The RSVP deadline for this event has passed');
  }

  const registration = await repo.registerForEvent(eventId, data, userId);

  // Send confirmation email asynchronously
  if (data.attendee_email) {
    mailerService.sendEventRegistrationEmail(data.attendee_email, event, data).catch(err => {
      console.error('Failed to send registration email in background:', err);
    });
  }

  return registration;
};

const getEventRegistrations = async (eventId) => {
  const event = await repo.getEventById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  return repo.getEventRegistrations(eventId);
};

module.exports = {
  listEvents, getEventById, createEvent, updateEvent, deleteEvent,
  registerForEvent, getEventRegistrations,
};
