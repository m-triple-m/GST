'use strict';
const db = require('../src/config/db');

async function run() {
  console.log('Running membership expiration migration...');
  
  // 1. Modify status ENUM
  console.log('1. Modifying status ENUM to include expired...');
  await db.query(`ALTER TABLE members MODIFY COLUMN status ENUM('pending','active','inactive','expired') DEFAULT 'pending'`);

  // 2. Add expires_at column if not exists
  const [cols] = await db.query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_SCHEMA = DATABASE() 
      AND TABLE_NAME = 'members' 
      AND COLUMN_NAME = 'expires_at'
  `);

  if (cols.length === 0) {
    console.log('2. Adding expires_at column and index...');
    await db.query(`ALTER TABLE members ADD COLUMN expires_at DATETIME NULL AFTER joined_at`);
    await db.query(`ALTER TABLE members ADD INDEX idx_expires_at (expires_at)`);
  } else {
    console.log('2. Column expires_at already exists.');
  }

  // 3. Backfill active members without expires_at to 1 year from joined_at
  console.log('3. Backfilling expires_at for active members...');
  const [backfill] = await db.query(`
    UPDATE members 
    SET expires_at = DATE_ADD(COALESCE(joined_at, NOW()), INTERVAL 1 YEAR) 
    WHERE expires_at IS NULL AND status = 'active'
  `);
  console.log(`Updated ${backfill.affectedRows} members with initial expires_at.`);

  // 4. Update expired status for members whose expiration date has passed
  console.log('4. Checking for already expired memberships...');
  const [expiredResult] = await db.query(`
    UPDATE members 
    SET status = 'expired' 
    WHERE status = 'active' AND expires_at IS NOT NULL AND expires_at < NOW()
  `);
  console.log(`Marked ${expiredResult.affectedRows} members as expired.`);

  console.log('✅ Migration completed successfully!');
  process.exit(0);
}

run().catch((err) => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
