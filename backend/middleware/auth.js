'use strict';

const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/db');

async function loadActiveUser(decoded) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, is_active FROM users WHERE id = ? LIMIT 1',
    [decoded.id]
  );
  const user = rows[0];
  if (!user || !user.is_active) return null;
  return { ...decoded, id: user.id, name: user.name, email: user.email, role: user.role };
}

async function authenticate(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided. Please log in.' });
  }
  const token = header.split(' ')[1];
  let decoded;
  try {
    decoded = verifyToken(token);
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
  }
  try {
    req.user = await loadActiveUser(decoded);
    if (!req.user) {
      return res.status(403).json({ success: false, message: 'Account is deactivated or no longer exists.' });
    }
    next();
  } catch (err) {
    next(err);
  }
}

async function optionalAuthenticate(req, res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith('Bearer ')) {
    const token = header.split(' ')[1];
    try {
      const decoded = verifyToken(token);
      req.user = await loadActiveUser(decoded);
    } catch (err) {
      // Invalid optional credentials are treated as a guest session.
      if (err && !['JsonWebTokenError','TokenExpiredError','NotBeforeError'].includes(err.name)) {
        return next(err);
      }
    }
  }
  next();
}

module.exports = { authenticate, optionalAuthenticate };
