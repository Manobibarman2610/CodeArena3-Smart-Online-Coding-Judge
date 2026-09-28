'use strict';

const { pool } = require('../config/db');
const { asArray, completeStarterCode } = require('../utils/normalizers');

async function getAll({ difficulty, topic, search, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  let where = ['p.is_public = TRUE'];
  const params = [];

  if (difficulty) { where.push('p.difficulty = ?'); params.push(difficulty); }
  if (topic)      { where.push('JSON_CONTAINS(p.topics, JSON_QUOTE(?))'); params.push(topic); }
  if (search)     { where.push('(p.title LIKE ? OR p.slug LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const [rows] = await pool.query(`
    SELECT p.id, p.title, p.slug, p.difficulty, p.topics, p.accepted_count, p.total_count,
           p.time_limit_ms, p.memory_limit_mb, p.created_by,
           COALESCE(u.name, 'Faculty') AS author_name,
           ROUND(IF(p.total_count > 0, p.accepted_count/p.total_count*100, 0), 1) AS ac_rate
    FROM problems p
    LEFT JOIN users u ON u.id = p.created_by
    ${whereClause}
    ORDER BY p.id DESC
    LIMIT ? OFFSET ?
  `, [...params, limit, offset]);

  const [[{ total }]] = await pool.query(
    `SELECT COUNT(*) as total FROM problems p ${whereClause}`,
    params
  );

  rows.forEach(problem => { problem.topics = asArray(problem.topics); });
  return { problems: rows, total, page, limit };
}

async function getById(id, userId = null) {
  const [rows] = await pool.query(`
    SELECT p.*, u.name AS author_name
    FROM problems p
    LEFT JOIN users u ON u.id = p.created_by
    WHERE p.id = ?
  `, [id]);
  if (!rows[0]) return null;

  const problem = rows[0];

  // Fetch sample test cases
  const [testCases] = await pool.query(
    'SELECT id, input, output, explanation FROM test_cases WHERE problem_id = ? AND is_sample = TRUE',
    [id]
  );
  problem.sample_cases = testCases;

  // Fetch hints
  const [hints] = await pool.query(`
    SELECT h.id, h.hint_number, h.title, h.content, h.penalty_points,
      CASE WHEN uh.id IS NOT NULL OR h.hint_number = 1 THEN TRUE ELSE FALSE END AS is_unlocked
    FROM hints h
    LEFT JOIN user_hints uh ON uh.hint_id = h.id AND uh.user_id = ?
    WHERE h.problem_id = ?
    ORDER BY h.hint_number ASC
  `, [userId || null, id]);

  problem.hints = hints.map(h => ({
    id: h.id,
    hint_number: h.hint_number,
    title: h.title,
    content: h.is_unlocked ? h.content : 'Unlock this hint to view details.',
    is_unlocked: !!h.is_unlocked,
    penalty_points: h.penalty_points
  }));

  // Normalize legacy values and guarantee a valid starter scaffold for every supported language.
  problem.topics = asArray(problem.topics);
  problem.starter_code = completeStarterCode(problem.starter_code);

  return problem;
}

async function getBySlug(slug, userId = null) {
  const [rows] = await pool.query('SELECT id FROM problems WHERE slug = ?', [slug]);
  if (!rows[0]) return null;
  return getById(rows[0].id, userId);
}

async function create({ title, slug, difficulty, description, constraints, sample_input, sample_output, time_limit_ms, memory_limit_mb, topics, starter_code, created_by, is_public }) {
  const [result] = await pool.query(`
    INSERT INTO problems (title, slug, difficulty, description, constraints, sample_input, sample_output, time_limit_ms, memory_limit_mb, topics, starter_code, created_by, is_public)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    title, slug, difficulty, description, constraints, sample_input, sample_output,
    time_limit_ms || 2000, memory_limit_mb || 256,
    JSON.stringify(topics || []),
    JSON.stringify(completeStarterCode(starter_code)),
    created_by, is_public !== false
  ]);
  return result.insertId;
}

async function addTestCase(problemId, { input, output, is_sample, explanation }) {
  const [result] = await pool.query(
    'INSERT INTO test_cases (problem_id, input, output, is_sample, explanation) VALUES (?,?,?,?,?)',
    [problemId, input, output, is_sample || false, explanation || null]
  );
  return result.insertId;
}

async function addHint(problemId, { hint_number, title, content, penalty_points }) {
  const [result] = await pool.query(
    'INSERT INTO hints (problem_id, hint_number, title, content, penalty_points) VALUES (?,?,?,?,?) ON DUPLICATE KEY UPDATE title=VALUES(title), content=VALUES(content)',
    [problemId, hint_number, title || `Hint ${hint_number}`, content, penalty_points || 0]
  );
  return result.insertId;
}

async function getAllTestCases(problemId) {
  const [rows] = await pool.query(
    'SELECT * FROM test_cases WHERE problem_id = ?',
    [problemId]
  );
  return rows;
}

async function update(id, fields) {
  const allowed = ['title','slug','difficulty','description','constraints','sample_input','sample_output','time_limit_ms','memory_limit_mb','topics','starter_code','is_public'];
  const updates = [];
  const values  = [];
  for (const key of allowed) {
    if (fields[key] !== undefined) {
      updates.push(`${key} = ?`);
      if (key === 'starter_code') values.push(JSON.stringify(completeStarterCode(fields[key])));
      else if (key === 'topics') values.push(JSON.stringify(fields[key]));
      else values.push(fields[key]);
    }
  }
  if (!updates.length) return;
  values.push(id);
  await pool.query(`UPDATE problems SET ${updates.join(', ')} WHERE id = ?`, values);
}

async function remove(id) {
  await pool.query('DELETE FROM problems WHERE id = ?', [id]);
}

async function incrementCounts(problemId, accepted) {
  await pool.query(
    'UPDATE problems SET total_count = total_count + 1, accepted_count = accepted_count + ? WHERE id = ?',
    [accepted ? 1 : 0, problemId]
  );
}

module.exports = {
  getAll,
  getById,
  getBySlug,
  create,
  addTestCase,
  addHint,
  getAllTestCases,
  update,
  remove,
  incrementCounts
};
