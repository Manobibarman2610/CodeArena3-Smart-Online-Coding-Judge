'use strict';

const jwt = require('jsonwebtoken');

const SECRET  = process.env.JWT_SECRET || 'codearena_secret';
const EXPIRES = process.env.JWT_EXPIRES_IN || '7d';

function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES });
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { signToken, verifyToken };
