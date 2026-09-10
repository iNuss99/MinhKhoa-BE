const jwt = require('jsonwebtoken');
const MyConstants = require('./MyConstants');

const JwtUtil = {
  genToken(username, password, role = 'ADMIN', tokenVersion = 0) {
    const token = jwt.sign(
      { username: username, password: password, role: role.toUpperCase(), tokenVersion: tokenVersion },
      MyConstants.JWT_SECRET,
      { expiresIn: '7d' }
    );
    return token;
  },
  checkToken(req, res, next) {
    let token = req.headers['x-access-token'] || req.headers['authorization'];
    if (token) {
      if (typeof token === 'string' && token.startsWith('Bearer ')) {
        token = token.slice(7).trim();
      }
      jwt.verify(token, MyConstants.JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({
            success: false,
            message: 'Token không hợp lệ hoặc đã hết hạn. Vui lòng đăng nhập lại.'
          });
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Chưa cung cấp token xác thực (Auth token missing).'
      });
    }
  }
};

module.exports = JwtUtil;
