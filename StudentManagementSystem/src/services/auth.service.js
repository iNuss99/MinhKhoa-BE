const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const ApiError = require('../utils/ApiError');

/**
 * Sinh mã JWT Token chứa thông tin userId và role
 */
const generateToken = (userId, role) => {
  const payload = { sub: userId, role };
  const secret = process.env.JWT_SECRET || 'default_jwt_secret_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Xử lý đăng ký người dùng mới
 */
const registerUser = async (userBody) => {
  const existingUser = await User.findOne({ email: userBody.email });
  if (existingUser) {
    throw new ApiError(409, `Email '${userBody.email}' đã được sử dụng trong hệ thống`);
  }

  const user = await User.create(userBody);
  const token = generateToken(user._id, user.role);

  return { user, token };
};

/**
 * Xử lý đăng nhập người dùng
 */
const loginUser = async (email, password) => {
  // Lấy ra cả trường password vốn mặc định bị ẩn bởi select: false
  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !user.isActive) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const isPasswordMatch = await user.isPasswordMatch(password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Email hoặc mật khẩu không chính xác');
  }

  const token = generateToken(user._id, user.role);
  
  return { user, token };
};

module.exports = {
  generateToken,
  registerUser,
  loginUser,
};
