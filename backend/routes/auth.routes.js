'use strict';

const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, logout } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Validation rules
const registerRules = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['student','faculty']).withMessage('Invalid role'),
];

const loginRules = [
  body('password').notEmpty().withMessage('Password is required'),
  body('role').optional().isIn(['student','faculty','admin']).withMessage('Invalid account role'),
];

router.post('/register', registerRules, register);
router.post('/login',    loginRules,    login);
router.get('/me',        authenticate,  getMe);
router.post('/logout',   authenticate,  logout);

module.exports = router;
