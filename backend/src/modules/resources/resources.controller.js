'use strict';
const { validationResult } = require('express-validator');
const service    = require('./resources.service');
const { sendSuccess } = require('../../utils/response');

const listResources = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const { resources, pagination } = await service.listResources(req.query, req.user);
    sendSuccess(res, 200, 'Resources list', resources, pagination);
  } catch (err) { next(err); }
};

const getResourceById = async (req, res, next) => {
  try {
    const data = await service.getResourceById(Number(req.params.id), req.user);
    sendSuccess(res, 200, 'Resource detail', data);
  } catch (err) { next(err); }
};

const createResource = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return next(errors.array());
    const data = await service.createResource(req.body);
    sendSuccess(res, 201, 'Resource created', data);
  } catch (err) { next(err); }
};

const updateResource = async (req, res, next) => {
  try {
    const data = await service.updateResource(Number(req.params.id), req.body);
    sendSuccess(res, 200, 'Resource updated', data);
  } catch (err) { next(err); }
};

const deleteResource = async (req, res, next) => {
  try {
    await service.deleteResource(Number(req.params.id));
    sendSuccess(res, 200, 'Resource deleted');
  } catch (err) { next(err); }
};

module.exports = { listResources, getResourceById, createResource, updateResource, deleteResource };
