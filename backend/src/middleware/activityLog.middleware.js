'use strict';
/**
 * activityLog.middleware.js
 * ─────────────────────────────────────────────────────────
 * Express middleware factory that logs admin / executive actions
 * to the audit_logs table AFTER the response is sent.
 *
 * Usage:
 *   router.patch('/members/:id/status', verifyToken, requireRole('admin'),
 *     activityLog('MEMBER_STATUS_UPDATE', (req) => `members/${req.params.id}`),
 *     ctrl.updateMemberStatus
 *   );
 *
 * Factory params:
 *   action  – string: short action code, e.g. 'MEMBER_APPROVED'
 *   targetFn – optional function(req) => string describing the target resource
 *   metaFn   – optional function(req, resBody) => object with extra context
 */

const adminRepo = require('../modules/admin/admin.repository');

const activityLog = (action, targetFn, metaFn) => {
  return (req, res, next) => {
    // Intercept res.json to capture the response body
    const originalJson = res.json.bind(res);
    res.json = function (body) {
      res._activityBody = body;
      return originalJson(body);
    };

    // After response is finished, write the log
    res.on('finish', async () => {
      // Only log successful responses (2xx)
      if (res.statusCode < 200 || res.statusCode >= 300) return;
      // Only log if a user is authenticated
      if (!req.user) return;

      try {
        const target = targetFn ? targetFn(req) : null;
        const meta = metaFn ? metaFn(req, res._activityBody) : buildDefaultMeta(req);
        await adminRepo.writeAuditLog(req.user.id, action, target, meta);
      } catch (err) {
        // Never crash the request over logging failures
        console.error('[ActivityLog] Failed to write audit log:', err.message);
      }
    });

    next();
  };
};

/** Build sensible default meta from request body / params */
function buildDefaultMeta(req) {
  const meta = {};
  if (req.params && Object.keys(req.params).length) {
    meta.params = req.params;
  }
  if (req.body && typeof req.body === 'object' && Object.keys(req.body).length) {
    // Omit passwords and sensitive fields
    const { password, password_hash, newPassword, ...safe } = req.body;
    if (Object.keys(safe).length) meta.body = safe;
  }
  return Object.keys(meta).length ? meta : null;
}

module.exports = activityLog;
