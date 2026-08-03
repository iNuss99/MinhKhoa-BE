const authService = require('../services/auth.service');
const { success } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller Đăng ký tài khoản
 */
const register = catchAsync(async (req, res) => {
  const { user, token } = await authService.registerUser(req.body);
  return success(res, {
    statusCode: 201,
    message: 'Đăng ký tài khoản thành công',
    data: {
      user,
      token,
    },
  });
});

/**
 * Controller Đăng nhập
 */
const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;
  const { user, token } = await authService.loginUser(email, password);
  return success(res, {
    statusCode: 200,
    message: 'Đăng nhập thành công',
    data: {
      user,
      token,
    },
  });
});

/**
 * Controller Lấy thông tin cá nhân hiện tại
 */
const getProfile = catchAsync(async (req, res) => {
  return success(res, {
    statusCode: 200,
    message: 'Lấy thông tin tài khoản thành công',
    data: req.user,
  });
});

module.exports = {
  register,
  login,
  getProfile,
};
