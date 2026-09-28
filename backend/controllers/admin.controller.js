'use strict';

const { pool } = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { logActivity, DEFAULT_SETTINGS, DEFAULT_PERMISSIONS } = require('../services/admin.service');

// GET /api/admin/users
async function listUsers(req, res, next) {
  try {
    const { role, search } = req.query;
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;
    let where = ['1=1'];
    const params = [];
    if (role)   { where.push('u.role = ?');              params.push(role); }
    if (search) { where.push('(u.name LIKE ? OR u.email LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.role, u.institution, u.rating, u.is_active, u.created_at
      FROM users u WHERE ${where.join(' AND ')}
      ORDER BY u.created_at DESC LIMIT ? OFFSET ?
    `, [...params, +limit, offset]);

    const [[{total}]] = await pool.query(`SELECT COUNT(*) AS total FROM users u WHERE ${where.join(' AND ')}`, params);
    res.json({ success: true, users: rows, total });
  } catch (err) { next(err); }
}

// PUT /api/admin/users/:id/role
async function changeRole(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const { role } = req.body;
    if (!['student','faculty','admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }
    if (userId === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You cannot change your own role.' });
    }
    const [existing] = await pool.query('SELECT id, role FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found.' });
    await pool.query('UPDATE users SET role = ? WHERE id = ?', [role, userId]);
    await logActivity({ actor: req.user, targetUserId: userId, action: 'user.role_changed', details: { from: existing[0].role, to: role } });
    res.json({ success: true, message: `User role updated to ${role}.` });
  } catch (err) { next(err); }
}

// DELETE /api/admin/users/:id
async function deleteUser(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    if (userId === Number(req.user.id)) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found.' });
    await pool.query('UPDATE users SET is_active = FALSE WHERE id = ?', [userId]);
    await logActivity({ actor: req.user, targetUserId: userId, action: 'user.deactivated' });
    res.json({ success: true, message: 'User deactivated.' });
  } catch (err) { next(err); }
}

// PUT /api/admin/users/:id/status
async function updateUserStatus(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    if (!Number.isSafeInteger(userId) || userId < 1) {
      return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    }
    const { is_active: isActive } = req.body;
    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ success: false, message: 'is_active must be true or false.' });
    }
    if (userId === Number(req.user.id) && !isActive) {
      return res.status(400).json({ success: false, message: 'You cannot deactivate your own account.' });
    }
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found.' });
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [isActive, userId]);
    await logActivity({ actor: req.user, targetUserId: userId, action: isActive ? 'user.activated' : 'user.deactivated' });
    res.json({ success: true, message: `User account ${isActive ? 'activated' : 'deactivated'}.` });
  } catch (err) { next(err); }
}

// GET /api/admin/stats
async function platformStats(req, res, next) {
  try {
    const [[users]]       = await pool.query(`SELECT COUNT(*) AS total_users,
      SUM(CASE WHEN role = 'student' THEN 1 ELSE 0 END) AS students,
      SUM(CASE WHEN role = 'faculty' THEN 1 ELSE 0 END) AS faculty,
      SUM(CASE WHEN role = 'admin' THEN 1 ELSE 0 END) AS admins,
      SUM(CASE WHEN role = 'student' AND is_active = TRUE THEN 1 ELSE 0 END) AS active_students,
      SUM(CASE WHEN role = 'faculty' AND is_active = TRUE THEN 1 ELSE 0 END) AS active_faculty,
      SUM(CASE WHEN is_active = TRUE AND last_active >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) AS active_users_7d
      FROM users`);
    const [[problems]]    = await pool.query('SELECT COUNT(*) AS count FROM problems WHERE is_public = TRUE');
    const [[contests]]    = await pool.query('SELECT COUNT(*) AS count FROM contests');
    const [[submissions]] = await pool.query('SELECT COUNT(*) AS count FROM submissions');
    const [[recentSubmissions]] = await pool.query('SELECT COUNT(*) AS count FROM submissions WHERE submitted_at >= DATE_SUB(NOW(), INTERVAL 24 HOUR)');
    res.json({
      success: true,
      stats: {
        total_users:       users.total_users || 0,
        active_students:   users.active_students || 0,
        active_faculty:    users.active_faculty || 0,
        students:          users.students || 0,
        faculty:           users.faculty || 0,
        admins:            users.admins || 0,
        active_users_7d:   users.active_users_7d || 0,
        total_problems:    problems.count,
        total_contests:    contests.count,
        total_submissions: submissions.count,
        submissions_24h:   recentSubmissions.count,
      }
    });
  } catch (err) { next(err); }
}

// GET /api/admin/system/health
async function systemHealth(req, res, next) {
  try {
    await pool.query('SELECT 1');
    res.json({
      success: true,
      status: 'healthy',
      uptime_seconds: Math.floor(process.uptime()),
      checked_at: new Date().toISOString(),
      services: { api: 'healthy', database: 'healthy' }
    });
  } catch (err) { next(err); }
}

// GET /api/admin/roles
function listRoles(req, res) {
  res.json({
    success: true,
    roles: [
      { role: 'student', description: 'Practice, submit solutions, and join contests.' },
      { role: 'faculty', description: 'Manage teaching content, assignments, contests, and student analytics.' },
      { role: 'admin', description: 'Manage accounts and access, platform content, contests, assignments, and system health.' }
    ]
  });
}

async function createUser(req, res, next) {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const institution = String(req.body.institution || '').trim() || null;
    const password = String(req.body.password || '');
    const role = req.body.role;
    if (name.length < 2 || name.length > 100) return res.status(400).json({ success: false, message: 'Name must be 2–100 characters.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Password must be at least 8 characters.' });
    if (!['student', 'faculty', 'admin'].includes(role)) return res.status(400).json({ success: false, message: 'Select a valid role.' });
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ success: false, message: 'That email is already registered.' });
    const passwordHash = await hashPassword(password);
    const [result] = await pool.query(
      'INSERT INTO users (name, email, password_hash, role, institution, is_active) VALUES (?, ?, ?, ?, ?, TRUE)',
      [name, email, passwordHash, role, institution]
    );
    await logActivity({ actor: req.user, targetUserId: result.insertId, action: 'user.created', details: { role, email } });
    res.status(201).json({ success: true, message: `${role} account created.`, userId: result.insertId });
  } catch (err) { next(err); }
}

async function resetUserPassword(req, res, next) {
  try {
    const userId = Number.parseInt(req.params.id, 10);
    const password = String(req.body.password || '');
    if (!Number.isSafeInteger(userId) || userId < 1) return res.status(400).json({ success: false, message: 'Invalid user ID.' });
    if (password.length < 8) return res.status(400).json({ success: false, message: 'Temporary password must be at least 8 characters.' });
    const [existing] = await pool.query('SELECT id FROM users WHERE id = ?', [userId]);
    if (!existing.length) return res.status(404).json({ success: false, message: 'User not found.' });
    await pool.query('UPDATE users SET password_hash = ? WHERE id = ?', [await hashPassword(password), userId]);
    await logActivity({ actor: req.user, targetUserId: userId, action: 'user.password_reset' });
    res.json({ success: true, message: 'Password reset successfully.' });
  } catch (err) { next(err); }
}

async function getSettings(req, res, next) {
  try {
    const [rows] = await pool.query('SELECT setting_key, setting_value FROM admin_settings');
    const settings = { ...DEFAULT_SETTINGS };
    for (const row of rows) {
      try { settings[row.setting_key] = JSON.parse(row.setting_value); } catch { settings[row.setting_key] = row.setting_value; }
    }
    res.json({ success: true, settings });
  } catch (err) { next(err); }
}

async function updateSettings(req, res, next) {
  try {
    const allowed = Object.keys(DEFAULT_SETTINGS);
    const updates = req.body.settings;
    if (!updates || typeof updates !== 'object' || Array.isArray(updates)) return res.status(400).json({ success: false, message: 'settings object required.' });
    for (const [key, value] of Object.entries(updates)) {
      if (!allowed.includes(key)) return res.status(400).json({ success: false, message: `Setting '${key}' cannot be changed.` });
      if (key === 'platform_name' && (typeof value !== 'string' || !value.trim() || value.length > 80)) return res.status(400).json({ success: false, message: 'Platform name must be 1–80 characters.' });
      if (['registration_open', 'maintenance_mode'].includes(key) && typeof value !== 'boolean') return res.status(400).json({ success: false, message: `${key} must be true or false.` });
      if (key === 'max_submissions_per_minute' && (!Number.isInteger(value) || value < 1 || value > 300)) return res.status(400).json({ success: false, message: 'Submission limit must be between 1 and 300.' });
    }
    for (const [key, value] of Object.entries(updates)) {
      await pool.query(`INSERT INTO admin_settings (setting_key, setting_value, updated_by) VALUES (?, ?, ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value), updated_by = VALUES(updated_by)`, [key, JSON.stringify(value), req.user.id]);
    }
    await logActivity({ actor: req.user, action: 'settings.updated', details: { keys: Object.keys(updates) } });
    res.json({ success: true, message: 'Platform settings saved.' });
  } catch (err) { next(err); }
}

async function getPermissions(req, res) {
  res.json({ success: true, permissions: DEFAULT_PERMISSIONS, enforcement: 'Role access is enforced by authenticated backend route guards.' });
}

async function getActivity(req, res, next) {
  try {
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 40));
    const [rows] = await pool.query(`SELECT id, actor_user_id, actor_name, actor_role, target_user_id, action, details, created_at
      FROM admin_audit_logs ORDER BY created_at DESC LIMIT ?`, [limit]);
    res.json({ success: true, activities: rows.map(row => {
      try { row.details = row.details ? JSON.parse(row.details) : null; } catch { row.details = null; }
      return row;
    }) });
  } catch (err) { next(err); }
}

module.exports = { listUsers, changeRole, deleteUser, updateUserStatus, platformStats, systemHealth, listRoles, createUser, resetUserPassword, getSettings, updateSettings, getPermissions, getActivity };
