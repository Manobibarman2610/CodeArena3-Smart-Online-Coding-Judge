'use strict';

const lb = require('../models/leaderboard.model');

// GET /api/leaderboard/global
async function global(req, res, next) {
  try {
    const rows = await lb.getGlobal(+req.query.page || 1, +req.query.limit || 50);
    res.json({ success: true, leaderboard: rows });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/top3
async function top3(req, res, next) {
  try {
    const rows = await lb.getTop3();
    res.json({ success: true, top3: rows });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/myrank
async function myRank(req, res, next) {
  try {
    const rank = await lb.getMyRank(req.user.id);
    res.json({ success: true, rank });
  } catch (err) { next(err); }
}

// GET /api/leaderboard/contest/:id — delegated to contest controller
const contestModel = require('../models/contest.model');
async function contestLeaderboard(req, res, next) {
  try {
    const rows = await contestModel.getLeaderboard(req.params.id, +req.query.limit || 50);
    res.json({ success: true, leaderboard: rows });
  } catch (err) { next(err); }
}

module.exports = { global, top3, myRank, contestLeaderboard };
