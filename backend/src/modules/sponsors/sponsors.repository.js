'use strict';
const db = require('../../config/db');

// ── Sponsor Enquiries ─────────────────────────────────────────────────────────

const saveEnquiry = async (data) => {
  const { company_name, contact_name, email, phone, tier_interest, message } = data;
  const [r] = await db.execute(
    'INSERT INTO sponsor_enquiries (company_name, contact_name, email, phone, tier_interest, message) VALUES (?,?,?,?,?,?)',
    [company_name, contact_name, email, phone||null, tier_interest||null, message||null]
  );
  return r.insertId;
};

const listEnquiries = async ({ limit, offset }) => {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
  const [rows] = await db.query(
    `SELECT * FROM sponsor_enquiries ORDER BY created_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows;
};

const countEnquiries = async () => {
  const [[{total}]] = await db.execute('SELECT COUNT(*) as total FROM sponsor_enquiries');
  return total;
};

const updateEnquiryStatus = async (id, status) => {
  await db.execute('UPDATE sponsor_enquiries SET status = ? WHERE id = ?', [status, id]);
};

// ── Sponsors (site sponsors managed by admin) ─────────────────────────────────

const listSponsors = async ({ activeOnly = false } = {}) => {
  const where = activeOnly ? 'WHERE is_active = 1' : '';
  const [rows] = await db.execute(
    `SELECT * FROM sponsors ${where} ORDER BY sort_order ASC, created_at ASC`
  );
  return rows;
};

const getSponsorById = async (id) => {
  const [rows] = await db.execute('SELECT * FROM sponsors WHERE id = ? LIMIT 1', [id]);
  return rows[0] || null;
};

const createSponsor = async ({ name, logo_url, website_url, tier, is_active, sort_order }) => {
  const [r] = await db.execute(
    'INSERT INTO sponsors (name, logo_url, website_url, tier, is_active, sort_order) VALUES (?,?,?,?,?,?)',
    [name, logo_url, website_url || null, tier || 'bronze', is_active ?? 1, sort_order ?? 0]
  );
  return r.insertId;
};

const updateSponsor = async (id, fields) => {
  const allowed = ['name', 'logo_url', 'website_url', 'tier', 'is_active', 'sort_order'];
  const sets    = [];
  const vals    = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      vals.push(fields[key]);
    }
  }
  if (!sets.length) return;
  vals.push(id);
  await db.execute(`UPDATE sponsors SET ${sets.join(', ')} WHERE id = ?`, vals);
};

const deleteSponsor = async (id) => {
  await db.execute('DELETE FROM sponsors WHERE id = ?', [id]);
};

const reorderSponsors = async (items) => {
  // items: [{ id, sort_order }]
  // Run all updates inside a single connection for speed
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();
    for (const { id, sort_order } of items) {
      await conn.execute('UPDATE sponsors SET sort_order = ? WHERE id = ?', [sort_order, id]);
    }
    await conn.commit();
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
};

module.exports = {
  saveEnquiry, listEnquiries, countEnquiries, updateEnquiryStatus,
  listSponsors, getSponsorById, createSponsor, updateSponsor, deleteSponsor,
  reorderSponsors,
};
