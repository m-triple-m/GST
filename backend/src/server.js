'use strict';
require('./config/db'); // Initialise DB pool on startup
const app    = require('./app');
const config = require('./config/env');
const cronJobs = require('./cron/reminders.job');

// Initialize background jobs
cronJobs.initCronJobs();

const server = app.listen(config.port, () => {
  console.log('');
  console.log('╔══════════════════════════════════════════╗');
  console.log('║   GST Backend API — Production Ready     ║');
  console.log('╠══════════════════════════════════════════╣');
  console.log(`║  PORT   : ${config.port}                            ║`);
  console.log(`║  ENV    : ${config.nodeEnv.padEnd(10)}                   ║`);
  console.log(`║  CORS   : ${config.frontendUrl.padEnd(10)}    ║`);
  console.log('╚══════════════════════════════════════════╝');
  console.log('');
});

// ── Graceful shutdown ────────────────────────────────────
const shutdown = (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed.');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));

// ── Uncaught error safety net ─────────────────────────────
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('UNHANDLED REJECTION:', reason);
  process.exit(1);
});
