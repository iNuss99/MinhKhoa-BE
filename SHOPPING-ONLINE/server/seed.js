// Script tạo tài khoản admin mẫu vào database
// Chạy: node seed.js
const mongoose = require('mongoose');
const MyConstants = require('./utils/MyConstants');

const uri = 'mongodb+srv://' + MyConstants.DB_USER + ':' + MyConstants.DB_PASS + '@' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE + '?retryWrites=true&w=majority&appName=Cluster0';

const AdminSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String
}, { versionKey: false });
const Admin = mongoose.model('Admin', AdminSchema);

mongoose.connect(uri, { family: 4 })
  .then(async () => {
    console.log('Kết nối MongoDB thành công!');
    const existing = await Admin.findOne({ username: 'admin' });
    if (existing) {
      console.log('Tài khoản admin đã tồn tại!');
    } else {
      const admin = {
        _id: new mongoose.Types.ObjectId(),
        username: 'admin',
        password: '123'
      };
      await Admin.create(admin);
      console.log('Tạo tài khoản admin thành công! (username: admin / password: 123)');
    }
    process.exit(0);
  })
  .catch((err) => {
    console.error('Lỗi kết nối:', err.message);
    process.exit(1);
  });
