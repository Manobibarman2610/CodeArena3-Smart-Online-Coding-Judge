'use strict';

const { pool } = require('../config/db');

async function ensureAdminTables() {
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT PRIMARY KEY,
    actor_user_id INT NULL,
    actor_name VARCHAR(100) NULL,
    actor_role VARCHAR(20) NULL,
    target_user_id INT NULL,
    action VARCHAR(80) NOT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_admin_audit_created (created_at),
    INDEX idx_admin_audit_actor (actor_user_id),
    INDEX idx_admin_audit_action (action)
  ) ENGINE=InnoDB`);
  await pool.query(`CREATE TABLE IF NOT EXISTS admin_settings (
    setting_key VARCHAR(80) NOT NULL PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_by INT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  ) ENGINE=InnoDB`);
}

async function logActivity({ actor, targetUserId = null, action, details = null }) {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs (actor_user_id, actor_name, actor_role, target_user_id, action, details)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [actor?.id || null, actor?.name || 'System', actor?.role || 'system', targetUserId, action, details ? JSON.stringify(details) : null]
    );
  } catch (error) {
    // Audit storage must never interrupt login or platform requests.
    console.error('[ADMIN_AUDIT_WRITE_FAILED]', error.message);
  }
}

const DEFAULT_SETTINGS = {
  platform_name: 'CodeArena',
  registration_open: true,
  maintenance_mode: false,
  max_submissions_per_minute: 30
};

const DEFAULT_PERMISSIONS = {
  student: ['Practice problems', 'Submit solutions', 'Join contests', 'View leaderboard', 'Manage own profile'],
  faculty: ['Create problems', 'Manage assignments and contests', 'View student reports', 'View classroom analytics'],
  admin: ['Manage all accounts and roles', 'Control platform access', 'Monitor system health and activity', 'Manage platform settings and audit logs']
};

module.exports = { ensureAdminTables, logActivity, DEFAULT_SETTINGS, DEFAULT_PERMISSIONS };
