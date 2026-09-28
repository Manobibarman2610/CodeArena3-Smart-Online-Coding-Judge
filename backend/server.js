/* ════════════════════════════════════════════════════
   CODE ARENA — Express Server Entry Point
════════════════════════════════════════════════════ */
'use strict';

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express     = require('express');
const cors        = require('cors');
const morgan      = require('morgan');
const rateLimit   = require('express-rate-limit');
const { testConnection } = require('./config/db');
const { pool } = require('./config/db');

// ── Route Imports ──
const authRoutes        = require('./routes/auth.routes');
const userRoutes        = require('./routes/user.routes');
const problemRoutes     = require('./routes/problem.routes');
const submissionRoutes  = require('./routes/submission.routes');
const contestRoutes     = require('./routes/contest.routes');
const leaderboardRoutes = require('./routes/leaderboard.routes');
const facultyRoutes     = require('./routes/faculty.routes');
const notifRoutes       = require('./routes/notification.routes');
const practiceRoutes    = require('./routes/practice.routes');
const adminRoutes       = require('./routes/admin.routes');
const aiRoutes          = require('./routes/ai.routes');
const { errorHandler } = require('./middleware/errorHandler');
const { ensureAdminTables } = require('./services/admin.service');

const app  = express();
const PORT = process.env.PORT || 5173;

// ── Global Rate Limiter ──
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' }
});

// ── Submission Rate Limiter ──
const submitLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: req => req.configuredSubmissionLimit || 30,
  message: { success: false, message: 'Submission rate limit exceeded. Wait a minute.' }
});

async function loadSubmissionLimit(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT setting_value FROM admin_settings WHERE setting_key = ?', ['max_submissions_per_minute']);
    const configured = rows[0] ? Number(JSON.parse(rows[0].setting_value)) : 30;
    req.configuredSubmissionLimit = Number.isInteger(configured) && configured >= 1 && configured <= 300 ? configured : 30;
  } catch {
    req.configuredSubmissionLimit = 30;
  }
  next();
}

// ── Middleware ──
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman, server-to-server) or any localhost/127.0.0.1 port
    if (!origin || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    if (process.env.FRONTEND_URL && origin === process.env.FRONTEND_URL) {
      return callback(null, true);
    }
    return callback(null, true);
  },
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));
app.use(globalLimiter);

// ── Health Check ──
app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'CodeArena API is running 🚀', timestamp: new Date() });
});

// ── API Routes ──
app.use('/api/auth',          authRoutes);
app.use('/api/users',         userRoutes);
app.use('/api/problems',      problemRoutes);
app.use('/api/submissions',   loadSubmissionLimit, submitLimiter, submissionRoutes);
app.use('/api/contests',      contestRoutes);
app.use('/api/leaderboard',   leaderboardRoutes);
app.use('/api/faculty',       facultyRoutes);
app.use('/api/notifications', notifRoutes);
app.use('/api/practice',      practiceRoutes);
app.use('/api/admin',         adminRoutes);
app.use('/api/ai',            aiRoutes);

// ── Serve Frontend Static Files ──
app.use(express.static(path.join(__dirname, '../frontend')));

// ── 404 Handler ──
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

// ── Global Error Handler ──
app.use(errorHandler);

// ── Start Server ──
async function start() {
  await testConnection();
  await ensureAdminTables();
  app.listen(PORT, () => {
    console.log('\n╔══════════════════════════════════════╗');
    console.log(`║  CodeArena API running on port ${PORT}  ║`);
    console.log('╚══════════════════════════════════════╝\n');
  });
}

start();
