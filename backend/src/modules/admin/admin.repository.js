'use strict';
const db = require('../../config/db');

const getDashboardStats = async () => {
  const [[{ total_members }]] = await db.execute('SELECT COUNT(*) as total_members FROM members');
  const [[{ pending_applications }]] = await db.execute("SELECT COUNT(*) as pending_applications FROM members WHERE status='pending'");
  const [[{ active_events }]] = await db.execute("SELECT COUNT(*) as active_events FROM events WHERE status='upcoming'");
  const [[{ total_donations }]] = await db.execute("SELECT COALESCE(SUM(amount),0) as total_donations FROM donations WHERE payment_status='completed'");
  const [[{ total_registrations }]] = await db.execute('SELECT COUNT(*) as total_registrations FROM event_registrations');
  const [[{ unread_inquiries }]] = await db.execute('SELECT COUNT(*) as unread_inquiries FROM contact_inquiries WHERE is_read=0');
  const [[{ new_sponsor_enquiries }]] = await db.execute("SELECT COUNT(*) as new_sponsor_enquiries FROM sponsor_enquiries WHERE status='new'");

  // Membership growth over the last 12 months (including current month)
  const [growth_data] = await db.execute(`
    SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count 
    FROM members 
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL 11 MONTH)
    GROUP BY month 
    ORDER BY month ASC
  `);

  return {
    total_members,
    pending_applications,
    active_events,
    total_donations,
    total_registrations,
    unread_inquiries,
    new_sponsor_enquiries,
    membership_growth: growth_data,
  };
};

const getAuditLog = async ({ limit, offset }) => {
  const [rows] = await db.execute(
    `SELECT a.*, u.email as user_email
     FROM audit_logs a
     LEFT JOIN users u ON u.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT ? OFFSET ?`,
    [Number(limit), Number(offset)]
  );
  return rows;
};

const countAuditLog = async () => {
  const [[{total}]] = await db.execute('SELECT COUNT(*) as total FROM audit_logs');
  return total;
};

const writeAuditLog = async (userId, action, target, meta) => {
  await db.execute(
    'INSERT INTO audit_logs (user_id, action, target, meta) VALUES (?,?,?,?)',
    [userId || null, action, target || null, meta ? JSON.stringify(meta) : null]
  );
};

module.exports = { getDashboardStats, getAuditLog, countAuditLog, writeAuditLog };
