const ApiError = require('../utils/ApiError');

/**
 * Middleware factory: nhận vào 1 Joi schema và "nguồn" dữ liệu cần validate
 * (body | params | query), trả về middleware Express.
 * Gom tất cả lỗi validation vào 1 mảng, không dừng lại ở lỗi đầu tiên (abortEarly: false)
 * để client sửa được toàn bộ trong 1 lần request.
 */
const validate = (schema, source = 'body') => (req, res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const details = error.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
    return next(new ApiError(422, 'Dữ liệu không hợp lệ', details));
  }

  req[source] = value; // gán lại giá trị đã được validate + set default
  next();
};

module.exports = validate;
