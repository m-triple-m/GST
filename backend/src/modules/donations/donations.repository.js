'use strict';
const db = require('../../config/db');

const createDonation = async (data, userId) => {
  const { donor_name, donor_email, amount, is_monthly, payment_method } = data;
  const [r] = await db.execute(
    `INSERT INTO donations (donor_name, donor_email, amount, is_monthly, payment_method, payment_status, user_id)
     VALUES (?,?,?,?,?,'pending',?)`,
    [donor_name||null, donor_email, amount, is_monthly?1:0, payment_method||'card', userId||null]
  );
  // Simulate payment success (in production, hook into Stripe webhook)
  await db.execute("UPDATE donations SET payment_status='completed' WHERE id=?", [r.insertId]);
  return r.insertId;
};

const listDonations = async ({ limit, offset }) => {
  const safeLimit = Math.max(1, parseInt(limit, 10) || 20);
  const safeOffset = Math.max(0, parseInt(offset, 10) || 0);
  const [rows] = await db.query(
    `SELECT * FROM donations ORDER BY donated_at DESC LIMIT ${safeLimit} OFFSET ${safeOffset}`
  );
  return rows;
};

const countDonations = async () => {
  const [rows] = await db.execute('SELECT COUNT(*) as total FROM donations');
  return rows[0].total;
};

const getTotalDonated = async () => {
  const [rows] = await db.execute("SELECT COALESCE(SUM(amount),0) as total FROM donations WHERE payment_status='completed'");
  return rows[0].total;
};

module.exports = { createDonation, listDonations, countDonations, getTotalDonated };
