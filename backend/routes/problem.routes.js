'use strict';

const express = require('express');
const { body } = require('express-validator');
const c = require('../controllers/problem.controller');
const { authenticate, optionalAuthenticate } = require('../middleware/auth');
const { roleGuard }    = require('../middleware/roleGuard');

const router = express.Router();

const createRules = [
  body('title').trim().notEmpty().withMessage('Title required'),
  body('difficulty').isIn(['Easy','Medium','Hard','Expert']).withMessage('Difficulty must be Easy, Medium, Hard, or Expert'),
  body('description').notEmpty().withMessage('Description required'),
];

router.get('/',                            optionalAuthenticate, c.list);
router.get('/assignments/list',           optionalAuthenticate, c.getAssignedProblems);
router.get('/slug/:slug',                  optionalAuthenticate, c.detailBySlug);
router.get('/:id',                         optionalAuthenticate, c.detail);
router.get('/:id/hints',                   authenticate, c.getHints);
router.post('/:id/hints/:num/unlock',      authenticate, c.unlockHint);

router.post('/',                           authenticate, roleGuard('faculty','admin'), createRules, c.create);
router.post('/:id/testcases',              authenticate, roleGuard('faculty','admin'), c.addTestCase);
router.put('/:id',                         authenticate, roleGuard('faculty','admin'), c.update);
router.delete('/:id',                      authenticate, roleGuard('faculty','admin'), c.remove);

module.exports = router;
