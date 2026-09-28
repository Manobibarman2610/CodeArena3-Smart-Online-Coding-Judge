'use strict';

const express = require('express');
const { list, markRead, markAllRead } = require('../controllers/notification.controller');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
router.use(authenticate);

router.get('/',               list);
router.put('/:id/read',       markRead);
router.put('/read-all',       markAllRead);

module.exports = router;
