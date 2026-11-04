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
    const avatar_url = `${req.protocol}://${req.get('host')}/uploads/avatars/${req.file.filename}`;
    const data = await service.updateMyProfile(req.user.id, { avatar_url });
    sendSuccess(res, 200, 'Avatar updated', data);
  } catch (err) { next(err); }
};

// ── Admin ─────────────────────────────────────────────────

const exportMembers = async (req, res, next) => {
  try {
    const csvData = await service.exportMembersCSV(req.query);
    const dateStr = new Date().toISOString().slice(0, 10);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="GST_Members_${dateStr}.csv"`);
    res.status(200).send(csvData);
  } catch (err) {
    next(err);
  }
};

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

const updateMemberById = async (req, res, next) => {
  try {
    const data = await service.updateMemberById(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Member profile updated successfully', data);
  } catch (err) { next(err); }
};

const updateMemberStatus = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    await service.updateMemberStatus(Number(req.params.id), req.body.status, req.body.expires_at);
    sendSuccess(res, 200, 'Member status updated');
  } catch (err) { next(err); }
};

const renewMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.renewMember(Number(req.params.id), req.body.months || 12);
    sendSuccess(res, 200, 'Membership renewed successfully', data);
  } catch (err) { next(err); }
};

const renewMyMembership = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.renewMyMembership(req.user.id, req.body.months || 12);
    sendSuccess(res, 200, 'Your membership has been renewed successfully', data);
  } catch (err) { next(err); }
};

const updateMemberExpiration = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.updateMemberExpiration(Number(req.params.id), req.body.expires_at);
    sendSuccess(res, 200, 'Membership expiration date updated', data);
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
  exportMembers,
  getExecutiveBoard, getExecutiveById,
  applyMembership, getMyProfile, updateMyProfile, uploadAvatar, getMyEvents,
  renewMyMembership,
  listMembers, getMemberById, updateMemberById, updateMemberStatus, renewMember, updateMemberExpiration,
  toggleExecutive, resetMemberPassword, deleteMember,
};
