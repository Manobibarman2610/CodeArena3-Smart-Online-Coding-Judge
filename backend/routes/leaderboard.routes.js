'use strict';
const express = require('express');
const c = require('../controllers/leaderboard.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/global',        optionalAuthenticate, c.global);
router.get('/top3',          optionalAuthenticate, c.top3);
router.get('/contest/:id',   optionalAuthenticate, c.contestLeaderboard);
router.get('/myrank',        authenticate, c.myRank);

module.exports = router;

