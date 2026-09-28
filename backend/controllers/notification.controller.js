'use strict';

const { pool } = require('../config/db');

// GET /api/notifications
async function list(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM notifications 
      WHERE user_id = ? 
      ORDER BY created_at DESC LIMIT 20
    `, [req.user.id]);

    const [[{ unread }]] = await pool.query(
      'SELECT COUNT(*) as unread FROM notifications WHERE user_id = ? AND is_read = FALSE',
      [req.user.id]
    );

    res.json({ success: true, notifications: rows, unreadCount: unread || 0 });
  } catch (err) { next(err); }
}

// PUT /api/notifications/:id/read
async function markRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification marked as read.' });
  } catch (err) { next(err); }
}

// PUT /api/notifications/read-all
async function markAllRead(req, res, next) {
  try {
    await pool.query(
      'UPDATE notifications SET is_read = TRUE WHERE user_id = ?',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read.' });
  } catch (err) { next(err); }
}

module.exports = { list, markRead, markAllRead };
