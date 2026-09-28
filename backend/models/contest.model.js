'use strict';

const { pool } = require('../config/db');

async function getAll({ status, type, page = 1, limit = 20 }) {
  const offset = (page - 1) * limit;
  let where = ['c.is_public = TRUE'];
  const params = [];
  if (status) { where.push('c.status = ?'); params.push(status); }
  if (type)   { where.push('c.type = ?');   params.push(type); }

  const whereClause = where.join(' AND ');
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS creator_name,
      (SELECT COUNT(*) FROM contest_participants cp WHERE cp.contest_id = c.id) AS participant_count,
      (SELECT COUNT(*) FROM contest_problems   cp WHERE cp.contest_id = c.id) AS problem_count
    FROM contests c
    LEFT JOIN users u ON u.id = c.created_by
    WHERE ${whereClause}
    ORDER BY c.start_time DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);
  return rows;
}

async function getById(id) {
  const [rows] = await pool.query(`
    SELECT c.*, u.name AS creator_name
    FROM contests c LEFT JOIN users u ON u.id = c.created_by
    WHERE c.id = ?
  `, [id]);
  if (!rows[0]) return null;

  const [problems] = await pool.query(`
    SELECT p.id, p.title, p.slug, p.difficulty, cp.points, cp.order_index
    FROM contest_problems cp
    JOIN problems p ON p.id = cp.problem_id
    WHERE cp.contest_id = ?
    ORDER BY cp.order_index ASC
  `, [id]);

  rows[0].problems = problems;
  return rows[0];
}

async function create({ title, type, description, start_time, end_time, created_by, is_public }) {
  const [result] = await pool.query(`
    INSERT INTO contests (title, type, description, start_time, end_time, created_by, is_public)
    VALUES (?,?,?,?,?,?,?)
  `, [title, type, description, start_time, end_time, created_by, is_public !== false]);
  return result.insertId;
}

async function addProblem(contestId, problemId, points, orderIndex) {
  await pool.query(
    'INSERT IGNORE INTO contest_problems (contest_id, problem_id, points, order_index) VALUES (?,?,?,?)',
    [contestId, problemId, points || 100, orderIndex || 0]
  );
}

async function join(contestId, userId) {
  await pool.query(
    'INSERT IGNORE INTO contest_participants (contest_id, user_id) VALUES (?,?)',
    [contestId, userId]
  );
}

async function isParticipant(contestId, userId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM contest_participants WHERE contest_id=? AND user_id=?',
    [contestId, userId]
  );
  return rows.length > 0;
}

async function getLeaderboard(contestId, limit = 50) {
  const [rows] = await pool.query(`
    SELECT cp.user_id, u.name, u.avatar_url, cp.score, cp.\`rank\`,
      (SELECT COUNT(*) FROM submissions s WHERE s.user_id=cp.user_id AND s.contest_id=? AND s.verdict='AC') AS ac_count
    FROM contest_participants cp
    JOIN users u ON u.id = cp.user_id
    WHERE cp.contest_id = ?
    ORDER BY cp.score DESC, cp.registered_at ASC
    LIMIT ?
  `, [contestId, contestId, limit]);
  return rows;
}

async function updateParticipantScore(contestId, userId, score) {
  await pool.query(
    'UPDATE contest_participants SET score = ? WHERE contest_id = ? AND user_id = ?',
    [score, contestId, userId]
  );
}

async function updateStatus() {
  await pool.query(`
    UPDATE contests SET status = CASE
      WHEN NOW() >= end_time   THEN 'ended'
      WHEN NOW() >= start_time THEN 'live'
      ELSE 'upcoming'
    END
    WHERE status != 'ended' OR status = 'live'
  `);
}

async function getContestSubmissions(contestId, page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`
    SELECT s.id, s.verdict, s.language, s.runtime_ms, s.submitted_at,
           u.name AS user_name, p.title AS problem_title
    FROM submissions s
    JOIN users u    ON u.id = s.user_id
    JOIN problems p ON p.id = s.problem_id
    WHERE s.contest_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT ? OFFSET ?
  `, [contestId, limit, offset]);
  return rows;
}

module.exports = {
  getAll, getById, create, addProblem, join, isParticipant,
  getLeaderboard, updateParticipantScore, updateStatus, getContestSubmissions
};
