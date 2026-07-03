/**
 * seed-admin.js
 * Run once to create an admin user:
 *   node seed-admin.js
 */
'use strict';
require('dotenv').config();
const bcrypt = require('bcrypt');
const db     = require('./src/config/db');

const EMAIL    = 'admin@gst.com';
const PASSWORD = 'admin123';

async function main() {
  const hash = await bcrypt.hash(PASSWORD, 12);
  try {
    const [result] = await db.execute(
      `INSERT INTO users (email, password_hash, role, is_active) VALUES (?, ?, 'admin', 1)`,
      [EMAIL, hash]
    );
    console.log(`✅  Admin user created  (id=${result.insertId})`);
    console.log(`    Email   : ${EMAIL}`);
    console.log(`    Password: ${PASSWORD}`);
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      // user exists — just promote them to admin
      await db.execute(`UPDATE users SET role = 'admin' WHERE email = ?`, [EMAIL]);
      console.log(`ℹ️  User already exists — promoted to admin.`);
    } else {
      console.error('Error:', err.message);
    }
  }
  process.exit(0);
}

main();
