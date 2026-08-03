const ApiError = require('../utils/ApiError');
const { error: errorResponse } = require('../utils/apiResponse');

/**
 * Bắt các route không tồn tại (phải đặt SAU toàn bộ route hợp lệ).
 */
const notFoundHandler = (req, res, next) => {
  next(new ApiError(404, `Không tìm thấy route: ${req.method} ${req.originalUrl}`));
};

/**
 * Middleware xử lý lỗi tập trung (phải đặt CUỐI CÙNG, có đủ 4 tham số).
 * - Chuẩn hoá lỗi Mongoose (CastError, ValidationError, duplicate key 11000)
 * - Không để lộ stack trace ở môi trường production
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let details = err.details || null;

  // Mongoose: id không đúng định dạng ObjectId
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `ID không hợp lệ: ${err.value}`;
  }

  // Mongoose: vi phạm schema validation (khi thao tác trực tiếp qua model)
  if (err.name === 'ValidationError') {
    statusCode = 422;
    message = 'Dữ liệu không hợp lệ';
    details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
  }

  // MongoDB: vi phạm unique index (studentCode, email)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0];
    message = `${field} '${err.keyValue?.[field]}' đã tồn tại`;
  }

  if (process.env.NODE_ENV !== 'production') {
    console.error(err);
  }

  return errorResponse(res, { statusCode, message, details });
};

module.exports = { notFoundHandler, errorHandler };
