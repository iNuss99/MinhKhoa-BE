require('../utils/MongooseUtil');
const Models = require('./Models');

const ProductDAO = {
  async selectAll() {
    const query = {};
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectByID(_id) {
    const product = await Models.Product.findById(_id).exec();
    return product;
  },
  async insert(product) {
    const mongoose = require('mongoose');
    product._id = new mongoose.Types.ObjectId();
    const result = await Models.Product.create(product);
    return result;
  },
  async update(product) {
    const newvalues = { name: product.name, price: product.price, image: product.image, category: product.category };
    const result = await Models.Product.findByIdAndUpdate(product._id, newvalues, { new: true });
    return result;
  },
  async delete(_id) {
    const result = await Models.Product.findByIdAndDelete(_id);
    return result;
  },
  async selectTopNew(top) {
    const query = {};
    const mysort = { cdate: -1 }; // descending
    const products = await Models.Product.find(query).sort(mysort).limit(top).exec();
    return products;
  },
  async selectTopHot(top) {
    let products = [];
    try {
      const items = await Models.Order.aggregate([
        { $match: { status: 'APPROVED' } },
        { $unwind: '$items' },
        { $group: { _id: '$items.product._id', sum: { $sum: '$items.quantity' } } },
        { $sort: { sum: -1 } },
        { $limit: top }
      ]).exec();
      for (const item of items) {
        if (item._id) {
          const prod = await ProductDAO.selectByID(item._id);
          if (prod) products.push(prod);
        }
      }
    } catch (e) {
      console.warn('Order aggregation error, fallback to soldCount:', e.message);
    }
    if (products.length < top) {
      const remaining = top - products.length;
      const existingIds = products.map(p => p._id);
      const fallbackProds = await Models.Product.find({ _id: { $nin: existingIds } })
        .sort({ soldCount: -1, rating: -1 })
        .limit(remaining)
        .exec();
      products = products.concat(fallbackProds);
    }
    return products;
  },
  async selectByCatID(_cid) {
    if (_cid === 'all') {
      return await Models.Product.find({}).exec();
    }
    const query = { 'category._id': _cid };
    const products = await Models.Product.find(query).exec();
    return products;
  },
  async selectRelated(_id, _cid, limit = 4) {
    const query = {
      _id: { $ne: _id }
    };
    if (_cid) {
      query['category._id'] = _cid;
    }
    let products = await Models.Product.find(query).limit(limit).exec();
    if (products.length < limit) {
      const more = await Models.Product.find({ _id: { $ne: _id, $nin: products.map(p => p._id) } }).limit(limit - products.length).exec();
      products = products.concat(more);
    }
    return products;
  },
  async selectByKeyword(keyword) {
    const query = { name: { $regex: new RegExp(keyword, "i") } };
    const products = await Models.Product.find(query).exec();
    return products;
  }
};

module.exports = ProductDAO;
