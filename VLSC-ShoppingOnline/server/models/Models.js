const mongoose = require('mongoose');

// schemas
const AdminSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  role: { type: String, default: 'ADMIN' }, // 'ADMIN', 'CEO', 'MANAGER', 'STAFF', 'WAREHOUSE', 'AUDITOR'
  tokenVersion: { type: Number, default: 0 },
  name: String,
  email: String,
  phone: String,
  active: { type: Number, default: 1 },
  branchId: String
}, { versionKey: false });

const CategorySchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String
}, { versionKey: false });

const CustomerSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  username: String,
  password: String,
  name: String,
  phone: String,
  email: String,
  address: String,
  active: Number,
  token: String
}, { versionKey: false });

const ProductSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: String,
  price: Number,
  image: String,
  images: [String],
  cdate: Number,
  category: CategorySchema,
  brand: String,
  storage: String,
  stockQty: { type: Number, default: 100 },
  status: { type: String, default: 'ACTIVE' },
  rating: { type: Number, default: 4.9 },
  ratingCount: { type: Number, default: 48 },
  soldCount: { type: Number, default: 128 },
  specs: mongoose.Schema.Types.Mixed,
  warranty: String,
  faq: [{ q: String, a: String }],
  reviews: [{
    user: String,
    rating: Number,
    comment: String,
    date: String,
    verified: Boolean
  }]
}, { versionKey: false });

const ItemSchema = mongoose.Schema({
  product: ProductSchema,
  quantity: Number
}, { versionKey: false, _id: false });

const OrderSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  cdate: Number,
  total: Number,
  status: String,
  customer: CustomerSchema,
  items: [ItemSchema],
  deliveryAddress: String,
  deliveryPhone: String,
  paymentMethod: String
}, { versionKey: false });

const AuditLogSchema = mongoose.Schema({
  actorUsername: String,
  actorRole: String,
  action: String,
  targetType: String,
  targetId: String,
  beforeValue: mongoose.Schema.Types.Mixed,
  afterValue: mongoose.Schema.Types.Mixed,
  details: String,
  ipAddress: String,
  createdAt: { type: Date, default: Date.now }
}, { versionKey: false });

// models
const Admin = mongoose.model('Admin', AdminSchema);
const Category = mongoose.model('Category', CategorySchema);
const Customer = mongoose.model('Customer', CustomerSchema);
const Product = mongoose.model('Product', ProductSchema);
const Order = mongoose.model('Order', OrderSchema);
const AuditLog = mongoose.model('AuditLog', AuditLogSchema);

module.exports = { Admin, Category, Customer, Product, Order, AuditLog };
