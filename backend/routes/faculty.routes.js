'use strict';

const express = require('express');
const c = require('../controllers/faculty.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard }    = require('../middleware/roleGuard');

const router = express.Router();
router.use(authenticate, roleGuard('faculty','admin'));

router.get('/overview',                  c.getOverview);
router.get('/students',                  c.getStudents);
router.get('/students/:id/report',       c.getStudentReport);
router.post('/assignments',              c.createAssignment);
router.get('/assignments',               c.getAssignments);
router.get('/analytics',                 c.getAnalytics);
router.get('/plagiarism/:contestId',     c.plagiarismReport);

module.exports = router;
