'use strict';
const db = require('../src/config/db');

async function run() {
  try {
    const [rows] = await db.execute('DESCRIBE members');
    console.log('Columns in members table:\n' + rows.map(r => `  - ${r.Field}: ${r.Type} (Null: ${r.Null}, Default: ${r.Default})`).join('\n'));
    process.exit(0);
  } catch (err) {
    console.error('Error querying members table:', err.message);
    process.exit(1);
  }
}

run();
