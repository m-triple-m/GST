'use strict';
const bcrypt   = require('bcrypt');
const config   = require('../../config/env');
const repo     = require('./members.repository');
const authRepo = require('../auth/auth.repository');
const ApiError = require('../../utils/ApiError');
const { buildPagination } = require('../../utils/response');

const getExecutiveBoard = () => repo.getExecutiveBoard();

const getExecutiveById = async (id) => {
  const exec = await repo.getExecutiveById(id);
  if (!exec) throw ApiError.notFound('Executive member not found');
  return exec;
};

const getMyProfile = async (userId) => {
  let member = await repo.getMemberByUserId(userId);
  if (!member) {
    const user = await authRepo.findUserById(userId);
    if (user && user.role === 'admin') {
      const emailName = user.email.split('@')[0];
      const nameParts = emailName.split(/[._-]/);
      const firstName = nameParts[0] ? (nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1)) : 'Admin';
      const lastName = nameParts[1] ? (nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1)) : 'User';

      const memberId = await generateMemberId();
      await repo.createMemberApplication({
        userId,
        memberId,
        email: user.email,
        firstName,
        lastName,
        tier: 'professional',
        referred: false,
      });

      const newMember = await repo.getMemberByUserId(userId);
      if (newMember) {
        await repo.updateMemberStatus(newMember.id, 'active');
      }
      member = await repo.getMemberByUserId(userId);
    }
  }
  if (!member) throw ApiError.notFound('Member profile not found');
  return member;
};

const updateMyProfile = async (userId, data) => {
  if (data.education && Array.isArray(data.education) && data.education.length > 0) {
    if (!data.university) data.university = data.education[0].university || '';
    if (!data.degree) data.degree = data.education[0].degree || '';
    if (!data.major) data.major = data.education[0].major || '';
  }
  await repo.updateMemberProfile(userId, data);
  return repo.getMemberByUserId(userId);
};

/**
 * Generate a deterministic default password:
 * GST@ + current year + first 3 chars of first name (uppercased)
 * Example: GST@2024Ale
 */
const generateDefaultPassword = (firstName) => {
  const year    = new Date().getFullYear();
  const namebit = (firstName || 'Usr').slice(0, 3).toUpperCase();
  return `GST@${year}${namebit}`;
};

/**
 * Generate a unique 8-digit membership ID matching legacy Wild Apricot pattern
 */
const generateMemberId = async () => {
  let memberId;
  let exists = true;
  let attempts = 0;
  while (exists && attempts < 20) {
    attempts++;
    memberId = String(Math.floor(50000000 + Math.random() * 49999999));
    const existing = await repo.getMemberByMemberId(memberId);
    if (!existing) {
      exists = false;
    }
  }
  return memberId;
};

const submitApplication = async (body) => {
  // Prevent duplicate applications for the same email
  const existing = await repo.getMemberByEmail(body.email);
  if (existing) throw ApiError.conflict('A membership application already exists for this email address');

  // Auto-create a user account linked to this application
  const existingUser = await authRepo.findUserByEmail(body.email);
  let userId;

  if (existingUser) {
    // Email already has a user account — link it
    userId = existingUser.id;
  } else {
    // Create a new user with a generated default password
    const defaultPassword = generateDefaultPassword(body.firstName);
    const hash = await bcrypt.hash(defaultPassword, config.bcryptSaltRounds);
    userId = await authRepo.createUser(body.email, hash, 'member');
    // Store the default password temporarily in the response (plain text, for first login)
    body._defaultPassword = defaultPassword;
  }

  if (body.isRetired) {
    if (!body.companyName) body.companyName = 'Retired';
    if (!body.jobTitle) body.jobTitle = 'Retired';
    if (!body.companyPhone) body.companyPhone = body.phone || null;
    if (!body.companyStreet) body.companyStreet = body.homeStreet || null;
    if (!body.companyCity) body.companyCity = body.homeCity || null;
    if (!body.companyState) body.companyState = body.homeState || null;
    if (!body.companyZip) body.companyZip = body.homeZip || null;
  }

  if (body.education && Array.isArray(body.education) && body.education.length > 0) {
    if (!body.university) body.university = body.education[0].university || '';
    if (!body.degree) body.degree = body.education[0].degree || '';
    if (!body.major) body.major = body.education[0].major || '';
  }

  const memberId = body.memberId || body.member_id || (await generateMemberId());
  await repo.createMemberApplication({ ...body, userId, memberId });
  return { defaultPassword: body._defaultPassword || null, memberId };
};

const listMembers = async (query) => {
  const page   = Math.max(1, parseInt(query.page,  10) || 1);
  const limit  = Math.min(100, parseInt(query.limit, 10) || 10);
  const offset = (page - 1) * limit;

  const filters = {
    search: query.search || null,
    status: query.status || null,
    tier:   query.tier   || null,
    sort:   query.sort   || 'joined_at',
    order:  query.order  || 'desc',
    limit,
    offset,
  };

  const [members, total] = await Promise.all([
    repo.listMembers(filters),
    repo.countMembers(filters),
  ]);

  return { members, pagination: buildPagination(page, limit, total) };
};

const getMemberById = async (id) => {
  const member = await repo.getMemberById(id);
  if (!member) throw ApiError.notFound('Member not found');
  return member;
};

const updateMemberById = async (id, data) => {
  const member = await repo.getMemberById(id);
  if (!member) throw ApiError.notFound('Member not found');

  // Check email uniqueness if email is being updated
  const newEmail = data.email || data.emailAddress;
  if (newEmail && newEmail !== member.email) {
    const existing = await repo.getMemberByEmail(newEmail);
    if (existing && existing.id !== Number(id)) {
      throw ApiError.conflict('Another member is already using this email address');
    }
  }

  if (data.education && Array.isArray(data.education) && data.education.length > 0) {
    if (!data.university) data.university = data.education[0].university || '';
    if (!data.degree) data.degree = data.education[0].degree || '';
    if (!data.major) data.major = data.education[0].major || '';
  }

  await repo.updateMemberById(id, data);
  return repo.getMemberById(id);
};

const updateMemberStatus = async (id, status, expiresAt) => {
  const updated = await repo.updateMemberStatus(id, status, expiresAt);
  if (!updated) throw ApiError.notFound('Member not found');
};

const renewMember = async (id, months = 12) => {
  const updated = await repo.renewMember(id, months);
  if (!updated) throw ApiError.notFound('Member not found');
  return repo.getMemberById(id);
};

const renewMyMembership = async (userId, months = 12) => {
  const member = await repo.getMemberByUserId(userId);
  if (!member) throw ApiError.notFound('Member profile not found');
  const updated = await repo.renewMember(member.id, months);
  if (!updated) throw ApiError.badRequest('Failed to renew membership');
  return repo.getMemberByUserId(userId);
};

const updateMemberExpiration = async (id, expiresAt) => {
  const updated = await repo.updateMemberExpiration(id, expiresAt);
  if (!updated) throw ApiError.notFound('Member not found');
  return repo.getMemberById(id);
};

const toggleExecutive = async (id, isExecutive) => {
  const updated = await repo.toggleMemberExecutive(id, isExecutive);
  if (!updated) throw ApiError.notFound('Member not found');
};

const deleteMember = async (id) => {
  const deleted = await repo.deleteMember(id);
  if (!deleted) throw ApiError.notFound('Member not found');
};

/**
 * Reset a member's password to the default formula: GST@<YEAR><FIRST3>
 * Returns the new plain-text password so the admin can communicate it.
 */
const resetMemberPassword = async (id) => {
  const member = await repo.getMemberById(id);
  if (!member) throw ApiError.notFound('Member not found');
  const newPassword = generateDefaultPassword(member.first_name);
  const hash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
  const updated = await repo.resetMemberPassword(id, hash);
  if (!updated) throw ApiError.badRequest('Could not reset password — member may not have a linked user account');
  return { newPassword };
};

const getMyRegisteredEvents = async (userId) => repo.getMyRegisteredEvents(userId);

module.exports = {
  getExecutiveBoard, getExecutiveById, getMyProfile, updateMyProfile,
  submitApplication, listMembers, getMemberById, updateMemberById, updateMemberStatus,
  renewMember, renewMyMembership, updateMemberExpiration,
  toggleExecutive, resetMemberPassword, deleteMember, getMyRegisteredEvents,
};
