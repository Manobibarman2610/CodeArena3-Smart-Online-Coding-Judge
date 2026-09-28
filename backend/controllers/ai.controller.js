'use strict';

const aiService = require('../services/ai.service');
const problemModel = require('../models/problem.model');
const { pool } = require('../config/db');

// POST /api/ai/analyze
async function analyze(req, res, next) {
  try {
    const { problem_id, code, language, verdict } = req.body;
    if (!code || !language) {
      return res.status(400).json({ success: false, message: 'Code and language are required.' });
    }

    let problemTitle = 'Coding Problem';
    if (problem_id) {
      const p = await problemModel.getById(problem_id);
      if (p) problemTitle = p.title;
    }

    const analysis = await aiService.analyzeCode({
      userId: req.user.id,
      problemId: problem_id || null,
      problemTitle,
      code,
      language,
      verdict
    });

    res.json({ success: true, analysis });
  } catch (err) { next(err); }
}

// GET /api/ai/history/:problemId
async function getHistory(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT * FROM ai_analyses 
      WHERE user_id = ? AND problem_id = ?
      ORDER BY created_at DESC LIMIT 5
    `, [req.user.id, req.params.problemId]);
    res.json({ success: true, history: rows });
  } catch (err) { next(err); }
}

module.exports = { analyze, getHistory };
