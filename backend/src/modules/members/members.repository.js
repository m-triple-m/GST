'use strict';
const db = require('../../config/db');

// ── Public / Member ──────────────────────────────────────

const getExecutiveBoard = async () => {
  const [rows] = await db.execute(
    `SELECT m.id, m.first_name, m.last_name, m.nickname, m.board_position, m.exec_position,
            m.exec_bio, m.exec_photo_url, m.avatar_url,
            COALESCE(m.exec_photo_url, m.avatar_url) AS profile_image,
            COALESCE(m.company_name, m.company) AS company, m.company_name, m.job_title,
            m.seg_status, m.tgs_member, m.education, m.university, m.degree, m.major, m.joined_at
     FROM members m
     WHERE m.is_executive = 1 AND m.status = 'active'
     ORDER BY COALESCE(m.board_position, m.exec_position, m.first_name)`
  );
  return rows;
};

const getExecutiveById = async (id) => {
  const [rows] = await db.execute(
    `SELECT m.id, m.first_name, m.last_name, m.nickname, m.board_position, m.exec_position,
            m.exec_bio, m.exec_photo_url, m.avatar_url,
            COALESCE(m.exec_photo_url, m.avatar_url) AS profile_image,
            COALESCE(m.company_name, m.company) AS company, m.company_name, m.job_title,
            m.seg_status, m.tgs_member, m.education, m.university, m.degree, m.major,
            m.email, m.phone, m.company_phone, m.company_city, m.company_state,
            m.linkedin_url, m.industry, m.experience, m.tier, m.joined_at
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

const countMembers = async ({ search, status, tier, seg_status }) => {
  let sql    = 'SELECT COUNT(*) as total FROM members m WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.nickname LIKE ? OR m.email LIKE ? OR m.company LIKE ? OR m.company_name LIKE ? OR m.job_title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (status)     { sql += ' AND m.status = ?';     params.push(status); }
  if (tier)       { sql += ' AND m.tier = ?';       params.push(tier); }
  if (seg_status) { sql += ' AND m.seg_status = ?'; params.push(seg_status); }

  const [rows] = await db.execute(sql, params);
  return rows[0].total;
};

const listMembers = async ({ search, status, tier, seg_status, sort, order, limit, offset }) => {
  const allowedSort  = ['joined_at', 'first_name', 'last_name', 'status', 'company_name', 'tier', 'seg_status'];
  const allowedOrder = ['ASC', 'DESC'];
  const sortCol  = allowedSort.includes(sort)          ? sort  : 'joined_at';
  const sortDir  = allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  let sql = `SELECT m.id, m.first_name, m.last_name, m.nickname, m.email, m.phone,
                    COALESCE(m.company_name, m.company) AS company, m.company_name, m.job_title,
                    m.board_position, m.home_street, m.home_city, m.home_state, m.home_zip,
                    m.company_street, m.company_city, m.company_state, m.company_zip, m.company_phone,
                    m.seg_status, m.tgs_member, m.education, m.university, m.degree, m.major,
                    m.avatar_url, m.privacy_policy, m.tier, m.status, m.joined_at, m.is_executive
             FROM members m
             WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ' AND (m.first_name LIKE ? OR m.last_name LIKE ? OR m.nickname LIKE ? OR m.email LIKE ? OR m.company LIKE ? OR m.company_name LIKE ? OR m.job_title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like);
  }
  if (status)     { sql += ' AND m.status = ?';     params.push(status); }
  if (tier)       { sql += ' AND m.tier = ?';       params.push(tier); }
  if (seg_status) { sql += ' AND m.seg_status = ?'; params.push(seg_status); }

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
    userId, email, firstName, lastName, nickname, phone,
    homeStreet, homeCity, homeState, homeZip,
    avatarUrl, privacyPolicy,
    companyName, company, companyStreet, companyCity, companyState, companyZip, companyPhone,
    boardPosition, jobTitle, segStatus,
    university, degree, major, education, tgsMember,
    linkedin_url, experience, industry, motivation, referred, tier,
  } = data;

  const resolvedCompany = companyName || company || null;
  const educationJson = education ? (typeof education === 'string' ? education : JSON.stringify(education)) : null;

  await db.execute(
    `INSERT INTO members
     (user_id, email, first_name, last_name, nickname, phone,
      home_street, home_city, home_state, home_zip,
      avatar_url, privacy_policy, linkedin_url,
      company, company_name, company_street, company_city, company_state, company_zip, company_phone,
      board_position, job_title, seg_status,
      university, degree, major, education, tgs_member,
      experience, industry, motivation, referred, tier, status)
     VALUES (?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?,
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, 'pending')`,
    [
      userId || null, email, firstName, lastName, nickname || null, phone || null,
      homeStreet || null, homeCity || null, homeState || null, homeZip || null,
      avatarUrl || null, privacyPolicy ? 1 : 0, linkedin_url || null,
      resolvedCompany, resolvedCompany, companyStreet || null, companyCity || null, companyState || null, companyZip || null, companyPhone || null,
      boardPosition || null, jobTitle || null, segStatus || 'non-member',
      university || null, degree || null, major || null, educationJson, tgsMember ? 1 : 0,
      experience || null, industry || null, motivation || null, referred ? 1 : 0, tier || 'professional'
    ]
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
  const allowed = [
    'first_name', 'last_name', 'nickname', 'phone',
    'home_street', 'home_city', 'home_state', 'home_zip',
    'avatar_url', 'privacy_policy', 'linkedin_url',
    'company', 'company_name', 'company_street', 'company_city', 'company_state', 'company_zip', 'company_phone',
    'board_position', 'job_title', 'seg_status',
    'university', 'degree', 'major', 'education', 'tgs_member',
    'experience', 'industry', 'motivation',
  ];

  allowed.forEach((f) => {
    if (data[f] !== undefined) {
      if (f === 'education' && typeof data[f] === 'object' && data[f] !== null) {
        fields.push(`${f} = ?`);
        values.push(JSON.stringify(data[f]));
      } else if (f === 'privacy_policy' || f === 'tgs_member') {
        fields.push(`${f} = ?`);
        values.push(data[f] ? 1 : 0);
      } else {
        fields.push(`${f} = ?`);
        values.push(data[f]);
      }
    }
  });

  // If company_name is updated, also update company for legacy compatibility
  if (data.company_name !== undefined && data.company === undefined) {
    fields.push('company = ?');
    values.push(data.company_name);
  }

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
