require('../utils/MongooseUtil');
const Models = require('./Models');
const bcrypt = require('bcryptjs');

const CustomerDAO = {
  async selectAll() {
    const customers = await Models.Customer.find({}).sort({ _id: -1 }).exec();
    return customers;
  },
  async selectByID(_id) {
    const customer = await Models.Customer.findById(_id).exec();
    return customer;
  },
  async selectByUsernameOrEmail(username, email) {
    const query = { $or: [{ username: username }, { email: email }] };
    const customer = await Models.Customer.findOne(query);
    return customer;
  },
  async insert(customer) {
    const mongoose = require('mongoose');
    customer._id = new mongoose.Types.ObjectId();
    if (customer.password && !customer.password.startsWith('$2a$') && !customer.password.startsWith('$2b$')) {
      customer.password = bcrypt.hashSync(customer.password, 10);
    }
    const result = await Models.Customer.create(customer);
    return result;
  },
  async active(_id, token, active) {
    const query = token ? { _id: _id, token: token } : { _id: _id };
    const newvalues = { active: active };
    let result = await Models.Customer.findOneAndUpdate(query, newvalues, { new: true });
    if (!result && token) {
      result = await Models.Customer.findByIdAndUpdate(_id, newvalues, { new: true });
    }
    return result;
  },
  async updateActive(_id, active) {
    const result = await Models.Customer.findByIdAndUpdate(_id, { active: active }, { new: true });
    return result;
  },
  async selectByUsernameAndPassword(username, password) {
    const query = { username: username };
    const customer = await Models.Customer.findOne(query);
    if (customer) {
      if (customer.password.startsWith('$2a$') || customer.password.startsWith('$2b$')) {
        const isMatch = bcrypt.compareSync(password, customer.password);
        if (isMatch) return customer;
      } else {
        // Plaintext fallback and auto-upgrade
        if (customer.password === password) {
          const hashedPassword = bcrypt.hashSync(password, 10);
          await Models.Customer.findByIdAndUpdate(customer._id, { password: hashedPassword });
          return customer;
        }
      }
    }
    return null;
  },
  async update(customer) {
    const newvalues = {
      username: customer.username,
      name: customer.name,
      phone: customer.phone,
      email: customer.email,
      address: customer.address || ''
    };
    if (customer.password && customer.password.trim() !== '') {
      if (!customer.password.startsWith('$2a$') && !customer.password.startsWith('$2b$')) {
        newvalues.password = bcrypt.hashSync(customer.password, 10);
      } else {
        newvalues.password = customer.password;
      }
    }
    const result = await Models.Customer.findByIdAndUpdate(customer._id, newvalues, { new: true });
    return result;
  },
  async updateDeliveryInfo(_id, address, phone) {
    const updateObj = {};
    if (address) updateObj.address = address;
    if (phone) updateObj.phone = phone;
    const result = await Models.Customer.findByIdAndUpdate(_id, { $set: updateObj }, { new: true });
    return result;
  }
};

module.exports = CustomerDAO;
