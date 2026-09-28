'use strict';

const { pool } = require('../config/db');
const { asArray } = require('../utils/normalizers');
const problemModel = require('../models/problem.model');
const hintService  = require('../services/hint.service');
const { validationResult } = require('express-validator');

// GET /api/problems
async function list(req, res, next) {
  try {
    const { difficulty, topic, search, page, limit } = req.query;
    const result = await problemModel.getAll({
      difficulty,
      topic,
      search,
      page: +page || 1,
      limit: +limit || 50
    });
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// GET /api/problems/:id
async function detail(req, res, next) {
  try {
    const problem = await problemModel.getById(req.params.id, req.user?.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, problem });
  } catch (err) { next(err); }
}

// GET /api/problems/slug/:slug
async function detailBySlug(req, res, next) {
  try {
    const problem = await problemModel.getBySlug(req.params.slug, req.user?.id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });
    res.json({ success: true, problem });
  } catch (err) { next(err); }
}

// GET /api/problems/:id/hints
async function getHints(req, res, next) {
  try {
    const hints = await hintService.getHintsForProblem(req.params.id, req.user?.id);
    res.json({ success: true, hints });
  } catch (err) { next(err); }
}

// POST /api/problems/:id/hints/:num/unlock
async function unlockHint(req, res, next) {
  try {
    const result = await hintService.unlockHint(req.params.id, parseInt(req.params.num), req.user.id);
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// POST /api/problems
async function create(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ success: false, errors: errors.array() });

    const slug = (req.body.slug || req.body.title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const id = await problemModel.create({
      ...req.body,
      slug,
      created_by: req.user.id
    });

    // Add sample or hidden test cases if provided
    if (Array.isArray(req.body.test_cases)) {
      for (const tc of req.body.test_cases) {
        await problemModel.addTestCase(id, tc);
      }
    }

    // Add hints if provided
    if (Array.isArray(req.body.hints)) {
      for (let i = 0; i < req.body.hints.length; i++) {
        const h = req.body.hints[i];
        await problemModel.addHint(id, {
          hint_number: i + 1,
          title: h.title || `Hint ${i + 1}`,
          content: typeof h === 'string' ? h : h.content,
          penalty_points: (i + 1) * 5
        });
      }
    }

    res.status(201).json({ success: true, message: 'Problem created successfully.', problemId: id, slug });
  } catch (err) { next(err); }
}

// POST /api/problems/:id/testcases
async function addTestCase(req, res, next) {
  try {
    const { input, output, is_sample, explanation } = req.body;
    if (!input || !output) return res.status(400).json({ success: false, message: 'input and output required.' });
    const id = await problemModel.addTestCase(req.params.id, { input, output, is_sample, explanation });
    res.status(201).json({ success: true, message: 'Test case added.', testCaseId: id });
  } catch (err) { next(err); }
}

// PUT /api/problems/:id
async function update(req, res, next) {
  try {
    await problemModel.update(req.params.id, req.body);
    res.json({ success: true, message: 'Problem updated successfully.' });
  } catch (err) { next(err); }
}

// DELETE /api/problems/:id
async function remove(req, res, next) {
  try {
    await problemModel.remove(req.params.id);
    res.json({ success: true, message: 'Problem deleted.' });
  } catch (err) { next(err); }
}

// GET /api/problems/assignments/list
async function getAssignedProblems(req, res, next) {
  try {
    const studentId = req.user?.id || null;

    const [assignments] = await pool.query(`
      SELECT a.*, u.name AS faculty_name, u.institution AS faculty_institution
      FROM assignments a
      JOIN users u ON u.id = a.faculty_id
      ORDER BY a.created_at DESC
    `);

    for (const a of assignments) {
      const ids = asArray(a.problem_ids)
        .map(id => Number.parseInt(id, 10))
        .filter(id => Number.isSafeInteger(id) && id > 0);

      if (Array.isArray(ids) && ids.length > 0) {
        const [probs] = await pool.query(`
          SELECT p.id, p.title, p.slug, p.difficulty, p.topics, p.accepted_count, p.total_count,
                 COALESCE(u.name, 'Faculty') AS author_name,
                 ROUND(IF(p.total_count > 0, p.accepted_count/p.total_count*100, 0), 1) AS ac_rate
          FROM problems p
          LEFT JOIN users u ON u.id = p.created_by
          WHERE p.id IN (?)
        `, [ids]);

        if (studentId) {
          const [solvedRows] = await pool.query(`
            SELECT DISTINCT problem_id FROM submissions
            WHERE user_id = ? AND verdict = 'AC' AND problem_id IN (?)
          `, [studentId, ids]);
          const solvedSet = new Set(solvedRows.map(r => r.problem_id));
          probs.forEach(p => { p.is_solved = solvedSet.has(p.id); });
        }

        a.problems = probs;
      } else {
        a.problems = [];
      }
    }

    res.json({ success: true, assignments });
  } catch (err) { next(err); }
}

module.exports = {
  list,
  detail,
  detailBySlug,
  getHints,
  unlockHint,
  create,
  addTestCase,
  update,
  remove,
  getAssignedProblems
};
