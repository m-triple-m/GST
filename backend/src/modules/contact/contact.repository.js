'use strict';
const db = require('../../config/db');

const saveInquiry = async (data) => {
  const { name, email, subject, message } = data;
  const [r] = await db.execute(
    'INSERT INTO contact_inquiries (name, email, subject, message) VALUES (?,?,?,?)',
    [name, email, subject, message]
  );
  return r.insertId;
};

const listInquiries = async ({ limit, offset }) => {
  const [rows] = await db.execute(
    'SELECT * FROM contact_inquiries ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [limit, offset]
  );
  return rows;
};

const countInquiries = async () => {
  const [[{total}]] = await db.execute('SELECT COUNT(*) as total FROM contact_inquiries');
  return total;
};

const markAsRead = async (id) => {
  await db.execute('UPDATE contact_inquiries SET is_read = 1 WHERE id = ?', [id]);
};

const subscribe = async (email) => {
  await db.execute(
    'INSERT IGNORE INTO newsletter_subscribers (email) VALUES (?)',
    [email]
  );
};

module.exports = { saveInquiry, listInquiries, countInquiries, markAsRead, subscribe };
