require('../utils/MongooseUtil');
const Models = require('./Models');
const mongoose = require('mongoose');

const OrderDAO = {
  async selectAll() {
    const query = {};
    const mysort = { cdate: -1 };
    const orders = await Models.Order.find(query).sort(mysort).exec();
    return orders;
  },

  async selectByCustID(_cid) {
    const query = { 'customer._id': _cid };
    const mysort = { cdate: -1 };
    const orders = await Models.Order.find(query).sort(mysort).exec();
    return orders;
  },

  async selectByID(_id) {
    const order = await Models.Order.findById(_id).exec();
    return order;
  },

  async insert(order) {
    order._id = new mongoose.Types.ObjectId();
    order.cdate = order.cdate || Date.now();
    order.status = order.status || 'PENDING';
    const result = await Models.Order.create(order);
    return result;
  },

  async update(_id, newStatus) {
    const newvalues = { status: newStatus };
    const result = await Models.Order.findByIdAndUpdate(_id, newvalues, { new: true });
    return result;
  },

  async updateStatus(_id, status) {
    return await this.update(_id, status);
  },

  async getDashboardStats() {
    try {
      const totalOrders = await Models.Order.countDocuments({});
      const pendingOrders = await Models.Order.countDocuments({ status: 'PENDING' });
      const approvedOrders = await Models.Order.countDocuments({ status: 'APPROVED' });
      const canceledOrders = await Models.Order.countDocuments({ status: 'CANCELED' });
      const totalCustomers = await Models.Customer.countDocuments({});

      // Sum revenue for approved orders
      const revenueAgg = await Models.Order.aggregate([
        { $match: { status: 'APPROVED' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } }
      ]);
      const totalRevenue = revenueAgg.length > 0 ? revenueAgg[0].totalRevenue : 0;

      // Category breakdown from approved orders
      const catAgg = await Models.Order.aggregate([
        { $match: { status: 'APPROVED' } },
        { $unwind: '$items' },
        {
          $group: {
            _id: '$items.product.category.name',
            count: { $sum: '$items.quantity' },
            revenue: { $sum: { $multiply: ['$items.quantity', '$items.product.price'] } }
          }
        },
        { $sort: { revenue: -1 } },
        { $limit: 4 }
      ]);

      // Recent 5 orders
      const recentOrders = await Models.Order.find({})
        .sort({ cdate: -1 })
        .limit(5)
        .exec();

      return {
        totalRevenue,
        totalOrders,
        pendingOrders,
        approvedOrders,
        canceledOrders,
        totalCustomers,
        categoryBreakdown: catAgg,
        recentOrders
      };
    } catch (err) {
      console.error('[OrderDAO.getDashboardStats Error]:', err);
      return {
        totalRevenue: 0,
        totalOrders: 0,
        pendingOrders: 0,
        approvedOrders: 0,
        canceledOrders: 0,
        totalCustomers: 0,
        categoryBreakdown: [],
        recentOrders: []
      };
    }
  }
};

module.exports = OrderDAO;
