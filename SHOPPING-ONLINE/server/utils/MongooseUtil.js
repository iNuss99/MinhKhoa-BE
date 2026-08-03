//CLI: npm install mongoose --save
const https = require('https');
const mongoose = require('mongoose');
const MyConstants = require('./MyConstants');

// Dùng DNS-over-HTTPS (Google) để bypass DNS của Windows bị chặn SRV
function dohQuery(hostname, type) {
  return new Promise((resolve, reject) => {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(hostname)}&type=${type}`;
    https.get(url, { headers: { 'Accept': 'application/json' } }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch (e) { reject(e); }
      });
    }).on('error', reject);
  });
}

async function connectMongoDB() {
  try {
    // Bước 1: Phân giải SRV records qua HTTPS (port 443, không bao giờ bị chặn)
    const srvHost = '_mongodb._tcp.' + MyConstants.DB_SERVER;
    const srvResult = await dohQuery(srvHost, 'SRV');

    if (!srvResult.Answer || srvResult.Answer.length === 0) {
      throw new Error('Không tìm thấy SRV record cho ' + srvHost);
    }

    const hosts = srvResult.Answer.map(a => {
      const parts = a.data.split(' ');
      const port = parts[2];
      const host = parts[3].replace(/\.$/, '');
      return host + ':' + port;
    }).join(',');

    // Bước 2: Phân giải TXT records để lấy replicaSet
    let replicaSet = '';
    try {
      const txtResult = await dohQuery(MyConstants.DB_SERVER, 'TXT');
      if (txtResult.Answer) {
        txtResult.Answer.forEach(a => {
          const txt = a.data.replace(/"/g, '');
          if (txt.includes('replicaSet=')) {
            replicaSet = txt.split('replicaSet=')[1].split('&')[0];
          }
        });
      }
    } catch (e) { /* bỏ qua */ }

    // Bước 3: Tạo chuỗi kết nối chuẩn (không dùng SRV protocol)
    let uri = `mongodb://${MyConstants.DB_USER}:${MyConstants.DB_PASS}@${hosts}/${MyConstants.DB_DATABASE}?authSource=admin&tls=true&retryWrites=true&w=majority`;
    if (replicaSet) uri += `&replicaSet=${replicaSet}`;

    await mongoose.connect(uri, { family: 4 });
    console.log('Connected to ' + MyConstants.DB_SERVER + '/' + MyConstants.DB_DATABASE);

    // Tự động tạo tài khoản admin mặc định nếu chưa tồn tại
    const Models = require('../models/Models');
    const existing = await Models.Admin.findOne({ username: 'admin' });
    if (!existing) {
      await Models.Admin.create({
        _id: new mongoose.Types.ObjectId(),
        username: 'admin',
        password: '123'
      });
      console.log('Đã tạo tài khoản admin mặc định: admin / 123');
    }
  } catch (err) {
    console.error('Lỗi kết nối MongoDB:', err.message);
  }
}

connectMongoDB();
