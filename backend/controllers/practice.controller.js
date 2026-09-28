'use strict';

const practiceModel = require('../models/practice.model');
const rolePracticeModel = require('../models/rolePractice.model');
const learningPathService = require('../services/learningPath.service');
const { judgeSubmission, runCode } = require('../services/judge.service');
const { analyzeCode } = require('../services/ai.service');

// GET /api/practice/languages
async function getLanguageSummary(req, res, next) {
  try {
    const summary = await practiceModel.getLanguageSummary(req.user?.id);
    res.json({ success: true, languages: summary });
  } catch (err) { next(err); }
}

// GET /api/practice/roles
async function getRoles(req, res, next) {
  try {
    const roles = rolePracticeModel.getRoles();
    res.json({ success: true, roles });
  } catch (err) { next(err); }
}

// GET /api/practice/role-preference
async function getRolePreference(req, res, next) {
  try {
    const preference = await rolePracticeModel.getUserRolePreference(req.user?.id);
    res.json({ success: true, preference });
  } catch (err) { next(err); }
}

// POST /api/practice/role-preference
async function updateRolePreference(req, res, next) {
  try {
    const preference = await rolePracticeModel.setUserRolePreference(req.user?.id, req.body);
    res.json({ success: true, message: 'Career role preferences updated.', preference });
  } catch (err) { next(err); }
}

// GET /api/practice/role-roadmap
async function getRoleRoadmap(req, res, next) {
  try {
    const data = await rolePracticeModel.getRoleRoadmap(req.user?.id);
    res.json({ success: true, ...data });
  } catch (err) { next(err); }
}

// GET /api/practice/:language
async function getProgramsByLanguage(req, res, next) {
  try {
    const { language } = req.params;
    const { category, difficulty, search } = req.query;

    const data = await practiceModel.getPrograms(language, {
      category,
      difficulty,
      search,
      studentId: req.user?.id
    });

    res.json({ success: true, ...data });
  } catch (err) { next(err); }
}

// GET /api/practice/program/:id
async function getProgramDetail(req, res, next) {
  try {
    const prog = await practiceModel.getProgramById(req.params.id, req.user?.id);
    if (!prog) return res.status(404).json({ success: false, message: 'Practice program not found.' });
    res.json({ success: true, program: prog });
  } catch (err) { next(err); }
}

// POST /api/practice/run
async function runPracticeCode(req, res, next) {
  try {
    const { language, code, stdin, expected_output } = req.body;
    if (!language || !code) {
      return res.status(400).json({ success: false, message: 'Language and code are required.' });
    }

    const result = await runCode(code, language, stdin || '', expected_output || '');
    res.json({ success: true, ...result });
  } catch (err) { next(err); }
}

// POST /api/practice/submit
async function submitPracticeCode(req, res, next) {
  try {
    const { program_id, language, code } = req.body;
    if (!program_id || !language || !code) {
      return res.status(400).json({ success: false, message: 'program_id, language, and code required.' });
    }

    const prog = await practiceModel.getProgramById(program_id, req.user.id);
    if (!prog) return res.status(404).json({ success: false, message: 'Practice program not found.' });

    const testCases = prog.test_cases || [];

    // Judge against test cases
    const judgeResult = await judgeSubmission(code, language, testCases, prog.time_limit_ms || 2000, prog.memory_limit_mb || 256);

    // Record student progress
    await practiceModel.recordProgress(
      req.user.id,
      program_id,
      language,
      judgeResult.verdict,
      judgeResult.runtimeMs,
      judgeResult.score
    );

    // Trigger AI assistance feedback
    let aiFeedback = null;
    try {
      aiFeedback = await analyzeCode({
        userId: req.user.id,
        problemId: null,
        problemTitle: prog.title,
        code,
        language,
        verdict: judgeResult.verdict
      });
    } catch {}

    // Update student topic skills in background
    learningPathService.evaluateStudentSkill(req.user.id).catch(() => {});

    res.json({
      success: true,
      submission: {
        program_id,
        verdict: judgeResult.verdict,
        score: judgeResult.score,
        runtime_ms: judgeResult.runtimeMs,
        memory_mb: judgeResult.memoryMb,
        passed_test_cases: judgeResult.passedCount,
        total_test_cases: judgeResult.totalCount,
        error_output: judgeResult.errorOutput,
        compiler_output: judgeResult.compilerOutput
      },
      ai_feedback: aiFeedback
    });
  } catch (err) { next(err); }
}

// GET /api/practice/recommendations
async function getRecommendations(req, res, next) {
  try {
    const data = await learningPathService.getLearningPath(req.user?.id);
    res.json({
      success: true,
      current_level: data.current_level,
      level_score: data.level_score,
      recommended_practice: data.recommended_practice,
      recommended_problems: data.recommended_problems,
      weak_topics: data.weak_topics,
      strong_topics: data.strong_topics
    });
  } catch (err) { next(err); }
}

// GET /api/learning-path
async function getLearningPath(req, res, next) {
  try {
    const data = await learningPathService.getLearningPath(req.user?.id);
    res.json({ success: true, learning_path: data });
  } catch (err) { next(err); }
}

// POST /api/faculty/practice-programs
async function createProgram(req, res, next) {
  try {
    const { title, language, category, difficulty, description } = req.body;
    if (!title || !language || !category || !difficulty || !description) {
      return res.status(400).json({ success: false, message: 'Title, language, category, difficulty, and description are required.' });
    }

    const id = await practiceModel.createProgram({
      ...req.body,
      created_by: req.user.id
    });

    res.status(201).json({ success: true, message: 'Practice program created successfully.', programId: id });
  } catch (err) { next(err); }
}

module.exports = {
  getLanguageSummary,
  getRoles,
  getRolePreference,
  updateRolePreference,
  getRoleRoadmap,
  getProgramsByLanguage,
  getProgramDetail,
  runPracticeCode,
  submitPracticeCode,
  getRecommendations,
  getLearningPath,
  createProgram
};

