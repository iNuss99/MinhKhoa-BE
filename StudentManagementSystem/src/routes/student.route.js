const express = require('express');
const studentController = require('../controllers/student.controller');
const validate = require('../middlewares/validate');
const { authenticateJWT, authorize } = require('../middlewares/auth.middleware');
const {
  createStudentSchema,
  updateStudentSchema,
  listStudentQuerySchema,
  studentIdParamSchema,
} = require('../validations/student.validation');

const router = express.Router();

// Yêu cầu đăng nhập JWT cho tất cả các route bên dưới
router.use(authenticateJWT);

router
  .route('/')
  .get(validate(listStudentQuerySchema, 'query'), studentController.getStudents)
  .post(
    authorize('admin', 'lecturer', 'teacher'),
    validate(createStudentSchema, 'body'),
    studentController.createStudent
  );

router
  .route('/:id')
  .get(validate(studentIdParamSchema, 'params'), studentController.getStudentById)
  .put(
    authorize('admin', 'lecturer', 'teacher'),
    validate(studentIdParamSchema, 'params'),
    validate(updateStudentSchema, 'body'),
    studentController.updateStudent
  )
  .delete(
    authorize('admin'),
    validate(studentIdParamSchema, 'params'),
    studentController.deleteStudent
  );

module.exports = router;
