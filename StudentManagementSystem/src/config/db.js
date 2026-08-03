const mongoose = require('mongoose');
const dns = require('dns');

// Khắc phục lỗi querySrv ECONNREFUSED trên mạng Windows khi kết nối MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (err) {
  // Ignore DNS fallback error if restricted
}

/**
 * Kết nối tới MongoDB.
 * Thoát ứng dụng nếu kết nối thất bại để tránh server chạy ở trạng thái "half-broken".
 */
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/student_management';

  try {
    await mongoose.connect(uri);
    console.log(`[MongoDB] Đã kết nối thành công: ${mongoose.connection.host}/${mongoose.connection.name}`);
  } catch (error) {
    console.error(`[MongoDB] Kết nối thất bại: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
