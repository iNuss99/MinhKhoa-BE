const Joi = require('joi');

// Dùng khi tạo mới: hầu hết field bắt buộc
const createStudentSchema = Joi.object({
  studentCode: Joi.string().trim().min(3).max(20).required().messages({
    'string.empty': 'Mã sinh viên không được để trống',
    'any.required': 'Mã sinh viên là bắt buộc',
  }),
  fullName: Joi.string().trim().min(2).max(100).required(),
  email: Joi.string().trim().email().required(),
  dateOfBirth: Joi.date().less('now').required().messages({
    'date.less': 'Ngày sinh phải nhỏ hơn ngày hiện tại',
  }),
  gender: Joi.string().valid('male', 'female', 'other').default('other'),
  className: Joi.string().trim().min(1).max(50).required(),
  gpa: Joi.number().min(0).max(4).default(0),
  isActive: Joi.boolean().default(true),
});

// Dùng khi cập nhật: toàn bộ field optional nhưng phải có ít nhất 1 field
const updateStudentSchema = Joi.object({
  studentCode: Joi.string().trim().min(3).max(20),
  fullName: Joi.string().trim().min(2).max(100),
  email: Joi.string().trim().email(),
  dateOfBirth: Joi.date().less('now'),
  gender: Joi.string().valid('male', 'female', 'other'),
  className: Joi.string().trim().min(1).max(50),
  gpa: Joi.number().min(0).max(4),
  isActive: Joi.boolean(),
}).min(1).messages({
  'object.min': 'Cần ít nhất 1 trường để cập nhật',
});

// Dùng cho query khi lấy danh sách (phân trang, tìm kiếm)
const listStudentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().trim().allow('').default(''),
  className: Joi.string().trim().allow(''),
  sortBy: Joi.string().valid('fullName', 'studentCode', 'gpa', 'createdAt').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// Dùng để validate :id trong URL param (phải là ObjectId hợp lệ của MongoDB)
const studentIdParamSchema = Joi.object({
  id: Joi.string()
    .pattern(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'id không đúng định dạng MongoDB ObjectId',
    }),
});

module.exports = {
  createStudentSchema,
  updateStudentSchema,
  listStudentQuerySchema,
  studentIdParamSchema,
};

