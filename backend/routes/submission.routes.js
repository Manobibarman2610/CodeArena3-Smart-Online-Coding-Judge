'use strict';
const express = require('express');
const c = require('../controllers/submission.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard }    = require('../middleware/roleGuard');

const router = express.Router();
router.use(authenticate);

router.post('/',              c.submit);
router.post('/run',           c.run);
router.get('/:id',            c.getSubmission);
router.get('/problem/:pid',   c.getByProblem);

module.exports = router;
