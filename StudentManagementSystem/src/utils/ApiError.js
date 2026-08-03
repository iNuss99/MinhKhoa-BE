/**
 * Lớp lỗi tuỳ chỉnh cho toàn bộ ứng dụng.
 * Cho phép Service/Controller ném lỗi kèm statusCode rõ ràng,
 * thay vì để lỗi MongoDB/JS thô rò rỉ ra ngoài response.
 */
class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true; // phân biệt lỗi "biết trước" với lỗi hệ thống không lường trước
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = ApiError;
