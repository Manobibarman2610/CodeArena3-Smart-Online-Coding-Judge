'use strict';

const { pool } = require('../config/db');

/**
 * Get language-specific practice progress summary for a student
 */
async function getLanguageSummary(studentId) {
  const languages = ['c', 'cpp', 'java', 'python', 'javascript'];
  const titles = {
    c: 'C Practice',
    cpp: 'C++ Practice',
    java: 'Java Practice',
    python: 'Python Practice',
    javascript: 'JavaScript Practice'
  };

  const results = [];

  for (const lang of languages) {
    const [[{ total }]] = await pool.query(
      'SELECT COUNT(*) as total FROM practice_programs WHERE language = ? AND is_published = TRUE',
      [lang]
    );

    const [[progress]] = await pool.query(`
      SELECT 
        COUNT(CASE WHEN is_completed = TRUE THEN 1 END) AS completed,
        SUM(attempts) AS total_attempts,
        SUM(CASE WHEN last_verdict = 'AC' THEN 1 ELSE 0 END) AS ac_count,
        MAX(last_attempted_at) AS last_practiced
      FROM student_practice_progress
      WHERE student_id = ? AND language = ?
    `, [studentId, lang]);

    const comp = progress?.completed || 0;
    const rem = Math.max(total - comp, 0);
    const pct = total > 0 ? Math.round((comp / total) * 100) : 0;
    const attempts = progress?.total_attempts || 0;
    const acs = progress?.ac_count || 0;
    const accuracy = attempts > 0 ? Math.round((acs / attempts) * 100) : 0;

    let currentLevel = 'Beginner';
    if (comp >= 20) currentLevel = 'Advanced';
    else if (comp >= 10) currentLevel = 'Intermediate';

    results.push({
      language: lang,
      title: titles[lang],
      total_programs: total,
      completed: comp,
      remaining: rem,
      progress_percentage: pct,
      accuracy,
      current_level: currentLevel,
      last_practiced: progress?.last_practiced || null
    });
  }

  return results;
}

/**
 * Get practice programs list for a language with filters
 */
async function getPrograms(language, { category, difficulty, search, studentId } = {}) {
  const where = ['p.language = ?', 'p.is_published = TRUE'];
  const params = [language];

  if (category) {
    where.push('p.category = ?');
    params.push(category);
  }
  if (difficulty) {
    where.push('p.difficulty = ?');
    params.push(difficulty);
  }
  if (search) {
    where.push('(p.title LIKE ? OR p.category LIKE ?)');
    params.push(`%${search}%`, `%${search}%`);
  }

  const whereClause = where.join(' AND ');

  const [rows] = await pool.query(`
    SELECT p.id, p.title, p.slug, p.language, p.category, p.difficulty, p.description,
           p.sample_input, p.sample_output,
           COALESCE(spp.is_completed, FALSE) AS is_completed,
           COALESCE(spp.attempts, 0) AS attempts,
           spp.last_verdict
    FROM practice_programs p
    LEFT JOIN student_practice_progress spp 
      ON spp.program_id = p.id AND spp.student_id = ?
    WHERE ${whereClause}
    ORDER BY 
      CASE p.difficulty WHEN 'Easy' THEN 1 WHEN 'Medium' THEN 2 WHEN 'Hard' THEN 3 ELSE 4 END,
      p.id ASC
  `, [studentId || null, ...params]);

  // Categories list for tabs
  const [categories] = await pool.query(
    'SELECT DISTINCT category FROM practice_programs WHERE language = ? ORDER BY category ASC',
    [language]
  );

  return {
    programs: rows,
    categories: categories.map(c => c.category)
  };
}

/**
 * Get single practice program details
 */
async function getProgramById(id, studentId) {
  const [rows] = await pool.query(
    'SELECT * FROM practice_programs WHERE id = ?',
    [id]
  );
  if (!rows[0]) return null;

  const prog = rows[0];

  // Parse JSON fields
  if (typeof prog.hints === 'string') {
    try { prog.hints = JSON.parse(prog.hints); } catch { prog.hints = []; }
  }
  if (typeof prog.test_cases === 'string') {
    try { prog.test_cases = JSON.parse(prog.test_cases); } catch { prog.test_cases = []; }
  }

  // Get user progress
  if (studentId) {
    const [progRows] = await pool.query(
      'SELECT * FROM student_practice_progress WHERE student_id = ? AND program_id = ?',
      [studentId, id]
    );
    prog.user_progress = progRows[0] || null;
  }

  return prog;
}

/**
 * Record practice submission and update progress
 */
async function recordProgress(studentId, programId, language, verdict, runtimeMs, score) {
  const isAC = verdict === 'AC';

  await pool.query(`
    INSERT INTO student_practice_progress 
      (student_id, program_id, language, attempts, is_completed, last_verdict, best_runtime_ms, score)
    VALUES (?, ?, ?, 1, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      attempts = attempts + 1,
      is_completed = CASE WHEN is_completed = TRUE THEN TRUE ELSE VALUES(is_completed) END,
      last_verdict = VALUES(last_verdict),
      best_runtime_ms = CASE 
        WHEN best_runtime_ms IS NULL OR (VALUES(best_runtime_ms) IS NOT NULL AND VALUES(best_runtime_ms) < best_runtime_ms)
        THEN VALUES(best_runtime_ms) ELSE best_runtime_ms END,
      score = GREATEST(score, VALUES(score)),
      last_attempted_at = CURRENT_TIMESTAMP
  `, [studentId, programId, language, isAC, verdict, runtimeMs, score || (isAC ? 100 : 0)]);
}

/**
 * Create practice program (Faculty/Admin)
 */
async function createProgram(data) {
  const slug = `${data.language}-${data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
  const [result] = await pool.query(`
    INSERT INTO practice_programs 
      (title, slug, language, category, difficulty, description, input_format, output_format, constraints, sample_input, sample_output, explanation, starter_code, hints, test_cases, time_limit_ms, memory_limit_mb, created_by, is_published)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
  `, [
    data.title,
    slug,
    data.language,
    data.category,
    data.difficulty,
    data.description,
    data.input_format || null,
    data.output_format || null,
    data.constraints || null,
    data.sample_input || null,
    data.sample_output || null,
    data.explanation || null,
    data.starter_code || null,
    JSON.stringify(data.hints || []),
    JSON.stringify(data.test_cases || []),
    data.time_limit_ms || 2000,
    data.memory_limit_mb || 256,
    data.created_by,
    data.is_published !== false
  ]);
  return result.insertId;
}

module.exports = {
  getLanguageSummary,
  getPrograms,
  getProgramById,
  recordProgress,
  createProgram
};
