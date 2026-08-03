const express = require('express');
const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate');
const { registerSchema, loginSchema } = require('../validations/auth.validation');
const { authenticateJWT } = require('../middlewares/auth.middleware');

const router = express.Router();

/**
 * Route Đăng ký tài khoản
 * POST /api/v1/auth/register
 */
router.post('/register', validate(registerSchema, 'body'), authController.register);

/**
 * Route Đăng nhập
 * POST /api/v1/auth/login
 */
router.post('/login', validate(loginSchema, 'body'), authController.login);

/**
 * Route Lấy thông tin cá nhân (yêu cầu JWT)
 * GET /api/v1/auth/me
 */
router.get('/me', authenticateJWT, authController.getProfile);

module.exports = router;
