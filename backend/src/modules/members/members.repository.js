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

const syncExpiredMembers = async () => {
  try {
    await db.execute(
      `UPDATE members 
       SET status = 'expired' 
       WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()`
    );
  } catch (err) {
    console.error('Failed to sync expired members:', err.message);
  }
};

const getMemberByUserId = async (userId) => {
  await syncExpiredMembers();
  const [rows] = await db.execute(
    `SELECT m.*, u.role
     FROM members m
     LEFT JOIN users u ON u.id = m.user_id
     WHERE m.user_id = ?`,
    [userId]
  );
  return rows[0] || null;
};

const getMemberByMemberId = async (memberId) => {
  const [rows] = await db.execute(
    `SELECT * FROM members WHERE member_id = ? LIMIT 1`,
    [memberId]
  );
  return rows[0] || null;
};

const getMemberByEmail = async (email) => {
  const [rows] = await db.execute(
    `SELECT id, member_id, email, status FROM members WHERE email = ?`,
    [email]
  );
  return rows[0] || null;
};

// ── Admin ─────────────────────────────────────────────────

const countMembers = async ({ search, status, tier, seg_status }) => {
  await syncExpiredMembers();
  let sql    = 'SELECT COUNT(*) as total FROM members m WHERE 1=1';
  const params = [];

  if (search) {
    sql += ' AND (m.member_id LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR m.nickname LIKE ? OR m.email LIKE ? OR m.company LIKE ? OR m.company_name LIKE ? OR m.job_title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like, like);
  }
  if (status)     { sql += ' AND m.status = ?';     params.push(status); }
  if (tier)       { sql += ' AND m.tier = ?';       params.push(tier); }
  if (seg_status) { sql += ' AND m.seg_status = ?'; params.push(seg_status); }

  const [rows] = await db.execute(sql, params);
  return rows[0].total;
};

const getAllForExport = async ({ search, status, tier, seg_status, sort, order } = {}) => {
  await syncExpiredMembers();
  const allowedSort  = ['joined_at', 'expires_at', 'member_id', 'first_name', 'last_name', 'status', 'company_name', 'tier', 'seg_status'];
  const allowedOrder = ['ASC', 'DESC'];
  const sortCol  = allowedSort.includes(sort) ? sort : 'joined_at';
  const sortDir  = allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  let sql = `SELECT m.id, m.member_id, m.first_name, m.last_name, m.nickname, m.email, m.phone,
                    COALESCE(m.company_name, m.company) AS company, m.company_name, m.job_title,
                    m.board_position, m.home_street, m.home_city, m.home_state, m.home_zip,
                    m.company_street, m.company_city, m.company_state, m.company_zip, m.company_phone,
                    m.seg_status, m.tgs_member, m.education, m.university, m.degree, m.major,
                    m.event_announcements, m.newsletter_opt_in, m.directory_visible, m.tier, m.status, m.joined_at, m.expires_at, m.is_executive
             FROM members m
             WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ' AND (m.member_id LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR m.nickname LIKE ? OR m.email LIKE ? OR m.company LIKE ? OR m.company_name LIKE ? OR m.job_title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like, like);
  }
  if (status)     { sql += ' AND m.status = ?';     params.push(status); }
  if (tier)       { sql += ' AND m.tier = ?';       params.push(tier); }
  if (seg_status) { sql += ' AND m.seg_status = ?'; params.push(seg_status); }

  sql += ` ORDER BY m.${sortCol} ${sortDir}`;

  const [rows] = await db.execute(sql, params);
  return rows;
};

const listMembers = async ({ search, status, tier, seg_status, sort, order, limit, offset }) => {
  await syncExpiredMembers();
  const allowedSort  = ['joined_at', 'expires_at', 'member_id', 'first_name', 'last_name', 'status', 'company_name', 'tier', 'seg_status'];
  const allowedOrder = ['ASC', 'DESC'];
  const sortCol  = allowedSort.includes(sort)          ? sort  : 'joined_at';
  const sortDir  = allowedOrder.includes(order?.toUpperCase()) ? order.toUpperCase() : 'DESC';

  let sql = `SELECT m.id, m.member_id, m.first_name, m.last_name, m.nickname, m.email, m.phone,
                    COALESCE(m.company_name, m.company) AS company, m.company_name, m.job_title,
                    m.board_position, m.home_street, m.home_city, m.home_state, m.home_zip,
                    m.company_street, m.company_city, m.company_state, m.company_zip, m.company_phone,
                    m.seg_status, m.tgs_member, m.education, m.university, m.degree, m.major,
                    m.avatar_url, m.privacy_policy, m.event_announcements, m.newsletter_opt_in, m.directory_visible, m.tier, m.status, m.joined_at, m.expires_at, m.is_executive
             FROM members m
             WHERE 1=1`;
  const params = [];

  if (search) {
    sql += ' AND (m.member_id LIKE ? OR m.first_name LIKE ? OR m.last_name LIKE ? OR m.nickname LIKE ? OR m.email LIKE ? OR m.company LIKE ? OR m.company_name LIKE ? OR m.job_title LIKE ?)';
    const like = `%${search}%`;
    params.push(like, like, like, like, like, like, like, like);
  }
  if (status)     { sql += ' AND m.status = ?';     params.push(status); }
  if (tier)       { sql += ' AND m.tier = ?';       params.push(tier); }
  if (seg_status) { sql += ' AND m.seg_status = ?'; params.push(seg_status); }

  const safeLimit  = parseInt(limit,  10) || 10;
  const safeOffset = parseInt(offset, 10) || 0;
  sql += ` ORDER BY m.${sortCol} ${sortDir} LIMIT ${safeLimit} OFFSET ${safeOffset}`;

  const [rows] = await db.execute(sql, params);
  return rows;
};

const getMemberById = async (id) => {
  await syncExpiredMembers();
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
    memberId, member_id,
    userId, email, firstName, lastName, nickname, phone,
    homeStreet, homeCity, homeState, homeZip,
    avatarUrl, privacyPolicy, eventAnnouncements, event_announcements, newsletterOptIn, newsletter_opt_in, directoryVisible, directory_visible,
    companyName, company, companyStreet, companyCity, companyState, companyZip, companyPhone,
    boardPosition, jobTitle, segStatus,
    university, degree, major, education, tgsMember,
    linkedin_url, experience, industry, motivation, referred, tier,
  } = data;

  const resolvedCompany = companyName || company || null;
  const resolvedMemberId = memberId || member_id || null;
  const resolvedEventAnnouncements = (eventAnnouncements !== undefined ? eventAnnouncements : (event_announcements !== undefined ? event_announcements : true)) ? 1 : 0;
  const resolvedNewsletterOptIn = (newsletterOptIn !== undefined ? newsletterOptIn : (newsletter_opt_in !== undefined ? newsletter_opt_in : true)) ? 1 : 0;
  const resolvedDirectoryVisible = (directoryVisible !== undefined ? directoryVisible : (directory_visible !== undefined ? directory_visible : true)) ? 1 : 0;
  const educationJson = education ? (typeof education === 'string' ? education : JSON.stringify(education)) : null;

  await db.execute(
    `INSERT INTO members
     (member_id, user_id, email, first_name, last_name, nickname, phone,
      home_street, home_city, home_state, home_zip,
      avatar_url, privacy_policy, event_announcements, newsletter_opt_in, directory_visible, linkedin_url,
      company, company_name, company_street, company_city, company_state, company_zip, company_phone,
      board_position, job_title, seg_status,
      university, degree, major, education, tgs_member,
      experience, industry, motivation, referred, tier, status)
     VALUES (?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, ?, ?,
             ?, ?, ?,
             ?, ?, ?, ?, ?,
             ?, ?, ?, ?, ?, 'pending')`,
    [
      resolvedMemberId, userId || null, email, firstName, lastName, nickname || null, phone || null,
      homeStreet || null, homeCity || null, homeState || null, homeZip || null,
      avatarUrl || null, privacyPolicy ? 1 : 0, resolvedEventAnnouncements, resolvedNewsletterOptIn, resolvedDirectoryVisible, linkedin_url || null,
      resolvedCompany, resolvedCompany, companyStreet || null, companyCity || null, companyState || null, companyZip || null, companyPhone || null,
      boardPosition || null, jobTitle || null, segStatus || 'non-member',
      university || null, degree || null, major || null, educationJson, tgsMember ? 1 : 0,
      experience || null, industry || null, motivation || null, referred ? 1 : 0, tier || 'professional'
    ]
  );
};

const updateMemberStatus = async (id, status, expiresAt) => {
  let sql = 'UPDATE members SET status = ?';
  const params = [status];

  if (status === 'active') {
    if (expiresAt) {
      sql += ', expires_at = ?';
      params.push(expiresAt);
    } else {
      sql += ', expires_at = CASE WHEN expires_at IS NULL OR expires_at < NOW() THEN DATE_ADD(NOW(), INTERVAL 1 YEAR) ELSE expires_at END';
    }
  } else if (expiresAt !== undefined) {
    sql += ', expires_at = ?';
    params.push(expiresAt);
  }

  sql += ' WHERE id = ?';
  params.push(id);

  const [result] = await db.execute(sql, params);

  // Keep user active for active or expired so they can access dashboard/renew
  if (status === 'active' || status === 'expired') {
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

const renewMember = async (id, months = 12) => {
  const [result] = await db.execute(
    `UPDATE members
     SET status = 'active',
         expires_at = DATE_ADD(
           CASE 
             WHEN expires_at IS NOT NULL AND expires_at > NOW() THEN expires_at 
             ELSE NOW() 
           END, 
           INTERVAL ? MONTH
         )
     WHERE id = ?`,
    [Number(months) || 12, id]
  );
  if (result.affectedRows > 0) {
    await db.execute(
      'UPDATE users SET is_active = 1 WHERE id = (SELECT user_id FROM members WHERE id = ?)',
      [id]
    );
    return true;
  }
  return false;
};

const updateMemberExpiration = async (id, expiresAt) => {
  const [result] = await db.execute(
    `UPDATE members 
     SET expires_at = ?,
         status = CASE 
           WHEN ? > NOW() AND status = 'expired' THEN 'active'
           WHEN ? <= NOW() AND status = 'active' THEN 'expired'
           ELSE status
         END
     WHERE id = ?`,
    [expiresAt, expiresAt, expiresAt, id]
  );
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
    'avatar_url', 'privacy_policy', 'event_announcements', 'newsletter_opt_in', 'directory_visible', 'linkedin_url',
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
      } else if (f === 'privacy_policy' || f === 'tgs_member' || f === 'event_announcements' || f === 'newsletter_opt_in' || f === 'directory_visible') {
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

const updateMemberById = async (id, data) => {
  const fields = [];
  const values = [];

  // Map potential camelCase keys to database column names
  const keyMap = {
    memberId: 'member_id',
    member_id: 'member_id',
    firstName: 'first_name',
    lastName: 'last_name',
    nickname: 'nickname',
    email: 'email',
    phone: 'phone',
    homeStreet: 'home_street',
    homeCity: 'home_city',
    homeState: 'home_state',
    homeZip: 'home_zip',
    avatarUrl: 'avatar_url',
    eventAnnouncements: 'event_announcements',
    event_announcements: 'event_announcements',
    newsletterOptIn: 'newsletter_opt_in',
    newsletter_opt_in: 'newsletter_opt_in',
    directoryVisible: 'directory_visible',
    directory_visible: 'directory_visible',
    linkedinUrl: 'linkedin_url',
    company: 'company',
    companyName: 'company_name',
    companyStreet: 'company_street',
    companyCity: 'company_city',
    companyState: 'company_state',
    companyZip: 'company_zip',
    companyPhone: 'company_phone',
    boardPosition: 'board_position',
    jobTitle: 'job_title',
    segStatus: 'seg_status',
    tgsMember: 'tgs_member',
    education: 'education',
    university: 'university',
    degree: 'degree',
    major: 'major',
    tier: 'tier',
    status: 'status',
    expiresAt: 'expires_at',
    expires_at: 'expires_at',
    isExecutive: 'is_executive',
    is_executive: 'is_executive',
    experience: 'experience',
    industry: 'industry',
    motivation: 'motivation',
  };

  const allowedCols = [
    'member_id', 'first_name', 'last_name', 'nickname', 'email', 'phone',
    'home_street', 'home_city', 'home_state', 'home_zip',
    'avatar_url', 'privacy_policy', 'event_announcements', 'newsletter_opt_in', 'directory_visible', 'linkedin_url',
    'company', 'company_name', 'company_street', 'company_city', 'company_state', 'company_zip', 'company_phone',
    'board_position', 'job_title', 'seg_status',
    'university', 'degree', 'major', 'education', 'tgs_member',
    'experience', 'industry', 'motivation', 'tier', 'status', 'expires_at', 'is_executive'
  ];

  // Normalize incoming keys
  const normalizedData = {};
  for (const [k, v] of Object.entries(data)) {
    const colName = keyMap[k] || k;
    if (allowedCols.includes(colName)) {
      normalizedData[colName] = v;
    }
  }

  for (const [col, val] of Object.entries(normalizedData)) {
    if (val !== undefined) {
      if (col === 'education' && typeof val === 'object' && val !== null) {
        fields.push(`${col} = ?`);
        values.push(JSON.stringify(val));
      } else if (col === 'privacy_policy' || col === 'tgs_member' || col === 'is_executive' || col === 'event_announcements' || col === 'newsletter_opt_in' || col === 'directory_visible') {
        fields.push(`${col} = ?`);
        values.push(val ? 1 : 0);
      } else if (col === 'expires_at' && val === '') {
        fields.push(`${col} = ?`);
        values.push(null);
      } else {
        fields.push(`${col} = ?`);
        values.push(val === '' ? null : val);
      }
    }
  }

  // If company_name is updated, sync legacy company column
  if (normalizedData.company_name !== undefined && normalizedData.company === undefined) {
    fields.push('company = ?');
    values.push(normalizedData.company_name);
  }

  if (!fields.length) return false;
  values.push(id);
  const [result] = await db.execute(
    `UPDATE members SET ${fields.join(', ')} WHERE id = ?`,
    values
  );

  // Sync users table if email was changed
  if (normalizedData.email) {
    await db.execute(
      `UPDATE users SET email = ? WHERE id = (SELECT user_id FROM members WHERE id = ?)`,
      [normalizedData.email, id]
    );
  }

  // Sync users table is_active if status was changed
  if (normalizedData.status) {
    if (normalizedData.status === 'active' || normalizedData.status === 'expired') {
      await db.execute(
        'UPDATE users SET is_active = 1 WHERE id = (SELECT user_id FROM members WHERE id = ?)',
        [id]
      );
    } else if (normalizedData.status === 'inactive') {
      await db.execute(
        'UPDATE users SET is_active = 0 WHERE id = (SELECT user_id FROM members WHERE id = ?)',
        [id]
      );
    }
  }

  // Sync users role if is_executive was changed
  if (normalizedData.is_executive !== undefined) {
    await db.execute(
      `UPDATE users SET role = ? WHERE id = (SELECT user_id FROM members WHERE id = ?)`,
      [normalizedData.is_executive ? 'executive' : 'member', id]
    );
  }

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
  await syncExpiredMembers();
  const [[{ total }]] = await db.execute('SELECT COUNT(*) as total FROM members');
  const [[{ pending }]] = await db.execute("SELECT COUNT(*) as pending FROM members WHERE status='pending'");
  const [[{ active }]] = await db.execute("SELECT COUNT(*) as active FROM members WHERE status='active'");
  const [[{ expired }]] = await db.execute("SELECT COUNT(*) as expired FROM members WHERE status='expired'");
  return { total, pending, active, expired };
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
  getAllForExport,
  getMemberByMemberId,
  getExecutiveBoard, getExecutiveById, getMemberByUserId, getMemberByEmail,
  countMembers, listMembers, getMemberById,
  createMemberApplication, updateMemberStatus, toggleMemberExecutive,
  updateMemberProfile, updateMemberById, resetMemberPassword, deleteMember, getDashboardStats,
  getMyRegisteredEvents, renewMember, updateMemberExpiration, syncExpiredMembers,
};
