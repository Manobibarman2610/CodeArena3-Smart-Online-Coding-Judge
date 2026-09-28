'use strict';

const { pool } = require('../config/db');

/**
 * Get all hints for a problem.
 * If userId is provided, shows full content for unlocked hints, masked/title for locked hints.
 */
async function getHintsForProblem(problemId, userId) {
  const [hints] = await pool.query(`
    SELECT h.id, h.problem_id, h.hint_number, h.title, h.content, h.penalty_points,
      CASE WHEN uh.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_unlocked
    FROM hints h
    LEFT JOIN user_hints uh ON uh.hint_id = h.id AND uh.user_id = ?
    WHERE h.problem_id = ?
    ORDER BY h.hint_number ASC
  `, [userId || null, problemId]);

  return hints.map(h => ({
    id: h.id,
    hint_number: h.hint_number,
    title: h.title,
    content: (h.is_unlocked || h.hint_number === 1) ? h.content : 'Unlock this progressive hint to see details.',
    is_unlocked: !!(h.is_unlocked || h.hint_number === 1),
    penalty_points: h.penalty_points
  }));
}

/**
 * Unlock a progressive hint for a student
 */
async function unlockHint(problemId, hintNumber, userId) {
  const [hintRows] = await pool.query(
    'SELECT id, title, content, penalty_points FROM hints WHERE problem_id = ? AND hint_number = ?',
    [problemId, hintNumber]
  );

  if (!hintRows[0]) {
    throw new Error(`Hint #${hintNumber} not found for this problem.`);
  }

  const hint = hintRows[0];

  await pool.query(`
    INSERT IGNORE INTO user_hints (user_id, problem_id, hint_id)
    VALUES (?, ?, ?)
  `, [userId, problemId, hint.id]);

  return {
    success: true,
    hint_number: hintNumber,
    title: hint.title,
    content: hint.content,
    penalty_points: hint.penalty_points
  };
}

module.exports = {
  getHintsForProblem,
  unlockHint
};
