'use strict';

const express = require('express');
const { analyze, getHistory } = require('../controllers/ai.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.post('/analyze', analyze);
router.get('/history/:problemId', getHistory);

module.exports = router;
