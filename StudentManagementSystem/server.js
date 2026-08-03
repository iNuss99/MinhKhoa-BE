require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`[Server] Đang chạy tại http://localhost:${PORT}`);
    console.log(`[Server] API base: http://localhost:${PORT}/api/v1/students`);
  });

  // Bắt các lỗi không được xử lý để tắt server "sạch" thay vì crash âm thầm
  process.on('unhandledRejection', (err) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });
};

startServer();
