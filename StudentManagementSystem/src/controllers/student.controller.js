const studentService = require('../services/student.service');
const { success } = require('../utils/apiResponse');
const catchAsync = require('../utils/catchAsync');

/**
 * Controller CHỈ đóng vai trò điều phối: nhận request -> gọi service -> trả response.
 * Không chứa business logic, không gọi Model trực tiếp.
 */

const createStudent = catchAsync(async (req, res) => {
  const student = await studentService.createStudent(req.body);
  return success(res, {
    statusCode: 201,
    message: 'Tạo sinh viên thành công',
    data: student,
  });
});

const getStudents = catchAsync(async (req, res) => {
  const { items, meta } = await studentService.getStudents(req.query);
  return success(res, {
    statusCode: 200,
    message: 'Lấy danh sách sinh viên thành công',
    data: items,
    meta,
  });
});

const getStudentById = catchAsync(async (req, res) => {
  const student = await studentService.getStudentById(req.params.id);
  return success(res, {
    statusCode: 200,
    message: 'Lấy thông tin sinh viên thành công',
    data: student,
  });
});

const updateStudent = catchAsync(async (req, res) => {
  const student = await studentService.updateStudent(req.params.id, req.body);
  return success(res, {
    statusCode: 200,
    message: 'Cập nhật sinh viên thành công',
    data: student,
  });
});

const deleteStudent = catchAsync(async (req, res) => {
  await studentService.deleteStudent(req.params.id);
  return success(res, {
    statusCode: 200,
    message: 'Xoá sinh viên thành công',
    data: null,
  });
});

module.exports = {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
};
