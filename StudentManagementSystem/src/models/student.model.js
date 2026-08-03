const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentCode: {
      type: String,
      required: [true, 'Mã sinh viên là bắt buộc'],
      unique: true,
      trim: true,
      uppercase: true,
    },
    fullName: {
      type: String,
      required: [true, 'Họ tên là bắt buộc'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: [true, 'Email là bắt buộc'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Email không hợp lệ'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Ngày sinh là bắt buộc'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      default: 'other',
    },
    className: {
      type: String,
      required: [true, 'Lớp là bắt buộc'],
      trim: true,
    },
    gpa: {
      type: Number,
      min: 0,
      max: 4,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // tự sinh createdAt, updatedAt
    versionKey: false,
  }
);

module.exports = mongoose.model('Student', studentSchema);
