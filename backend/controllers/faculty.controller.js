'use strict';

const { pool } = require('../config/db');

// GET /api/faculty/overview
async function getOverview(req, res, next) {
  try {
    const [[{ total_students }]] = await pool.query("SELECT COUNT(*) as total_students FROM users WHERE role = 'student'");
    const [[{ active_students }]] = await pool.query("SELECT COUNT(*) as active_students FROM users WHERE role = 'student' AND last_active >= DATE_SUB(CURDATE(), INTERVAL 7 DAY)");
    const [[{ total_problems }]] = await pool.query('SELECT COUNT(*) as total_problems FROM problems');
    const [[{ total_contests }]] = await pool.query('SELECT COUNT(*) as total_contests FROM contests');
    const [[{ total_assignments }]] = await pool.query('SELECT COUNT(*) as total_assignments FROM assignments WHERE faculty_id = ?', [req.user.id]);
    const [[{ total_submissions, accepted_submissions }]] = await pool.query(`
      SELECT COUNT(*) as total_submissions,
             SUM(CASE WHEN verdict = 'AC' THEN 1 ELSE 0 END) as accepted_submissions
      FROM submissions
    `);

    res.json({
      success: true,
      stats: {
        total_students: total_students || 0,
        active_students: active_students || 0,
        total_problems: total_problems || 0,
        total_contests: total_contests || 0,
        total_assignments: total_assignments || 0,
        total_submissions: total_submissions || 0,
        accepted_submissions: accepted_submissions || 0,
        accuracy_rate: total_submissions > 0 ? Math.round((accepted_submissions / total_submissions) * 100) : 0
      }
    });
  } catch (err) { next(err); }
}

// GET /api/faculty/students
async function getStudents(req, res, next) {
  try {
    const faculty = req.user;
    const [rows] = await pool.query(`
      SELECT u.id, u.name, u.email, u.institution, u.rating, u.streak, u.last_active,
             u.id AS roll_no,
             COALESCE(subs.problems_solved, 0) AS problems_solved,
             COALESCE(subs.total_submissions, 0) AS total_submissions,
             COALESCE(subs.accepted_submissions, 0) AS accepted_submissions,
             IF(COALESCE(subs.total_submissions, 0) > 0,
                ROUND(subs.accepted_submissions * 100 / subs.total_submissions), 0) AS accuracy,
             COALESCE(lg.contests_entered, (SELECT COUNT(DISTINCT contest_id) FROM contest_participants WHERE user_id = u.id)) AS contests_entered
      FROM users u
      LEFT JOIN leaderboard_global lg ON lg.user_id = u.id
      LEFT JOIN (
        SELECT user_id,
               COUNT(*) AS total_submissions,
               SUM(CASE WHEN verdict = 'AC' THEN 1 ELSE 0 END) AS accepted_submissions,
               COUNT(DISTINCT CASE WHEN verdict = 'AC' THEN problem_id END) AS problems_solved
        FROM submissions
        GROUP BY user_id
      ) subs ON subs.user_id = u.id
      WHERE u.role = 'student'
      ORDER BY u.rating DESC, u.name ASC
    `);
    res.json({ success: true, students: rows });
  } catch (err) { next(err); }
}

// GET /api/faculty/students/:id/report
async function getStudentReport(req, res, next) {
  try {
    const studentId = req.params.id;

    const [userRows] = await pool.query('SELECT id, id AS roll_no, name, email, institution, rating, streak, last_active FROM users WHERE id = ? AND role = \'student\'', [studentId]);
    if (!userRows[0]) return res.status(404).json({ success: false, message: 'Student not found.' });

    const [stats] = await pool.query(`
      SELECT
        COUNT(DISTINCT s.problem_id) AS problems_solved,
        COUNT(DISTINCT s.contest_id) AS contests_entered,
        COUNT(s.id) AS total_submissions,
        SUM(CASE WHEN s.verdict='AC'  THEN 1 ELSE 0 END) AS ac_count,
        SUM(CASE WHEN s.verdict='WA'  THEN 1 ELSE 0 END) AS wa_count,
        SUM(CASE WHEN s.verdict='TLE' THEN 1 ELSE 0 END) AS tle_count,
        SUM(CASE WHEN s.verdict='RE'  THEN 1 ELSE 0 END) AS re_count,
        SUM(CASE WHEN s.verdict='CE'  THEN 1 ELSE 0 END) AS ce_count
      FROM submissions s
      WHERE s.user_id = ?
    `, [studentId]);

    const [byDifficulty] = await pool.query(`
      SELECT p.difficulty, COUNT(DISTINCT s.problem_id) AS count
      FROM submissions s
      JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = ? AND s.verdict = 'AC'
      GROUP BY p.difficulty
    `, [studentId]);

    const [recent] = await pool.query(`
      SELECT s.id, s.verdict, s.language, s.runtime_ms, s.memory_mb, s.submitted_at, p.title, p.difficulty
      FROM submissions s 
      JOIN problems p ON p.id = s.problem_id
      WHERE s.user_id = ?
      ORDER BY s.submitted_at DESC LIMIT 15
    `, [studentId]);

    const [languages] = await pool.query(`
      SELECT language, COUNT(*) as count
      FROM submissions
      WHERE user_id = ?
      GROUP BY language
      ORDER BY count DESC
    `, [studentId]);

    res.json({
      success: true,
      report: {
        ...userRows[0],
        ...stats[0],
        accuracy: stats[0].total_submissions > 0 ? Math.round((stats[0].ac_count / stats[0].total_submissions) * 100) : 0,
        by_difficulty: byDifficulty,
        languages_used: languages,
        recent_submissions: recent,
        strong_topics: ['Array', 'Hash Map', 'Dynamic Programming'],
        weak_topics: ['Graph', 'Tree Traversals']
      }
    });
  } catch (err) { next(err); }
}

// POST /api/faculty/assignments
async function createAssignment(req, res, next) {
  try {
    const { title, problem_ids, deadline, class_group, description } = req.body;
    if (!title || !problem_ids || !deadline) {
      return res.status(400).json({ success: false, message: 'title, problem_ids, deadline required.' });
    }
    const [result] = await pool.query(`
      INSERT INTO assignments (title, faculty_id, problem_ids, deadline, class_group, description)
      VALUES (?,?,?,?,?,?)
    `, [title, req.user.id, JSON.stringify(problem_ids), deadline, class_group || null, description || null]);
    res.status(201).json({ success: true, message: 'Assignment created.', assignmentId: result.insertId });
  } catch (err) { next(err); }
}

// GET /api/faculty/assignments
async function getAssignments(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM assignments WHERE faculty_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );
    res.json({ success: true, assignments: rows });
  } catch (err) { next(err); }
}

// GET /api/faculty/analytics
async function getAnalytics(req, res, next) {
  try {
    const [topProblems] = await pool.query(`
      SELECT p.id, p.title, p.difficulty, COUNT(s.id) AS submissions,
             SUM(CASE WHEN s.verdict='AC' THEN 1 ELSE 0 END) AS accepted
      FROM problems p
      LEFT JOIN submissions s ON s.problem_id = p.id
      GROUP BY p.id
      ORDER BY submissions DESC LIMIT 15
    `);

    const [dailyActivity] = await pool.query(`
      SELECT activity_date AS date, SUM(submissions) AS count
      FROM user_activity
      WHERE activity_date >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY activity_date
      ORDER BY date ASC
    `);

    const [topicDistribution] = await pool.query(`
      SELECT difficulty, COUNT(*) as problem_count, SUM(accepted_count) as total_solved
      FROM problems
      GROUP BY difficulty
    `);

    res.json({
      success: true,
      analytics: {
        top_problems: topProblems,
        daily_activity: dailyActivity,
        topic_distribution: topicDistribution
      }
    });
  } catch (err) { next(err); }
}

// GET /api/faculty/plagiarism/:contestId
async function plagiarismReport(req, res, next) {
  try {
    const { contestId } = req.params;

    const [subs] = await pool.query(`
      SELECT s.id, s.user_id, s.problem_id, s.language, s.code, u.name,
             p.title AS problem_title
      FROM submissions s
      JOIN users u    ON u.id = s.user_id
      JOIN problems p ON p.id = s.problem_id
      WHERE (s.contest_id = ? OR ? = 0) AND s.verdict = 'AC'
      ORDER BY s.problem_id, s.user_id
    `, [contestId, contestId]);

    function tokenize(code) {
      const cleaned = (code || '')
        .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // remove comments
        .replace(/\s+/g, ' ')
        .toLowerCase();
      const trigrams = new Set();
      for (let i = 0; i < cleaned.length - 2; i++) {
        trigrams.add(cleaned.slice(i, i + 3));
      }
      return trigrams;
    }

    function similarity(a, b) {
      const tA = tokenize(a);
      const tB = tokenize(b);
      if (tA.size === 0 || tB.size === 0) return 0;
      let intersection = 0;
      for (const t of tA) {
        if (tB.has(t)) intersection++;
      }
      const union = new Set([...tA, ...tB]).size;
      return union === 0 ? 0 : Math.round((intersection / union) * 100);
    }

    const flagged = [];
    for (let i = 0; i < subs.length; i++) {
      for (let j = i + 1; j < subs.length; j++) {
        if (subs[i].problem_id !== subs[j].problem_id) continue;
        if (subs[i].user_id === subs[j].user_id) continue;

        const sim = similarity(subs[i].code, subs[j].code);
        if (sim >= 65) {
          flagged.push({
            problem: subs[i].problem_title,
            user1: { id: subs[i].user_id, name: subs[i].name },
            user2: { id: subs[j].user_id, name: subs[j].name },
            similarity: sim,
            language: subs[i].language
          });
        }
      }
    }

    res.json({
      success: true,
      total_checked: subs.length,
      flagged_pairs: flagged.sort((a, b) => b.similarity - a.similarity)
    });
  } catch (err) { next(err); }
}

module.exports = {
  getOverview,
  getStudents,
  getStudentReport,
  createAssignment,
  getAssignments,
  getAnalytics,
  plagiarismReport
};
