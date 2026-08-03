const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const routes = require('./routes');
const { notFoundHandler, errorHandler } = require('./middlewares/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

app.get('/health', (req, res) => {
  res.status(200).json({ success: true, message: 'API is healthy', data: { uptime: process.uptime() } });
});

app.use('/api/v1', routes);

// 404 cho route không tồn tại - PHẢI đặt sau toàn bộ route hợp lệ
app.use(notFoundHandler);

// Error handler tập trung - PHẢI đặt cuối cùng
app.use(errorHandler);

module.exports = app;
