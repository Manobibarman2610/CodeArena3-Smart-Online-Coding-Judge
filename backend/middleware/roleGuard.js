'use strict';

/**
 * Role guard — call after authenticate middleware.
 * Usage: roleGuard('admin') or roleGuard('faculty','admin')
 */
function roleGuard(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Required role: ${allowedRoles.join(' or ')}.`
      });
    }
    next();
  };
}

module.exports = { roleGuard };
