'use strict';

const { pool } = require('../config/db');

async function create({ userId, problemId, contestId, language, code, verdict, runtimeMs, memoryMb, score, passedTestCases, totalTestCases, errorOutput, compilerOutput, judgeToken }) {
  const [result] = await pool.query(`
    INSERT INTO submissions (user_id, problem_id, contest_id, language, code, verdict, runtime_ms, memory_mb, score, passed_test_cases, total_test_cases, error_output, compiler_output, judge_token)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    userId, problemId, contestId || null, language, code, verdict || 'Pending',
    runtimeMs || null, memoryMb || null, score || 0,
    passedTestCases || 0, totalTestCases || 0,
    errorOutput || null, compilerOutput || null, judgeToken || null
  ]);
  return result.insertId;
}

async function updateVerdict(id, { verdict, runtimeMs, memoryMb, score, passedCount, totalCount, errorOutput, compilerOutput }) {
  await pool.query(`
    UPDATE submissions 
    SET verdict = ?, runtime_ms = ?, memory_mb = ?, score = ?, passed_test_cases = ?, total_test_cases = ?, error_output = ?, compiler_output = ?
    WHERE id = ?
  `, [
    verdict,
    runtimeMs || null,
    memoryMb || null,
    score || 0,
    passedCount || 0,
    totalCount || 0,
    errorOutput || null,
    compilerOutput || null,
    id
  ]);
}

async function getById(id) {
  const [rows] = await pool.query(`
    SELECT s.*, u.name AS user_name, p.title AS problem_title, p.slug AS problem_slug, p.difficulty
    FROM submissions s
    JOIN users u    ON u.id = s.user_id
    JOIN problems p ON p.id = s.problem_id
    WHERE s.id = ?
  `, [id]);
  return rows[0] || null;
}

async function getByUser(userId, { page = 1, limit = 50 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`
    SELECT s.id, s.verdict, s.language, s.runtime_ms, s.memory_mb, s.score, s.passed_test_cases, s.total_test_cases, s.submitted_at,
           p.title AS problem_title, p.slug AS problem_slug, p.difficulty
    FROM submissions s
    JOIN problems p ON p.id = s.problem_id
    WHERE s.user_id = ?
    ORDER BY s.submitted_at DESC
    LIMIT ? OFFSET ?
  `, [userId, limit, offset]);
  return rows;
}

async function getByProblem(userId, problemId) {
  const [rows] = await pool.query(`
    SELECT id, verdict, language, runtime_ms, memory_mb, score, passed_test_cases, total_test_cases, submitted_at
    FROM submissions
    WHERE user_id = ? AND problem_id = ?
    ORDER BY submitted_at DESC LIMIT 30
  `, [userId, problemId]);
  return rows;
}

async function getActivityHeatmap(userId, days = 182) {
  const [rows] = await pool.query(`
    SELECT activity_date AS date, submissions AS count
    FROM user_activity
    WHERE user_id = ? AND activity_date >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
    ORDER BY activity_date ASC
  `, [userId, days]);
  return rows;
}

async function recordActivity(userId) {
  await pool.query(`
    INSERT INTO user_activity (user_id, activity_date, submissions)
    VALUES (?, CURDATE(), 1)
    ON DUPLICATE KEY UPDATE submissions = submissions + 1
  `, [userId]);
}

async function updateLeaderboard(userId) {
  // Update solved count
  await pool.query(`
    INSERT INTO leaderboard_global (user_id, problems_solved)
    SELECT ?, COUNT(DISTINCT problem_id) FROM submissions WHERE user_id = ? AND verdict = 'AC'
    ON DUPLICATE KEY UPDATE problems_solved = VALUES(problems_solved)
  `, [userId, userId]);

  // Recalculate rank
  await pool.query(`
    UPDATE leaderboard_global lg
    JOIN (
      SELECT user_id, RANK() OVER (ORDER BY rating DESC, problems_solved DESC) as calculated_rank
      FROM leaderboard_global
    ) ranked ON lg.user_id = ranked.user_id
    SET lg.\`rank\` = ranked.calculated_rank
  `);
}

module.exports = {
  create,
  updateVerdict,
  getById,
  getByUser,
  getByProblem,
  getActivityHeatmap,
  recordActivity,
  updateLeaderboard
};
