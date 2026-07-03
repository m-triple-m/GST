'use strict';
const db = require('../../config/db');

const saveEnquiry = async (data) => {
  const { company_name, contact_name, email, phone, tier_interest, message } = data;
  const [r] = await db.execute(
    'INSERT INTO sponsor_enquiries (company_name, contact_name, email, phone, tier_interest, message) VALUES (?,?,?,?,?,?)',
    [company_name, contact_name, email, phone||null, tier_interest||null, message||null]
  );
  return r.insertId;
};

const listEnquiries = async ({ limit, offset }) => {
  const [rows] = await db.execute(
    'SELECT * FROM sponsor_enquiries ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
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

module.exports = { saveEnquiry, listEnquiries, countEnquiries, updateEnquiryStatus };
