'use strict';
const repo     = require('./resources.repository');
const ApiError = require('../../utils/ApiError');
const { buildPagination } = require('../../utils/response');

const listResources = async (query, user) => {
  const page   = Math.max(1, query.page  || 1);
  const limit  = Math.min(100, query.limit || 10);
  const offset = (page - 1) * limit;

  // Non-members can only see public resources
  const accessFilter = (!user || user.role === 'member')
    ? (query.access === 'public' ? 'public' : null)  // show all if no filter (includes public + members)
    : query.access || null;

  const filters = {
    search: query.search || null,
    year:   query.year   || null,
    category: query.category || null,
    access: user ? accessFilter : 'public', // unauthenticated: only public
    limit,
    offset,
  };

  const [resources, total] = await Promise.all([
    repo.listResources(filters),
    repo.countResources(filters),
  ]);

  return { resources, pagination: buildPagination(page, limit, total) };
};

const getResourceById = async (id, user) => {
  const resource = await repo.getResourceById(id);
  if (!resource) throw ApiError.notFound('Resource not found');
  // Only members/admin can see member-only resource URLs
  if (resource.access === 'members' && (!user || user.role === 'guest')) {
    const { video_url, slides_url, paper_url, ...safe } = resource;
    return { ...safe, locked: true };
  }
  return resource;
};

const createResource = async (data) => {
  const id = await repo.createResource(data);
  return repo.getResourceById(id);
};

const updateResource = async (id, data) => {
  const r = await repo.getResourceById(id);
  if (!r) throw ApiError.notFound('Resource not found');
  await repo.updateResource(id, data);
  return repo.getResourceById(id);
};

const deleteResource = async (id) => {
  const deleted = await repo.deleteResource(id);
  if (!deleted) throw ApiError.notFound('Resource not found');
};

module.exports = { listResources, getResourceById, createResource, updateResource, deleteResource };
