'use strict';

const { logActivity } = require('../services/admin.service');

function errorHandler(err, req, res, next) {
  const status  = err.status  || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  if (status >= 500) {
    void logActivity({
      actor: req.user || { name: 'System', role: 'system' },
      action: 'system.error',
      details: { method: req.method, path: req.path, status }
    });
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(`[ERROR] ${req.method} ${req.originalUrl} → ${status}: ${message}`);
    if (err.stack) console.error(err.stack);
  }

  res.status(status).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
}

module.exports = { errorHandler };
