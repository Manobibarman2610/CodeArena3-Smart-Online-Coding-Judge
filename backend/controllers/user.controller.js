'use strict';

const userModel       = require('../models/user.model');
const submissionModel = require('../models/submission.model');
const { pool }        = require('../config/db');

// GET /api/users/:id
async function getProfile(req, res, next) {
  try {
    const user = await userModel.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    res.json({ success: true, user });
  } catch (err) { next(err); }
}

// PUT /api/users/:id
async function updateProfile(req, res, next) {
  try {
    if (parseInt(req.params.id) !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot edit another user\'s profile.' });
    }
    await userModel.updateProfile(req.params.id, req.body);
    res.json({ success: true, message: 'Profile updated.' });
  } catch (err) { next(err); }
}

// GET /api/users/:id/stats
async function getStats(req, res, next) {
  try {
    const stats = await userModel.getStats(req.params.id);
    res.json({ success: true, stats });
  } catch (err) { next(err); }
}

// GET /api/users/:id/activity
async function getActivity(req, res, next) {
  try {
    const data = await submissionModel.getActivityHeatmap(req.params.id);
    res.json({ success: true, activity: data });
  } catch (err) { next(err); }
}

// GET /api/users/:id/submissions
async function getSubmissions(req, res, next) {
  try {
    const subs = await submissionModel.getByUser(req.params.id, {
      page:  +req.query.page  || 1,
      limit: +req.query.limit || 50
    });
    res.json({ success: true, submissions: subs });
  } catch (err) { next(err); }
}

// GET /api/users/:id/achievements
async function getAchievements(req, res, next) {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, ua.unlocked_at,
        CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END as is_unlocked
      FROM achievements a
      LEFT JOIN user_achievements ua ON ua.achievement_id = a.id AND ua.user_id = ?
    `, [req.params.id]);
    res.json({ success: true, achievements: rows });
  } catch (err) { next(err); }
}

module.exports = {
  getProfile,
  updateProfile,
  getStats,
  getActivity,
  getSubmissions,
  getAchievements
};
