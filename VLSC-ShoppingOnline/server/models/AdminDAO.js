require('../utils/MongooseUtil');
const Models = require('./Models');
const bcrypt = require('bcryptjs');

const AdminDAO = {
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username };
    const admin = await Models.Admin.findOne(query);
    if (admin) {
      if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
        const isMatch = bcrypt.compareSync(password, admin.password);
        if (isMatch) return admin;
      } else {
        if (admin.password === password) {
          return admin;
        }
      }
    }
    return null;
  }
};

module.exports = AdminDAO;
