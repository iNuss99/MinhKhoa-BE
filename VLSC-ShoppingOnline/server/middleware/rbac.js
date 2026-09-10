const { AuditLog, Admin } = require('../models/Models');

// 1. Role-based Access Control Middleware
const requireRole = (...allowedRoles) => {
  return async (req, res, next) => {
    if (!req.decoded) {
      return res.status(401).json({ success: false, message: 'Unauthorized: No active token.' });
    }

    const userRole = (req.decoded.role || 'ADMIN').toUpperCase();
    const allowed = allowedRoles.map(r => r.toUpperCase());

    // ADMIN has full access across all routes
    if (userRole === 'ADMIN' || allowed.includes(userRole) || allowed.includes('*')) {
      // Optional: Check tokenVersion session invalidation
      if (req.decoded.username) {
        try {
          const user = await Admin.findOne({ username: req.decoded.username });
          if (user && user.tokenVersion !== undefined && req.decoded.tokenVersion !== undefined) {
            if (user.tokenVersion > req.decoded.tokenVersion) {
              return res.status(401).json({
                success: false,
                message: 'Phiên làm việc đã bị hủy do vai trò tài khoản vừa được thay đổi. Vui lòng đăng nhập lại!'
              });
            }
          }
        } catch (e) {}
      }
      return next();
    }

    return res.status(403).json({
      success: false,
      message: `Forbidden: Vai trò '${userRole}' không có quyền truy cập chức năng này.`
    });
  };
};

// 2. Field-level restriction middleware (e.g. Warehouse can only update stockQty and status)
const restrictFields = (allowedFields = []) => {
  return (req, res, next) => {
    const userRole = (req.decoded?.role || 'ADMIN').toUpperCase();
    // ADMIN and CEO bypass field restrictions
    if (['ADMIN', 'CEO'].includes(userRole)) {
      return next();
    }

    const bodyKeys = Object.keys(req.body || {});
    const invalidFields = bodyKeys.filter(k => !allowedFields.includes(k));

    if (invalidFields.length > 0) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Vai trò '${userRole}' không được phép chỉnh sửa các trường: ${invalidFields.join(', ')}`
      });
    }
    next();
  };
};

// 3. Helper to write Audit Logs to DB
const logAudit = async ({ actorUsername, actorRole, action, targetType, targetId, details, beforeValue, afterValue, req }) => {
  try {
    const ip = req ? (req.headers['x-forwarded-for'] || req.ip || '127.0.0.1') : '127.0.0.1';
    await AuditLog.create({
      actorUsername: actorUsername || req?.decoded?.username || 'SYSTEM',
      actorRole: actorRole || req?.decoded?.role || 'ADMIN',
      action: action,
      targetType: targetType,
      targetId: targetId ? targetId.toString() : '',
      details: typeof details === 'object' ? JSON.stringify(details) : (details || ''),
      beforeValue: beforeValue || null,
      afterValue: afterValue || null,
      ipAddress: ip,
      createdAt: new Date()
    });
    console.log(`[AUDIT LOG] ${action} by ${actorUsername} (${actorRole})`);
  } catch (err) {
    console.error('[AUDIT LOG ERROR]:', err.message);
  }
};

module.exports = { requireRole, restrictFields, logAudit };
