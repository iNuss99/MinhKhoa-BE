/**
 * Chuẩn hoá format JSON response cho toàn bộ API.
 * Thành công: { success, message, data, meta? }
 * Thất bại:   { success, message, error }
 */
const success = (res, { statusCode = 200, message = 'Success', data = null, meta = null }) => {
  const body = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
};

const error = (res, { statusCode = 500, message = 'Internal Server Error', details = null }) => {
  const body = { success: false, message };
  if (details) body.error = details;
  return res.status(statusCode).json(body);
};

module.exports = { success, error };
