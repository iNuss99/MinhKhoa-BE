const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Admin, AuditLog } = require('../models/Models');
// utils
const JwtUtil = require('../utils/JwtUtil');
const PaymentConfig = require('../utils/PaymentConfig');
// daos
const AdminDAO = require('../models/AdminDAO');
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const OrderDAO = require('../models/OrderDAO');
const CustomerDAO = require('../models/CustomerDAO');

// rbac middleware
const { requireRole, logAudit } = require('../middleware/rbac');

// 1. Admin Login
router.post('/login', async function (req, res, next) {
  try {
    const { username, password } = req.body;
    if (username && password) {
      const admin = await AdminDAO.selectByUsernameAndPassword(username, password);
      if (admin) {
        if (admin.active === 0) {
          return res.status(403).json({ success: false, message: 'Tài khoản quản trị này đã bị vô hiệu hóa.' });
        }
        const role = (admin.role || 'ADMIN').toUpperCase();
        const tokenVersion = admin.tokenVersion || 0;
        const token = JwtUtil.genToken(username, password, role, tokenVersion);

        await logAudit({
          actorUsername: username,
          actorRole: role,
          action: 'LOGIN_SUCCESS',
          targetType: 'AdminUser',
          targetId: admin._id,
          details: 'Đăng nhập hệ thống thành công',
          req
        });

        res.json({
          success: true,
          message: 'Đăng nhập quản trị thành công',
          token: token,
          user: { username: admin.username, role: role, name: admin.name || admin.username }
        });
      } else {
        res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
      }
    } else {
      res.json({ success: false, message: 'Vui lòng nhập tên đăng nhập và mật khẩu' });
    }
  } catch (err) {
    next(err);
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token hợp lệ', token: token, decoded: req.decoded });
});

// 2. Dashboard Metrics (ADMIN, CEO, MANAGER, AUDITOR)
router.get('/dashboard/stats', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'AUDITOR'), async function (req, res, next) {
  try {
    const stats = await OrderDAO.getDashboardStats();
    res.json({ success: true, stats: stats });
  } catch (err) {
    next(err);
  }
});

// 3. Category Management
router.get('/categories', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'AUDITOR'), async function (req, res, next) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories || []);
  } catch (err) {
    next(err);
  }
});

router.post('/categories', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res, next) {
  try {
    const { name } = req.body;
    const category = { name: name };
    const result = await CategoryDAO.insert(category);

    await logAudit({
      action: 'CREATE_CATEGORY',
      targetType: 'Category',
      targetId: result._id,
      afterValue: { name },
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res, next) {
  try {
    const _id = req.params.id;
    const { name } = req.body;
    const category = { _id: _id, name: name };
    const result = await CategoryDAO.update(category);

    await logAudit({
      action: 'UPDATE_CATEGORY',
      targetType: 'Category',
      targetId: _id,
      afterValue: { name },
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res, next) {
  try {
    const _id = req.params.id;
    const result = await CategoryDAO.delete(_id);

    await logAudit({
      action: 'DELETE_CATEGORY',
      targetType: 'Category',
      targetId: _id,
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 4. Product Management
router.get('/products', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'WAREHOUSE', 'AUDITOR'), async function (req, res, next) {
  try {
    var products = (await ProductDAO.selectAll()) || [];
    const sizePage = 8;
    const noPages = Math.ceil(products.length / sizePage);
    var curPage = 1;
    if (req.query.page) curPage = parseInt(req.query.page);
    const offset = (curPage - 1) * sizePage;
    products = products.slice(offset, offset + sizePage);
    res.json({ products: products, noPages: noPages, curPage: curPage });
  } catch (err) {
    next(err);
  }
});

router.post('/products', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER'), async function (req, res, next) {
  try {
    const { name, price, category: cid, image } = req.body;
    const now = new Date().getTime();
    const category = await CategoryDAO.selectByID(cid);
    const product = { name, price, image, cdate: now, category, stockQty: req.body.stockQty || 100 };
    const result = await ProductDAO.insert(product);

    await logAudit({
      action: 'CREATE_PRODUCT',
      targetType: 'Product',
      targetId: result._id,
      afterValue: { name, price, category: category?.name },
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.put('/products/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'WAREHOUSE'), async function (req, res, next) {
  try {
    const _id = req.params.id;
    const userRole = (req.decoded.role || 'ADMIN').toUpperCase();

    // WAREHOUSE field-level restriction
    if (userRole === 'WAREHOUSE') {
      const allowedKeys = ['stockQty', 'status'];
      const bodyKeys = Object.keys(req.body);
      const forbiddenKeys = bodyKeys.filter(k => !allowedKeys.includes(k));
      if (forbiddenKeys.length > 0) {
        return res.status(403).json({
          success: false,
          message: `Forbidden: Vai trò WAREHOUSE không được phép thay đổi các trường: ${forbiddenKeys.join(', ')}`
        });
      }
    }

    const { name, price, category: cid, image, stockQty, status } = req.body;
    const now = new Date().getTime();
    let category;
    if (cid) category = await CategoryDAO.selectByID(cid);

    const product = { _id, name, price, image, cdate: now, stockQty, status };
    if (category) product.category = category;

    const result = await ProductDAO.update(product);

    await logAudit({
      action: userRole === 'WAREHOUSE' ? 'UPDATE_STOCK' : 'UPDATE_PRODUCT',
      targetType: 'Product',
      targetId: _id,
      afterValue: req.body,
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.delete('/products/:id', JwtUtil.checkToken, requireRole('ADMIN'), async function (req, res, next) {
  try {
    const _id = req.params.id;
    const result = await ProductDAO.delete(_id);

    await logAudit({
      action: 'DELETE_PRODUCT',
      targetType: 'Product',
      targetId: _id,
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// 5. Order Management (ADMIN, CEO, MANAGER, STAFF, WAREHOUSE, AUDITOR)
router.get('/orders', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'STAFF', 'WAREHOUSE', 'AUDITOR'), async function (req, res, next) {
  try {
    const orders = await OrderDAO.selectAll();
    res.json(orders || []);
  } catch (err) {
    next(err);
  }
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'STAFF', 'WAREHOUSE', 'AUDITOR'), async function (req, res, next) {
  try {
    const _cid = (req.params.cid || '').trim();
    const orders = await OrderDAO.selectByCustID(_cid);
    res.json(orders || []);
  } catch (err) {
    next(err);
  }
});

router.put('/orders/status/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'STAFF', 'WAREHOUSE'), async function (req, res, next) {
  try {
    const _id = (req.params.id || '').trim();
    const { status } = req.body;
    const result = await OrderDAO.updateStatus(_id, status);

    await logAudit({
      action: 'UPDATE_ORDER_STATUS',
      targetType: 'Order',
      targetId: _id,
      afterValue: { status },
      req
    });

    res.json({ success: true, message: `Cập nhật trạng thái đơn hàng thành ${status}`, order: result });
  } catch (err) {
    next(err);
  }
});

// 6. Customer Management (ADMIN, CEO, MANAGER, STAFF, AUDITOR)
router.get('/customers', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'STAFF', 'AUDITOR'), async function (req, res, next) {
  try {
    const customers = await CustomerDAO.selectAll();
    res.json(customers || []);
  } catch (err) {
    next(err);
  }
});

router.put('/customers/deactive/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER'), async function (req, res, next) {
  try {
    const _id = (req.params.id || '').trim();
    const token = req.body.token ? String(req.body.token).trim() : '';
    const active = req.body.active;
    let result;

    if (token) {
      result = await CustomerDAO.active(_id, token, 0);
    } else {
      const nextActive = active !== undefined ? active : 0;
      result = await CustomerDAO.updateActive(_id, nextActive);
    }

    await logAudit({
      action: (result && result.active === 1) ? 'ACTIVATE_CUSTOMER' : 'DEACTIVATE_CUSTOMER',
      targetType: 'Customer',
      targetId: _id,
      afterValue: { active: result ? result.active : 0 },
      req
    });

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.get('/customers/sendmail/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'STAFF'), async function (req, res, next) {
  try {
    const _id = (req.params.id || '').trim();
    const cust = await CustomerDAO.selectByID(_id);
    if (cust) {
      const send = await EmailUtil.send(cust.email, cust._id, cust.token);
      await logAudit({
        action: 'SEND_ACTIVATION_EMAIL',
        targetType: 'Customer',
        targetId: _id,
        details: `Gửi email kích hoạt tài khoản tới: ${cust.email}`,
        req
      });

      if (send) {
        res.json({ success: true, message: 'Please check email' });
      } else {
        res.json({ success: false, message: 'Email failure' });
      }
    } else {
      res.json({ success: false, message: 'Not exists customer' });
    }
  } catch (err) {
    next(err);
  }
});

// 7. Payment Config (ADMIN, CEO)
router.get('/payment-config', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'AUDITOR'), function (req, res) {
  res.json({ success: true, config: PaymentConfig });
});

router.put('/payment-config', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res) {
  const { bankName, bankCode, accountNo, accountName, customQrUrl } = req.body;
  const beforeVal = { ...PaymentConfig };

  if (bankName) PaymentConfig.bankName = bankName;
  if (bankCode) PaymentConfig.bankCode = bankCode.toUpperCase().trim();
  if (accountNo) PaymentConfig.accountNo = accountNo.trim();
  if (accountName) PaymentConfig.accountName = accountName.trim();
  if (customQrUrl !== undefined) PaymentConfig.customQrUrl = customQrUrl.trim();
  PaymentConfig.updatedAt = Date.now();

  await logAudit({
    action: 'UPDATE_PAYMENT_CONFIG',
    targetType: 'PaymentConfig',
    targetId: 'GLOBAL',
    beforeValue: beforeVal,
    afterValue: { ...PaymentConfig },
    req
  });

  res.json({ success: true, message: 'Cập nhật cấu hình thanh toán QR ngân hàng thành công!', config: PaymentConfig });
});

// 8. Internal Admin User Management (ADMIN, CEO)
router.get('/users', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'MANAGER', 'AUDITOR'), async function (req, res, next) {
  try {
    const users = await Admin.find({}, { password: 0 }).sort({ _id: -1 });
    res.json({ success: true, users: users });
  } catch (err) {
    next(err);
  }
});

router.post('/users', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res, next) {
  try {
    const { username, password, role, name, email, phone } = req.body;
    const existing = await Admin.findOne({ username: username });
    if (existing) {
      return res.json({ success: false, message: `Tên đăng nhập '${username}' đã tồn tại.` });
    }

    const newUser = new Admin({
      _id: new mongoose.Types.ObjectId(),
      username,
      password,
      role: (role || 'STAFF').toUpperCase(),
      name: name || username,
      email: email || '',
      phone: phone || '',
      active: 1,
      tokenVersion: 0
    });

    await newUser.save();

    await logAudit({
      action: 'CREATE_INTERNAL_USER',
      targetType: 'AdminUser',
      targetId: newUser._id,
      afterValue: { username, role: newUser.role, name: newUser.name },
      req
    });

    res.json({ success: true, message: 'Tạo tài khoản nhân sự nội bộ thành công!', user: newUser });
  } catch (err) {
    next(err);
  }
});

router.put('/users/role/:id', JwtUtil.checkToken, requireRole('ADMIN', 'CEO'), async function (req, res, next) {
  try {
    const _id = req.params.id;
    const { role } = req.body;
    const newRole = (role || 'STAFF').toUpperCase();

    const user = await Admin.findById(_id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const oldRole = user.role;
    user.role = newRole;
    user.tokenVersion = (user.tokenVersion || 0) + 1; // Invalidate previous active sessions
    await user.save();

    await logAudit({
      action: 'CHANGE_USER_ROLE',
      targetType: 'AdminUser',
      targetId: _id,
      beforeValue: { role: oldRole },
      afterValue: { role: newRole, tokenVersion: user.tokenVersion },
      req
    });

    res.json({ success: true, message: `Đã đổi vai trò của '${user.username}' thành ${newRole}. Phiên cũ đã bị hủy!`, user: user });
  } catch (err) {
    next(err);
  }
});

// 9. Audit Logs API (ADMIN, CEO, AUDITOR)
router.get('/audit-logs', JwtUtil.checkToken, requireRole('ADMIN', 'CEO', 'AUDITOR'), async function (req, res, next) {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, logs: logs });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
