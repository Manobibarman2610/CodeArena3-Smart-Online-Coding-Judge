'use strict';

const contestModel = require('../models/contest.model');

// GET /api/contests
async function list(req, res, next) {
  try {
    await contestModel.updateStatus(); // sync statuses
    const contests = await contestModel.getAll(req.query);
    res.json({ success: true, contests });
  } catch (err) { next(err); }
}

// GET /api/contests/:id
async function detail(req, res, next) {
  try {
    const contest = await contestModel.getById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found.' });
    res.json({ success: true, contest });
  } catch (err) { next(err); }
}

// POST /api/contests
async function create(req, res, next) {
  try {
    const { title, type, description, start_time, end_time, is_public, problem_ids } = req.body;
    if (!title || !type || !start_time || !end_time) {
      return res.status(400).json({ success: false, message: 'title, type, start_time, end_time required.' });
    }
    const id = await contestModel.create({ title, type, description, start_time, end_time, created_by: req.user.id, is_public });
    if (Array.isArray(problem_ids)) {
      for (let i = 0; i < problem_ids.length; i++) {
        await contestModel.addProblem(id, problem_ids[i], 100, i);
      }
    }
    res.status(201).json({ success: true, message: 'Contest created.', contestId: id });
  } catch (err) { next(err); }
}

// POST /api/contests/:id/join
async function join(req, res, next) {
  try {
    const contest = await contestModel.getById(req.params.id);
    if (!contest) return res.status(404).json({ success: false, message: 'Contest not found.' });
    if (contest.status === 'ended') return res.status(400).json({ success: false, message: 'Contest has ended.' });
    await contestModel.join(req.params.id, req.user.id);
    res.json({ success: true, message: 'Joined contest successfully.' });
  } catch (err) { next(err); }
}

// GET /api/contests/:id/leaderboard
async function leaderboard(req, res, next) {
  try {
    const rows = await contestModel.getLeaderboard(req.params.id, +req.query.limit || 50);
    res.json({ success: true, leaderboard: rows });
  } catch (err) { next(err); }
}

// GET /api/contests/:id/submissions  (faculty/admin)
async function contestSubmissions(req, res, next) {
  try {
    const rows = await contestModel.getContestSubmissions(req.params.id, +req.query.page || 1);
    res.json({ success: true, submissions: rows });
  } catch (err) { next(err); }
}

module.exports = { list, detail, create, join, leaderboard, contestSubmissions };
