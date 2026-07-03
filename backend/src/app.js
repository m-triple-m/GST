'use strict';
const express      = require('express');
const helmet       = require('helmet');
const cors         = require('cors');
const rateLimit    = require('express-rate-limit');
const config       = require('./config/env');

const { errorMiddleware, notFoundMiddleware } = require('./middleware/error.middleware');

// ── Route modules ────────────────────────────────────────
const authRoutes     = require('./modules/auth/auth.routes');
const membersRoutes  = require('./modules/members/members.routes');
const eventsRoutes   = require('./modules/events/events.routes');
const resourcesRoutes = require('./modules/resources/resources.routes');
const donationsRoutes = require('./modules/donations/donations.routes');
const contactRoutes  = require('./modules/contact/contact.routes');
const sponsorsRoutes = require('./modules/sponsors/sponsors.routes');
const adminRoutes    = require('./modules/admin/admin.routes');

const app = express();

// ── Security headers (helmet) ────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────
app.use(cors({
  origin:      config.frontendUrl,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ── Body parsers ─────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ── Static Files ─────────────────────────────────────────
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// ── Global rate limiter ──────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max:      200,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'Too many requests — please try again later' },
});
app.use(globalLimiter);

// ── Stricter limiter for auth endpoints ──────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message:  { success: false, message: 'Too many auth attempts — please try again later' },
});

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'GST API is running', timestamp: new Date().toISOString() });
});

// ── API Routes ────────────────────────────────────────────
app.use('/api/auth',      authLimiter, authRoutes);
app.use('/api/members',   membersRoutes);
app.use('/api/events',    eventsRoutes);
app.use('/api/resources', resourcesRoutes);
app.use('/api/donations', donationsRoutes);
app.use('/api/contact',   contactRoutes);
app.use('/api/sponsors',  sponsorsRoutes);
app.use('/api/admin',     adminRoutes);

// ── 404 handler ──────────────────────────────────────────
app.use(notFoundMiddleware);

// ── Global error handler (must be last) ──────────────────
app.use(errorMiddleware);

module.exports = app;
