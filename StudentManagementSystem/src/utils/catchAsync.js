/**
 * Bọc controller async để tự động forward lỗi vào next(),
 * tránh lặp try/catch ở mọi controller.
 */
const catchAsync = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = catchAsync;
