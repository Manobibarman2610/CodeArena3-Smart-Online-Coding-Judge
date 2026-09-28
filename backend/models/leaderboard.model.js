'use strict';

const { pool } = require('../config/db');

async function getGlobal(page = 1, limit = 50) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`
    SELECT lg.user_id, lg.rating, lg.problems_solved, lg.contests_entered,
           RANK() OVER (ORDER BY lg.rating DESC, lg.problems_solved DESC) AS \`rank\`,
           u.name, u.avatar_url, u.institution
    FROM leaderboard_global lg
    JOIN users u ON u.id = lg.user_id
    ORDER BY lg.rating DESC, lg.problems_solved DESC
    LIMIT ? OFFSET ?
  `, [limit, offset]);
  return rows;
}

async function getMyRank(userId) {
  const [rows] = await pool.query(`
    SELECT COUNT(*) + 1 AS \`rank\`
    FROM leaderboard_global lg
    WHERE lg.rating > (SELECT rating FROM leaderboard_global WHERE user_id = ?)
       OR (lg.rating = (SELECT rating FROM leaderboard_global WHERE user_id = ?)
           AND lg.user_id < ?)
  `, [userId, userId, userId]);
  return rows[0]?.rank || null;
}

async function getTop3() {
  const [rows] = await pool.query(`
    SELECT u.name, u.avatar_url, lg.rating, lg.problems_solved,
           RANK() OVER (ORDER BY lg.rating DESC) AS \`rank\`
    FROM leaderboard_global lg
    JOIN users u ON u.id = lg.user_id
    ORDER BY lg.rating DESC LIMIT 3
  `);
  return rows;
}

module.exports = { getGlobal, getMyRank, getTop3 };
