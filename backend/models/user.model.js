'use strict';

const { pool } = require('../config/db');

async function findByEmail(email) {
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER(?)', [email]);
  return rows[0] || null;
}

async function findByEmailOrUsername(identifier) {
  if (!identifier) return null;
  const clean = identifier.trim().toLowerCase();
  const [rows] = await pool.query('SELECT * FROM users WHERE LOWER(email) = ? OR LOWER(name) = ?', [clean, clean]);
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.query(
    'SELECT id, name, email, role, institution, rating, streak, last_active, avatar_url, created_at FROM users WHERE id = ?',
    [id]
  );
  return rows[0] || null;
}

async function createUser({ name, email, passwordHash, role, institution }) {
  const [result] = await pool.query(
    'INSERT INTO users (name, email, password_hash, role, institution) VALUES (?,?,?,?,?)',
    [name, email, passwordHash, role || 'student', institution || null]
  );
  // Also seed leaderboard entry
  await pool.query(
    'INSERT IGNORE INTO leaderboard_global (user_id) VALUES (?)',
    [result.insertId]
  );
  return result.insertId;
}

async function updateLastActive(id) {
  await pool.query(
    'UPDATE users SET last_active = CURDATE(), streak = streak + 1 WHERE id = ? AND (last_active IS NULL OR last_active < CURDATE())',
    [id]
  );
}

async function getStats(id) {
  const [rows] = await pool.query(`
    SELECT
      COUNT(DISTINCT CASE WHEN s.verdict = 'AC' THEN s.problem_id END) AS problems_solved,
      COUNT(DISTINCT s.contest_id)                                     AS contests_entered,
      SUM(CASE WHEN s.verdict = 'AC' THEN 1 ELSE 0 END)               AS accepted,
      COUNT(s.id)                                                      AS total_submissions,
      u.rating,
      u.streak
    FROM users u
    LEFT JOIN submissions s ON s.user_id = u.id
    WHERE u.id = ?
    GROUP BY u.id, u.rating, u.streak
  `, [id]);

  if (rows[0]) {
    const s = rows[0];
    return {
      problems_solved: s.problems_solved || 0,
      contests_entered: s.contests_entered || 0,
      accepted: s.accepted || 0,
      total_submissions: s.total_submissions || 0,
      rating: s.rating || 1200,
      streak: s.streak || 0
    };
  }

  const [userRow] = await pool.query('SELECT rating, streak FROM users WHERE id = ?', [id]);
  return {
    problems_solved: 0,
    contests_entered: 0,
    accepted: 0,
    total_submissions: 0,
    rating: userRow[0]?.rating || 1200,
    streak: userRow[0]?.streak || 0
  };
}

async function updateProfile(id, fields) {
  const allowed = ['name', 'institution', 'avatar_url'];
  const updates = [];
  const values  = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(fields[key]);
    }
  }
  if (!updates.length) return;
  values.push(id);
  await pool.query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);
}

module.exports = { findByEmail, findByEmailOrUsername, findById, createUser, updateLastActive, getStats, updateProfile };
