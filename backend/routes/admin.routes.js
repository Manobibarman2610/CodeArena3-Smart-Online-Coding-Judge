'use strict';
const express = require('express');
const c = require('../controllers/admin.controller');
const { authenticate } = require('../middleware/auth');
const { roleGuard }    = require('../middleware/roleGuard');

const router = express.Router();
router.use(authenticate, roleGuard('admin'));

router.get('/users',           c.listUsers);
router.post('/users',          c.createUser);
router.put('/users/:id/role',  c.changeRole);
router.delete('/users/:id',    c.deleteUser);
router.put('/users/:id/status', c.updateUserStatus);
router.put('/users/:id/password', c.resetUserPassword);
router.get('/stats',           c.platformStats);
router.get('/system/health',   c.systemHealth);
router.get('/system/activity', c.getActivity);
router.get('/permissions',     c.getPermissions);
router.get('/settings',        c.getSettings);
router.put('/settings',        c.updateSettings);
router.get('/roles',           c.listRoles);

module.exports = router;
