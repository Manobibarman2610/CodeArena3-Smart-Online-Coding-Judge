'use strict';
const express = require('express');
const c = require('../controllers/contest.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { roleGuard }    = require('../middleware/roleGuard');

const router = express.Router();

router.get('/',                    optionalAuthenticate, c.list);
router.get('/:id',                 optionalAuthenticate, c.detail);
router.post('/',                   authenticate, roleGuard('faculty','admin'), c.create);
router.post('/:id/join',           authenticate, c.join);
router.get('/:id/leaderboard',     optionalAuthenticate, c.leaderboard);
router.get('/:id/submissions',     authenticate, roleGuard('faculty','admin'), c.contestSubmissions);

module.exports = router;
