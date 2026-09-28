'use strict';

const { findByEmail, findByEmailOrUsername, findById, createUser, updateLastActive } = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signToken } = require('../utils/jwt');
const { validationResult } = require('express-validator');
const { logActivity } = require('../services/admin.service');
const { pool } = require('../config/db');

// POST /api/auth/register
async function register(req, res, next) {
  try {
    const [registrationSettings] = await pool.query(
      'SELECT setting_value FROM admin_settings WHERE setting_key = ?', ['registration_open']
    );
    if (registrationSettings[0]) {
      let registrationOpen = true;
      try { registrationOpen = JSON.parse(registrationSettings[0].setting_value) !== false; } catch {}
      if (!registrationOpen) return res.status(403).json({ success: false, message: 'Public registration is currently closed.' });
    }
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg || 'Validation error', errors: errors.array() });
    }

    const { name, email, password, institution } = req.body;
    // Admin accounts can only be provisioned by an existing administrator.
    const role = req.body.role === 'faculty' ? 'faculty' : 'student';

    const existing = await findByEmail(email);
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email is already registered.' });
    }

    const passwordHash = await hashPassword(password);
    const userId = await createUser({ name, email, passwordHash, role, institution });

    const token = signToken({ id: userId, name, email, role: role || 'student' });

    return res.status(201).json({
      success: true,
      message: 'Registration successful! Welcome to CodeArena.',
      token,
      user: { id: userId, name, email, role: role || 'student' }
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login
async function login(req, res, next) {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0]?.msg || 'Validation error', errors: errors.array() });
    }

    const identifier = (req.body.email || req.body.username || req.body.identifier || '').trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({ success: false, message: 'Email/username and password are required.' });
    }

    const user = await findByEmailOrUsername(identifier);
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({ success: false, message: 'Invalid password. Please try again.' });
    }

    if (!user.is_active) {
      return res.status(403).json({ success: false, message: 'Account deactivated. Contact administrator.' });
    }

    if (req.body.role && req.body.role !== user.role) {
      return res.status(403).json({ success: false, message: `This account is not registered as ${req.body.role}.` });
    }

    await updateLastActive(user.id);
    await logActivity({ actor: user, action: 'auth.login' });

    const token = signToken({ id: user.id, name: user.name, email: user.email, role: user.role });

    return res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { id: user.id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me
async function getMe(req, res, next) {
  try {
    const user = await findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.json({ success: true, user });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/logout (stateless JWT — just acknowledged)
function logout(req, res) {
  res.json({ success: true, message: 'Logged out. Clear token on client side.' });
}

module.exports = { register, login, getMe, logout };
