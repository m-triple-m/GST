'use strict';
const { validationResult } = require('express-validator');
const service    = require('./members.service');
const { sendSuccess } = require('../../utils/response');

// ── Public ────────────────────────────────────────────────

const getExecutiveBoard = async (req, res, next) => {
  try {
    const data = await service.getExecutiveBoard();
    sendSuccess(res, 200, 'Executive board', data);
  } catch (err) { next(err); }
};

const getExecutiveById = async (req, res, next) => {
  try {
    const data = await service.getExecutiveById(Number(req.params.id));
    sendSuccess(res, 200, 'Executive profile', data);
  } catch (err) { next(err); }
};

// ── Authenticated Member ─────────────────────────────────

const applyMembership = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const result = await service.submitApplication(req.body);
    sendSuccess(res, 201, 'Membership application submitted successfully', result);
  } catch (err) { next(err); }
};

const getMyProfile = async (req, res, next) => {
  try {
    const data = await service.getMyProfile(req.user.id);
    sendSuccess(res, 200, 'Profile', data);
  } catch (err) { next(err); }
};

const updateMyProfile = async (req, res, next) => {
  try {
    const data = await service.updateMyProfile(req.user.id, req.body);
    sendSuccess(res, 200, 'Profile updated', data);
  } catch (err) { next(err); }
};

const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }
    // file is saved in public/uploads/avatars/filename
    const avatar_url = `http://localhost:5000/uploads/avatars/${req.file.filename}`;
    const data = await service.updateMyProfile(req.user.id, { avatar_url });
    sendSuccess(res, 200, 'Avatar updated', data);
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────

const listMembers = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const { members, pagination } = await service.listMembers(req.query);
    sendSuccess(res, 200, 'Members list', members, pagination);
  } catch (err) { next(err); }
};

const getMemberById = async (req, res, next) => {
  try {
    const data = await service.getMemberById(Number(req.params.id));
    sendSuccess(res, 200, 'Member detail', data);
  } catch (err) { next(err); }
};

const updateMemberStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await service.updateMemberStatus(Number(req.params.id), req.body.status);
    sendSuccess(res, 200, 'Member status updated');
  } catch (err) { next(err); }
};

const toggleExecutive = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await service.toggleExecutive(Number(req.params.id), req.body.is_executive);
    sendSuccess(res, 200, req.body.is_executive ? 'Member promoted to executive' : 'Executive status removed');
  } catch (err) { next(err); }
};

const deleteMember = async (req, res, next) => {
  try {
    await service.deleteMember(Number(req.params.id));
    sendSuccess(res, 200, 'Member deleted');
  } catch (err) { next(err); }
};

const resetMemberPassword = async (req, res, next) => {
  try {
    const { newPassword } = await service.resetMemberPassword(Number(req.params.id));
    sendSuccess(res, 200, 'Password reset to default', { newPassword });
  } catch (err) { next(err); }
};

const getMyEvents = async (req, res, next) => {
  try {
    const data = await service.getMyRegisteredEvents(req.user.id);
    sendSuccess(res, 200, 'My registered events', data);
  } catch (err) { next(err); }
};

module.exports = {
  getExecutiveBoard, getExecutiveById,
  applyMembership, getMyProfile, updateMyProfile, uploadAvatar, getMyEvents,
  listMembers, getMemberById, updateMemberStatus, toggleExecutive,
  resetMemberPassword, deleteMember,
};
