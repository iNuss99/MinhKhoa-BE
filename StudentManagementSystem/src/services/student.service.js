const Student = require('../models/student.model');
const ApiError = require('../utils/ApiError');

/**
 * Service Pattern: toàn bộ logic nghiệp vụ + truy vấn Mongoose nằm ở đây.
 * Controller KHÔNG được gọi Student.find(...) trực tiếp, chỉ gọi qua service này.
 */

const createStudent = async (payload) => {
  const student = await Student.create(payload);
  return student;
};

const getStudents = async ({ page, limit, search, className, sortBy, order }) => {
  const filter = {};

  if (search) {
    filter.$or = [
      { fullName: { $regex: search, $options: 'i' } },
      { studentCode: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
  }

  if (className) {
    filter.className = className;
  }

  const skip = (page - 1) * limit;
  const sort = { [sortBy]: order === 'asc' ? 1 : -1 };

  const [items, total] = await Promise.all([
    Student.find(filter).sort(sort).skip(skip).limit(limit),
    Student.countDocuments(filter),
  ]);

  return {
    items,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getStudentById = async (id) => {
  const student = await Student.findById(id);
  if (!student) {
    throw new ApiError(404, `Không tìm thấy sinh viên với id: ${id}`);
  }
  return student;
};

const updateStudent = async (id, payload) => {
  const student = await Student.findByIdAndUpdate(id, payload, {
    new: true, // trả về document sau khi update
    runValidators: true, // vẫn áp dụng schema validation (required, enum, min/max...)
  });

  if (!student) {
    throw new ApiError(404, `Không tìm thấy sinh viên với id: ${id}`);
  }
  return student;
};

const deleteStudent = async (id) => {
  const student = await Student.findByIdAndDelete(id);
  if (!student) {
    throw new ApiError(404, `Không tìm thấy sinh viên với id: ${id}`);
  }
  return student;
};

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
