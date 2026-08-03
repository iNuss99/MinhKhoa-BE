const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');
const catchAsync = require('../utils/catchAsync');

/**
 * 4. JWT Middleware (Xác thực người dùng dựa trên JWT Access Token)
 */
const authenticateJWT = catchAsync(async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Vui lòng đăng nhập để truy cập tài nguyên này');
  }

  const token = authHeader.split(' ')[1];

  try {
    const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
    const decoded = jwt.verify(token, secret);

    const user = await User.findById(decoded.sub);
    if (!user) {
      throw new ApiError(401, 'Tài khoản liên kết với token này không còn tồn tại');
    }

    if (!user.isActive) {
      throw new ApiError(401, 'Tài khoản của bạn đã bị vô hiệu hoá');
    }

    // Đính kèm thông tin user vào request object
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      throw new ApiError(401, 'Token không hợp lệ hoặc đã hết hạn');
    }
    throw error;
  }
});

/**
 * 5. Role Middleware (Phân quyền người dùng dựa trên Vai trò - RBAC)
 * @param  {...string} allowedRoles - Danh sách các role được phép truy cập (vd: 'admin', 'teacher')
 */
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Vui lòng đăng nhập trước khi thực hiện thao tác này'));
    }

    if (!allowedRoles.includes(req.user.role)) {
      return next(
        new ApiError(403, `Quyền truy cập bị từ chối. Yêu cầu một trong các vai trò: [${allowedRoles.join(', ')}]`)
      );
    }

    next();
  };
};

module.exports = {
  authenticateJWT,
  authorize,
};
