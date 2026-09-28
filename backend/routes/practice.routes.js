'use strict';

const express = require('express');
const {
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
} = require('../controllers/practice.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { roleGuard } = require('../middleware/roleGuard');

const router = express.Router();

// Student Practice Routes
router.get('/languages',          optionalAuthenticate, getLanguageSummary);
router.get('/roles',              optionalAuthenticate, getRoles);
router.get('/role-preference',    authenticate, getRolePreference);
router.post('/role-preference',   authenticate, updateRolePreference);
router.get('/role-roadmap',       optionalAuthenticate, getRoleRoadmap);
router.get('/recommendations',    optionalAuthenticate, getRecommendations);
router.get('/learning-path',      optionalAuthenticate, getLearningPath);
router.get('/program/:id',        optionalAuthenticate, getProgramDetail);
router.post('/run',               authenticate, runPracticeCode);
router.post('/submit',            authenticate, submitPracticeCode);
router.get('/:language',          optionalAuthenticate, getProgramsByLanguage);

// Faculty Practice Management
router.post('/create',            authenticate, roleGuard('faculty','admin'), createProgram);

module.exports = router;

