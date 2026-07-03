'use strict';
const mysql = require('mysql2/promise');
const config = require('./env');

const pool = mysql.createPool({
  host:               config.db.host,
  port:               config.db.port,
  database:           config.db.database,
  user:               config.db.user,
  password:           config.db.password,
  waitForConnections: true,
  connectionLimit:    10,
  queueLimit:         0,
  timezone:           '+00:00',
  charset:            'utf8mb4',
});

// Test connection on startup
pool.getConnection()
  .then((conn) => {
    console.log(`✅  MySQL connected → ${config.db.host}:${config.db.port}/${config.db.database}`);
    conn.release();
  })
  .catch((err) => {
    console.error('❌  MySQL connection failed:', err.message);
    process.exit(1);
  });

module.exports = pool;
