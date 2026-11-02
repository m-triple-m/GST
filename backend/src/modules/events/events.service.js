'use strict';
const repo     = require('./events.repository');
const ApiError = require('../../utils/ApiError');
const mailerService = require('../../services/mailer.service');
const { buildPagination } = require('../../utils/response');
const membersRepo = require('../members/members.repository');

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

const deleteEvent = async (id, userId, password) => {
  if (!password || !password.trim()) {
    throw ApiError.badRequest('Admin password is required to delete an event.');
  }

  const authRepo = require('../auth/auth.repository');
  const user = await authRepo.findUserByIdWithHash(userId);
  if (!user) throw ApiError.notFound('Admin user not found');

  const bcrypt = require('bcrypt');
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    throw ApiError.unauthorized('Incorrect admin password. Deletion cancelled.');
  }

  const deleted = await repo.deleteEvent(id);
  if (!deleted) throw ApiError.notFound('Event not found');
};

const registerForEvent = async (eventId, data, userId) => {
  const event = await repo.getEventById(eventId);
  if (!event) throw ApiError.notFound('Event not found');
  if (event.status !== 'upcoming') throw ApiError.badRequest('Event is not open for registration');

  // ── Pending member gate ───────────────────────────────────────────────
  // If the request is authenticated, look up the member record and block
  // pending members from booking until an admin approves their application.
  if (userId) {
    const member = await membersRepo.getMemberByUserId(userId);
    if (member && member.status === 'pending') {
      throw ApiError.forbidden(
        'Your membership application is still under review. ' +
        'You will be able to register for events once an admin approves your account.'
      );
    }
  }
  // ─────────────────────────────────────────────────────────────────────

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
  
  const registrations = await repo.getEventRegistrations(eventId);

  // Compute detailed analytics
  let totalParticipants = 0;
  let totalRevenue = 0;
  let pendingRevenue = 0;
  let pendingAttendeesCount = 0;
  let refundedAmount = 0;
  let membersCount = 0;
  let guestsCount = 0;

  const paymentStatusCounts = { paid: 0, pending: 0, refunded: 0, failed: 0 };
  const paymentMethodCounts = { card: 0, at_door: 0, waived: 0 };

  registrations.forEach(r => {
    const guestList = Array.isArray(r.guests) ? r.guests : [];
    const partySize = 1 + guestList.length;

    if (r.payment_status !== 'refunded') {
      totalParticipants += partySize;

      if (r.attendee_type === 'member') {
        membersCount += 1;
      } else {
        guestsCount += 1;
      }
      guestsCount += guestList.length;
    }

    // Calculate unit price and expected amount as fallback if amount_paid is 0
    const ticketCost = r.attendee_type === 'guest'
      ? (Number(event.non_member_ticket_cost) || Number(event.ticket_cost) || 0)
      : (Number(event.member_ticket_cost) || Number(event.ticket_cost) || 0);
    const expectedAmount = ticketCost * partySize;
    const amount = Number(r.amount_paid) > 0 ? Number(r.amount_paid) : expectedAmount;

    r.expected_amount = expectedAmount;
    r.effective_amount = amount;

    if (r.payment_status === 'paid') {
      totalRevenue += amount;
    } else if (r.payment_status === 'pending') {
      pendingRevenue += amount;
      pendingAttendeesCount += partySize;
    } else if (r.payment_status === 'refunded') {
      refundedAmount += amount;
    }

    if (paymentStatusCounts[r.payment_status] !== undefined) {
      paymentStatusCounts[r.payment_status] += 1;
    }

    if (paymentMethodCounts[r.payment_method] !== undefined) {
      paymentMethodCounts[r.payment_method] += 1;
    }
  });

  const capacity = Number(event.capacity) || 0;
  const fillPercentage = capacity > 0 ? Math.min(100, Math.round((totalParticipants / capacity) * 100)) : 0;

  const analytics = {
    total_bookings: registrations.length,
    total_participants: totalParticipants,
    total_revenue: totalRevenue,
    pending_revenue: pendingRevenue,
    pending_amount: pendingRevenue,
    refunded_amount: refundedAmount,
    capacity,
    fill_percentage: fillPercentage,
    members_count: membersCount,
    member_count: membersCount,
    guests_count: guestsCount,
    guest_count: guestsCount,
    paid_registrations: paymentStatusCounts.paid,
    pending_registrations: paymentStatusCounts.pending,
    pending_orders: paymentStatusCounts.pending,
    pending_attendees_count: pendingAttendeesCount,
    refunded_registrations: paymentStatusCounts.refunded,
    failed_registrations: paymentStatusCounts.failed,
    payment_status_counts: paymentStatusCounts,
    payment_method_counts: paymentMethodCounts,
  };

  return {
    event,
    registrations,
    analytics,
  };
};

const updateRegistrationPaymentStatus = async (registrationId, payment_status, payment_method) => {
  const validStatuses = ['pending', 'paid', 'failed', 'refunded'];
  if (!validStatuses.includes(payment_status)) {
    throw ApiError.badRequest('Invalid payment status');
  }
  const updated = await repo.updateRegistrationPaymentStatus(registrationId, payment_status, payment_method);
  if (!updated) throw ApiError.notFound('Registration not found');
  return { id: registrationId, payment_status, payment_method };
};

module.exports = {
  listEvents, getEventById, createEvent, updateEvent, deleteEvent,
  registerForEvent, getEventRegistrations, updateRegistrationPaymentStatus,
};
