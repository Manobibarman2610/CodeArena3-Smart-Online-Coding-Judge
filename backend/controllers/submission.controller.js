'use strict';

const submissionModel = require('../models/submission.model');
const problemModel    = require('../models/problem.model');
const contestModel    = require('../models/contest.model');
const { judgeSubmission, runCode } = require('../services/judge.service');
const { analyzeCode } = require('../services/ai.service');
const learningPathService = require('../services/learningPath.service');
const { pool } = require('../config/db');

// POST /api/submissions — Submit code for real judging
async function submit(req, res, next) {
  try {
    const { problem_id, language, code, contest_id } = req.body;
    if (!problem_id || !language || !code) {
      return res.status(400).json({ success: false, message: 'problem_id, language, and code are required.' });
    }

    const problem = await problemModel.getById(problem_id);
    if (!problem) return res.status(404).json({ success: false, message: 'Problem not found.' });

    // If contest submission, verify contest is currently live
    if (contest_id) {
      const contest = await contestModel.getById(contest_id);
      if (!contest) return res.status(404).json({ success: false, message: 'Contest not found.' });
      if (contest.status !== 'live') {
        return res.status(400).json({ success: false, message: `Contest is ${contest.status}. Submissions are only allowed during live contests.` });
      }
    }

    // Get all test cases (both sample and hidden)
    const testCases = await problemModel.getAllTestCases(problem_id);

    // Create initial pending submission
    const submissionId = await submissionModel.create({
      userId: req.user.id,
      problemId: problem_id,
      contestId: contest_id || null,
      language,
      code,
      verdict: 'Pending',
      totalTestCases: testCases.length
    });

    // Execute judging immediately
    judgeSubmission(code, language, testCases, problem.time_limit_ms, problem.memory_limit_mb)
      .then(async (result) => {
        await submissionModel.updateVerdict(submissionId, result);
        await problemModel.incrementCounts(problem_id, result.verdict === 'AC');
        await submissionModel.recordActivity(req.user.id);

        if (result.verdict === 'AC') {
          await submissionModel.updateLeaderboard(req.user.id);

          // Add notification for AC
          try {
            await pool.query(`
              INSERT INTO notifications (user_id, type, title, message, link)
              VALUES (?, 'submission', ?, ?, 'dashboard-student.html')
            `, [
              req.user.id,
              `Accepted: ${problem.title}`,
              `Your solution passed all ${result.totalCount} test cases with ${result.runtimeMs}ms runtime!`
            ]);
          } catch {}
        }

        // If contest, update participant score
        if (contest_id && result.verdict === 'AC') {
          try {
            await pool.query(`
              UPDATE contest_participants 
              SET score = score + 100 
              WHERE contest_id = ? AND user_id = ?
            `, [contest_id, req.user.id]);
          } catch {}
        }

        // Generate Instant 8-Part AI Feedback After Submission
        try {
          const aiFeedback = await analyzeCode({
            userId: req.user.id,
            problemId: problem_id,
            problemTitle: problem.title,
            code,
            language,
            verdict: result.verdict,
            submissionContext: {
              passedCount: result.passedCount,
              totalCount: result.totalCount,
              errorOutput: result.errorOutput,
              failedTestCase: result.failedTestCase
            }
          });

          // Link AI feedback analysis to submission ID
          await pool.query(`
            UPDATE ai_analyses 
            SET submission_id = ? 
            WHERE user_id = ? AND problem_id = ? AND submission_id IS NULL 
            ORDER BY id DESC LIMIT 1
          `, [submissionId, req.user.id, problem_id]);
        } catch (aiErr) {
          console.warn('[AI Analysis Error]:', aiErr.message);
        }

        // Update student topic skill levels & learning path progress
        learningPathService.evaluateStudentSkill(req.user.id).catch(() => {});
      })
      .catch(async (err) => {
        console.error('[Judge Error]:', err);
        await submissionModel.updateVerdict(submissionId, {
          verdict: 'RE',
          errorOutput: err.message || 'Execution error during judging'
        });
      });

    res.status(202).json({
      success: true,
      message: 'Submission received. Judging in progress...',
      submissionId,
      statusUrl: `/api/submissions/${submissionId}`
    });
  } catch (err) { next(err); }
}

// POST /api/submissions/run — Run with custom input against code
async function run(req, res, next) {
  try {
    const { language, code, stdin, expected_output } = req.body;
    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'language and code are required.' });
    }
    const result = await runCode(code, language, stdin || '', expected_output || '');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// GET /api/submissions/:id — Poll submission result & feedback
async function getSubmission(req, res, next) {
  try {
    const sub = await submissionModel.getById(req.params.id);
    if (!sub) return res.status(404).json({ success: false, message: 'Submission not found.' });

    const isOwner = sub.user_id === req.user.id;
    const isPriv  = ['faculty','admin'].includes(req.user.role);
    if (!isOwner && !isPriv) delete sub.code;

    // Fetch associated AI Feedback Analysis
    let aiFeedback = null;
    try {
      const [aiRows] = await pool.query(
        'SELECT analysis_json FROM ai_analyses WHERE submission_id = ? OR (user_id = ? AND problem_id = ?) ORDER BY id DESC LIMIT 1',
        [sub.id, sub.user_id, sub.problem_id]
      );
      if (aiRows[0] && aiRows[0].analysis_json) {
        aiFeedback = typeof aiRows[0].analysis_json === 'string'
          ? JSON.parse(aiRows[0].analysis_json)
          : aiRows[0].analysis_json;
      }
    } catch {}

    res.json({
      success: true,
      submission: {
        ...sub,
        ai_feedback: aiFeedback
      }
    });
  } catch (err) { next(err); }
}

// GET /api/submissions/problem/:pid — Submissions for a problem by current user
async function getByProblem(req, res, next) {
  try {
    const rows = await submissionModel.getByProblem(req.user.id, req.params.pid);
    res.json({ success: true, submissions: rows });
  } catch (err) { next(err); }
}

module.exports = {
  submit,
  run,
  getSubmission,
  getByProblem
};
