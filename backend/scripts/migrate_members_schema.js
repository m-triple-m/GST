'use strict';
const db = require('../src/config/db');

async function migrate() {
  console.log('🔄 Running members table schema migration...');

  const columnsToAdd = [
    { name: 'home_street', type: 'VARCHAR(255) NULL' },
    { name: 'home_city', type: 'VARCHAR(100) NULL' },
    { name: 'home_state', type: 'VARCHAR(100) NULL' },
    { name: 'home_zip', type: 'VARCHAR(30) NULL' },
    { name: 'avatar_url', type: 'VARCHAR(500) NULL' },
    { name: 'privacy_policy', type: 'TINYINT(1) DEFAULT 0' },
    { name: 'nickname', type: 'VARCHAR(100) NULL' },
    { name: 'company_name', type: 'VARCHAR(255) NULL' },
    { name: 'company_street', type: 'VARCHAR(255) NULL' },
    { name: 'company_city', type: 'VARCHAR(100) NULL' },
    { name: 'company_state', type: 'VARCHAR(100) NULL' },
    { name: 'company_zip', type: 'VARCHAR(30) NULL' },
    { name: 'company_phone', type: 'VARCHAR(30) NULL' },
    { name: 'board_position', type: 'VARCHAR(150) NULL' },
    { name: 'seg_status', type: "ENUM('active','associate','emeritus','student','non-member') DEFAULT 'non-member'" },
    { name: 'university', type: 'VARCHAR(255) NULL' },
    { name: 'degree', type: 'VARCHAR(100) NULL' },
    { name: 'major', type: 'VARCHAR(150) NULL' },
    { name: 'education', type: 'JSON NULL' },
    { name: 'tgs_member', type: 'TINYINT(1) DEFAULT 0' },
  ];

  try {
    const [existingCols] = await db.execute('DESCRIBE members');
    const existingColNames = new Set(existingCols.map(c => c.Field));

    for (const col of columnsToAdd) {
      if (!existingColNames.has(col.name)) {
        console.log(`➕ Adding column ${col.name}...`);
        await db.execute(`ALTER TABLE members ADD COLUMN ${col.name} ${col.type}`);
      } else {
        console.log(`✓ Column ${col.name} already exists.`);
      }
    }

    // Also populate company_name from company if empty
    await db.execute(`UPDATE members SET company_name = company WHERE company_name IS NULL AND company IS NOT NULL`);

    console.log('✅ Members table schema migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
}

migrate();
