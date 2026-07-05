'use strict';
const db = require('../../config/db');

// ── Public / Member ──────────────────────────────────────

const getExecutiveBoard = async () => {
  const [rows] = await db.execute(
    `SELECT m.id, m.first_name, m.last_name, m.exec_position,
            m.exec_bio, m.exec_photo_url, m.avatar_url,
            COALESCE(m.exec_photo_url, m.avatar_url) AS profile_image,
            m.company, m.job_title, m.joined_at
     FROM members m
     WHERE m.is_executive = 1 AND m.status = 'active'
     ORDER BY m.exec_position`
  );
  return rows;
};

const getExecutiveById = async (id) => {
  const [rows] = await db.execute(
    `SELECT m.id, m.first_name, m.last_name, m.exec_position,
            m.exec_bio, m.exec_photo_url, m.avatar_url,
            COALESCE(m.exec_photo_url, m.avatar_url) AS profile_image,
            m.company, m.job_title, m.email, m.joined_at
     FROM members m
     WHERE m.id = ? AND m.is_executive = 1 AND m.status = 'active'`,
    [id]
  );
  return rows[0] || null;
};

const getMemberByUserId = async (userId) => {
  const [rows] = await db.execute(
    `SELECT m.*, u.role
     FROM members m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

const getMemberByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT id, email, status FROM members WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

// ── Admin ─────────────────────────────────────────────────

const countMembers = async ({ search, status, tier }) => {
  let sql    = 'SELECT COUNT(*) as total FROM members m WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR m.company LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (status) { sql += ' AND m.status = ?'; params.push(status); }
  if (tier)   { sql += ' AND m.tier = ?';   params.push(tier); }

  const [rows] = await db.execute(sql, params);
  return rows[0].total;
};

const listMembers = async ({ search, status, tier, sort, order, limit, offset }) => {
  const allowedSort  = ['joined_at', 'first_name', 'last_name', 'status'];
  const allowedOrder = ['ASC', 'DESC'];
  const sortCol  = allowedSort.includes(sort)          ? sort  : 'joined_at';
  const sortDir  = allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  let sql = `SELECT m.id, m.first_name, m.last_name, m.email, m.company, m.tier,
                    m.status, m.joined_at, m.is_executive
             FROM members m
             WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.email LIKE ? OR m.company LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like);
  }
  if (status) { sql += ' AND m.status = ?'; params.push(status); }
  if (tier)   { sql += ' AND m.tier = ?';   params.push(tier); }

  const safeLimit  = parseInt(limit,  10);
  const safeOffset = parseInt(offset, 10);
  sql += ` ORDER BY m.${sortCol} ${sortDir} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  const [rows] = await db.execute(sql, params);
  return rows;
};

const getMemberById = async (id) => {
  const [rows] = await db.execute(
    `SELECT m.*, u.role
     FROM members m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.id = ?`,
    [id]
  );
  return rows[0] || null;
};

const createMemberApplication = async (data) => {
  const {
    userId, email, firstName, lastName, phone, linkedin_url, company, job_title,
    experience, industry, motivation, referred, tier,
  } = data;
  await db.execute(
    `INSERT INTO members
     (user_id, email, first_name, last_name, phone, linkedin_url, company, job_title,
      experience, industry, motivation, referred, tier, status)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
    [userId || null, email, firstName, lastName, phone || null, linkedin_url || null,
     company || null, job_title || null, experience || null,
     industry || null, motivation || null, referred ? 1 : 0, tier || 'professional']
  );
};

const updateMemberStatus = async (id, status) => {
  const [result] = await db.execute(
    'UPDATE members SET status = ? WHERE id = ?',
    [status, id]
  );
  // Also activate/deactivate the user account if linked
  if (status === 'active') {
    await db.execute(
      'UPDATE users SET is_active = 1 WHERE id = (SELECT user_id FROM members WHERE id = ?)',
      [id]
    );
  } else if (status === 'inactive') {
    await db.execute(
      'UPDATE users SET is_active = 0 WHERE id = (SELECT user_id FROM members WHERE id = ?)',
      [id]
    );
  }
  return result.affectedRows > 0;
};

const toggleMemberExecutive = async (id, isExecutive) => {
  // Update the is_executive flag on the member row
  const [result] = await db.execute(
    'UPDATE members SET is_executive = ? WHERE id = ?',
    [isExecutive ? 1 : 0, id]
  );
  if (result.affectedRows === 0) return false;

  // Keep users.role in sync so the JWT role reflects access level on next login
  await db.execute(
    `UPDATE users SET role = ? WHERE id = (SELECT user_id FROM members WHERE id = ?)`,
    [isExecutive ? 'executive' : 'member', id]
  );

  return true;
};

const updateMemberProfile = async (userId, data) => {
  const fields = [];
  const values = [];
  const allowed = ['first_name', 'last_name', 'phone', 'linkedin_url', 'company', 'job_title', 'avatar_url'];
  allowed.forEach((f) => {
    if (data[f] !== undefined) { fields.push(`${f} = ?`); values.push(data[f]); }
  });
  if (!fields.length) return false;
  values.push(userId);
  const [result] = await db.execute(
    `UPDATE members SET ${fields.join(', ')} WHERE user_id = ?`,
    values
  );
  return result.affectedRows > 0;
};

const resetMemberPassword = async (id, hashedPassword) => {
  const [result] = await db.execute(
    `UPDATE users SET password_hash = ?
     WHERE id = (SELECT user_id FROM members WHERE id = ?)`,
    [hashedPassword, id]
  );
  return result.affectedRows > 0;
};

const deleteMember = async (id) => {
  const member = await getMemberById(id);
  if (!member) return false;

  // Delete the member record
  await db.execute('DELETE FROM members WHERE id = ?', [id]);

  // If a linked user account exists, delete it too
  if (member.user_id) {
    await db.execute('DELETE FROM users WHERE id = ?', [member.user_id]);
  }

  return true;
};

const getDashboardStats = async () => {
  const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM members');
  const [[{ pending }]] = await db.execute("SELECT COUNT(*) as pending FROM members WHERE status='pending'");
  const [[{ active }]] = await db.execute("SELECT COUNT(*) as active FROM members WHERE status='active'");
  return { total, pending, active };
};

const getMyRegisteredEvents = async (userId) => {
  const [rows] = await db.execute(
    `SELECT
        er.id             AS registration_id,
        er.attendee_type,
        er.payment_status,
        er.amount_paid,
        er.registered_at,
        e.id              AS event_id,
        e.title,
        e.event_type,
        e.event_date,
        e.start_time,
        e.end_time,
        e.duration_minutes,
        e.location_name,
        e.location_address,
        e.location_url,
        e.location_type,
        e.status,
        e.banner_url,
        e.color
     FROM event_registrations er
     JOIN events e ON e.id = er.event_id
     WHERE er.user_id = ?
     ORDER BY e.event_date DESC`,
    [userId]
  );
  return rows;
};

module.exports = {
  getExecutiveBoard, getExecutiveById, getMemberByUserId, getMemberByEmail,
  countMembers, listMembers, getMemberById,
  createMemberApplication, updateMemberStatus, toggleMemberExecutive,
  updateMemberProfile, resetMemberPassword, deleteMember, getDashboardStats,
  getMyRegisteredEvents,
};
