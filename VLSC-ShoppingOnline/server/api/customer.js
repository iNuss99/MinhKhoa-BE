const express = require('express');
const router = express.Router();
// utils
const CryptoUtil = require('../utils/CryptoUtil');
const EmailUtil = require('../utils/EmailUtil');
const JwtUtil = require('../utils/JwtUtil');
// daos
const CategoryDAO = require('../models/CategoryDAO');
const ProductDAO = require('../models/ProductDAO');
const CustomerDAO = require('../models/CustomerDAO');
const OrderDAO = require('../models/OrderDAO');
const PaymentConfig = require('../utils/PaymentConfig');

// Public Payment Configuration for QR Code checkout
router.get('/payment-config', function (req, res) {
  res.json({ success: true, config: PaymentConfig });
});

// customer authentication & profile
router.post('/signup', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const dbCust = await CustomerDAO.selectByUsernameOrEmail(username, email);
    if (dbCust) {
      res.json({ success: false, message: 'Tên đăng nhập hoặc email đã tồn tại trong hệ thống' });
    } else {
      const now = new Date().getTime(); // milliseconds
      const token = CryptoUtil.md5(now.toString());
      const newCust = {
        username: username,
        password: password,
        name: name,
        phone: phone,
        email: email,
        active: 0,
        token: token
      };
      const result = await CustomerDAO.insert(newCust);
      if (result) {
        console.log(`\n========================================`);
        console.log(`[SIGNUP] Đăng ký thành công tài khoản: ${username}`);
        console.log(`[ACTIVATION INFO] ID: ${result._id}`);
        console.log(`[ACTIVATION INFO] Token: ${token}`);
        console.log(`========================================\n`);

        const send = await EmailUtil.send(email, result._id, token);
        if (send) {
          res.json({
            success: true,
            message: 'Đăng ký thành công! Vui lòng kiểm tra email hoặc dùng mã xác thực bên dưới để kích hoạt tài khoản.',
            activationInfo: { id: result._id, token: token }
          });
        } else {
          // Trả về kèm token để người dùng có thể kích hoạt trực tiếp nếu mail server không gửi được
          res.json({
            success: true,
            message: 'Đăng ký thành công! Bạn có thể kích hoạt ngay với mã xác thực bên dưới.',
            activationInfo: { id: result._id, token: token }
          });
        }
      } else {
        res.json({ success: false, message: 'Đăng ký tài khoản thất bại' });
      }
    }
  } catch (err) {
    console.error('[Signup Error]:', err);
    res.json({ success: false, message: 'Lỗi máy chủ: ' + err.message });
  }
});

router.post('/active', async function (req, res) {
  try {
    const _id = req.body.id;
    const token = req.body.token;
    const result = await CustomerDAO.active(_id, token, 1);
    if (result) {
      res.json({ success: true, message: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay.', customer: result });
    } else {
      res.json({ success: false, message: 'Mã kích hoạt hoặc ID không chính xác!' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post('/login', async function (req, res) {
  try {
    const username = req.body.username;
    const password = req.body.password;
    if (username && password) {
      const customer = await CustomerDAO.selectByUsernameAndPassword(username, password);
      if (customer) {
        if (customer.active === 1) {
          const token = JwtUtil.genToken(username, password);
          // Return safe customer object without password
          const safeCustomer = {
            _id: customer._id,
            username: customer.username,
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            active: customer.active
          };
          res.json({ success: true, message: 'Đăng nhập thành công', token: token, customer: safeCustomer });
        } else {
          res.json({ success: false, message: 'Tài khoản chưa được kích hoạt. Vui lòng kích hoạt qua email!' });
        }
      } else {
        res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không chính xác' });
      }
    } else {
      res.json({ success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu' });
    }
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/token', JwtUtil.checkToken, function (req, res) {
  const token = req.headers['x-access-token'] || req.headers['authorization'];
  res.json({ success: true, message: 'Token hợp lệ', token: token });
});

// myprofile
router.put('/customers/:id', JwtUtil.checkToken, async function (req, res) {
  try {
    const _id = req.params.id;
    const username = req.body.username;
    const password = req.body.password;
    const name = req.body.name;
    const phone = req.body.phone;
    const email = req.body.email;
    const address = req.body.address;
    const customer = { _id: _id, username: username, password: password, name: name, phone: phone, email: email, address: address };
    const result = await CustomerDAO.update(customer);
    res.json({ success: true, message: 'Cập nhật thông tin thành công!', customer: result });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// mycart - lab 07 checkout
router.post('/checkout', JwtUtil.checkToken, async function (req, res) {
  try {
    const now = new Date().getTime(); // milliseconds
    const total = req.body.total;
    const items = req.body.items;
    const customer = req.body.customer;
    const order = { cdate: now, total: total, status: 'PENDING', customer: customer, items: items };
    const result = await OrderDAO.insert(order);
    res.json(result);
  } catch (err) {
    console.error('[Checkout Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// orders & checkout
router.post('/orders', JwtUtil.checkToken, async function (req, res) {
  try {
    const { items, total, customer, deliveryAddress, deliveryPhone, paymentMethod, status } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Giỏ hàng trống, không thể đặt hàng.' });
    }

    let cust = customer;
    if (!cust || !cust._id) {
      const dbCust = await CustomerDAO.selectByUsernameOrEmail(req.decoded.username, req.decoded.username);
      if (dbCust) {
        cust = {
          _id: dbCust._id,
          username: dbCust.username,
          name: dbCust.name,
          phone: dbCust.phone,
          email: dbCust.email,
          address: dbCust.address,
          active: dbCust.active
        };
      }
    }

    const orderData = {
      cdate: Date.now(),
      total: total,
      status: status || 'PENDING',
      customer: cust,
      items: items,
      deliveryAddress: deliveryAddress,
      deliveryPhone: deliveryPhone,
      paymentMethod: paymentMethod || 'COD'
    };

    const result = await OrderDAO.insert(orderData);
    if (result) {
      // Auto-save delivery address & phone to customer's account for auto-fill in future orders
      let updatedCustomer = null;
      if (cust && cust._id) {
        updatedCustomer = await CustomerDAO.updateDeliveryInfo(cust._id, deliveryAddress, deliveryPhone);
      }

      console.log(`\n========================================`);
      console.log(`[NEW ORDER] Đơn hàng mới: #${result._id}`);
      console.log(`[CUSTOMER] Khách hàng: ${cust ? cust.name || cust.username : 'Ẩn danh'} (${deliveryPhone || 'N/A'})`);
      console.log(`[ADDRESS] Địa chỉ: ${deliveryAddress || 'N/A'}`);
      console.log(`[TOTAL] Tổng tiền: ${total} VNĐ - PT: ${paymentMethod || 'COD'} - Status: ${status || 'PENDING'}`);
      console.log(`========================================\n`);

      res.json({
        success: true,
        message: 'Đặt hàng thành công! Đơn hàng của bạn đã được ghi nhận.',
        order: result,
        customer: updatedCustomer
      });
    } else {
      res.status(500).json({ success: false, message: 'Không thể tạo đơn hàng, vui lòng thử lại.' });
    }
  } catch (err) {
    console.error('[Create Order Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

router.get('/orders/customer/:cid', JwtUtil.checkToken, async function (req, res) {
  try {
    const _cid = req.params.cid;
    const orders = await OrderDAO.selectByCustID(_cid);
    res.json(orders || []);
  } catch (err) {
    console.error('[Get Customer Orders Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// categories
router.get('/categories', async function (req, res, next) {
  try {
    const categories = await CategoryDAO.selectAll();
    res.json(categories || []);
  } catch (err) {
    next(err);
  }
});

// products
router.get('/products/new', async function (req, res, next) {
  try {
    const products = await ProductDAO.selectTopNew(3);
    res.json(products || []);
  } catch (err) {
    next(err);
  }
});

router.get('/products/hot', async function (req, res, next) {
  try {
    const products = await ProductDAO.selectTopHot(3);
    res.json(products || []);
  } catch (err) {
    next(err);
  }
});

router.get('/products/category/:cid', async function (req, res, next) {
  try {
    const _cid = req.params.cid;
    const products = await ProductDAO.selectByCatID(_cid);
    res.json(products || []);
  } catch (err) {
    next(err);
  }
});

router.get('/products/search/:keyword', async function (req, res, next) {
  try {
    const keyword = req.params.keyword;
    const products = await ProductDAO.selectByKeyword(keyword);
    res.json(products || []);
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id', async function (req, res, next) {
  try {
    const _id = req.params.id;
    const product = await ProductDAO.selectByID(_id);
    res.json(product || null);
  } catch (err) {
    next(err);
  }
});

router.get('/products/:id/related', async function (req, res, next) {
  try {
    const _id = req.params.id;
    const product = await ProductDAO.selectByID(_id);
    const catId = product && product.category ? product.category._id : null;
    const related = await ProductDAO.selectRelated(_id, catId, 4);
    res.json(related || []);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
