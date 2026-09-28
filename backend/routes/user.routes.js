'use strict';

const express = require('express');
const { getProfile, updateProfile, getStats, getActivity, getSubmissions, getAchievements } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/:id',              getProfile);
router.put('/:id',              updateProfile);
router.get('/:id/stats',        getStats);
router.get('/:id/activity',     getActivity);
router.get('/:id/submissions',  getSubmissions);
router.get('/:id/achievements', getAchievements);

module.exports = router;
