import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import { formatVND } from '../utils/formatCurrency';
import CartUtil from '../utils/CartUtil';

class Mycart extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtRecipientName: '',
      txtRecipientPhone: '',
      txtDeliveryAddress: '',
      txtOrderNote: '',
      paymentMethod: 'COD', // 'COD', 'VNPAY-QR', 'MOMO'
      couponCode: '',
      discountAmount: 0,
      appliedCoupon: '',
      couponError: '',
      isSubmitting: false,
      orderSuccess: null,
      showQRModal: false,
      qrMemo: '',
      qrCountdown: 300,
      isAutoScanning: false,
      bankConfig: {
        bankName: 'MBBank (Ngân Hàng Quân Đội)',
        bankCode: 'MB',
        accountNo: '0388888888',
        accountName: 'CONG TY TNHH VLSC SHOP',
        customQrUrl: ''
      }
    };
  }

  componentDidMount() {
    let savedAddress = '';
    let savedPhone = '';
    let savedName = '';

    try {
      savedAddress = localStorage.getItem('vlsc_last_delivery_address') || '';
      savedPhone = localStorage.getItem('vlsc_last_delivery_phone') || '';
      savedName = localStorage.getItem('vlsc_last_recipient_name') || '';
    } catch (e) {}

    const cust = this.context.customer || {};
    this.setState({
      txtRecipientName: cust.name || savedName || '',
      txtRecipientPhone: cust.phone || savedPhone || '',
      txtDeliveryAddress: cust.address || savedAddress || ''
    });

    axios.get('/api/customer/payment-config')
      .then(res => {
        if (res.data && res.data.success && res.data.config) {
          this.setState({ bankConfig: res.data.config });
        }
      })
      .catch(() => {});
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.context.customer) {
      const cust = this.context.customer;
      const updates = {};
      if (!this.state.txtRecipientName && cust.name) updates.txtRecipientName = cust.name;
      if (!this.state.txtRecipientPhone && cust.phone) updates.txtRecipientPhone = cust.phone;
      if (!this.state.txtDeliveryAddress && cust.address) updates.txtDeliveryAddress = cust.address;
      if (Object.keys(updates).length > 0) {
        this.setState(updates);
      }
    }
  }

  componentWillUnmount() {
    if (this.qrTimer) clearInterval(this.qrTimer);
    if (this.autoScanTimer) clearTimeout(this.autoScanTimer);
  }

  handleApplyCoupon = (e) => {
    e.preventDefault();
    const code = this.state.couponCode.trim().toUpperCase();
    if (!code) return;

    if (code === 'VLSCNEW') {
      this.setState({
        discountAmount: 100000,
        appliedCoupon: 'VLSCNEW',
        couponError: ''
      });
      if (this.context.showToast) this.context.showToast('Áp dụng mã giảm giá VLSCNEW (-100.000 ₫) thành công!', 'success');
    } else if (code === 'FREESHIP') {
      this.setState({
        discountAmount: 30000,
        appliedCoupon: 'FREESHIP',
        couponError: ''
      });
      if (this.context.showToast) this.context.showToast('Áp dụng mã FREESHIP (-30.000 ₫) thành công!', 'success');
    } else {
      this.setState({ couponError: 'Mã giảm giá không hợp lệ hoặc đã hết lượt dùng.' });
    }
  };

  // event-handlers (Lab 07)
  lnkRemoveClick(id) {
    const mycart = this.context.mycart;
    const index = mycart.findIndex(x => x.product._id === id);
    if (index !== -1) { // found, remove item
      mycart.splice(index, 1);
      this.context.setMycart(mycart);
    }
  }

  lnkCheckoutClick() {
    if (window.confirm('ARE YOU SURE?')) {
      if (this.context.mycart.length > 0) {
        const total = CartUtil.getTotal(this.context.mycart);
        const items = this.context.mycart;
        const customer = this.context.customer;
        if (customer) {
          this.apiCheckout(total, items, customer);
        } else {
          this.props.navigate('/login');
        }
      } else {
        alert('Your cart is empty');
      }
    }
  }

  // apis (Lab 07)
  apiCheckout(total, items, customer) {
    const body = { total: total, items: items, customer: customer };
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/customer/checkout', body, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('OK BABY!');
        this.context.setMycart([]);
        this.props.navigate('/home');
      } else {
        alert('SORRY BABY!');
      }
    });
  }

  handleCheckoutClick = (e) => {
    e.preventDefault();

    if (!this.context.token) {
      if (this.context.showToast) this.context.showToast('Vui lòng đăng nhập để tiến hành đặt hàng!', 'danger');
      this.props.navigate('/login');
      return;
    }

    const { txtRecipientName, txtRecipientPhone, txtDeliveryAddress } = this.state;
    const cart = this.context.mycart || [];

    if (cart.length === 0) {
      if (this.context.showToast) this.context.showToast('Giỏ hàng của bạn đang trống!', 'danger');
      return;
    }

    if (!txtRecipientName.trim() || !txtRecipientPhone.trim() || !txtDeliveryAddress.trim()) {
      if (this.context.showToast) this.context.showToast('Vui lòng điền đầy đủ tên, số điện thoại và địa chỉ giao hàng.', 'danger');
      return;
    }

    // If payment method is QR (VNPAY-QR or MOMO), pop up the QR payment modal first
    if (this.state.paymentMethod === 'VNPAY-QR' || this.state.paymentMethod === 'MOMO') {
      const memoCode = 'VLSC DH' + Date.now().toString().slice(-6);
      this.setState({
        showQRModal: true,
        qrMemo: memoCode,
        qrCountdown: 300,
        isAutoScanning: true
      });

      // Start countdown
      if (this.qrTimer) clearInterval(this.qrTimer);
      this.qrTimer = setInterval(() => {
        this.setState(prevState => {
          if (prevState.qrCountdown <= 1) {
            clearInterval(this.qrTimer);
            return { qrCountdown: 0 };
          }
          return { qrCountdown: prevState.qrCountdown - 1 };
        });
      }, 1000);

      return;
    }

    // If COD, submit directly
    this.submitOrderApi('Thanh toán COD (Tiền mặt khi nhận hàng)', 'PENDING');
  };

  submitOrderApi = async (methodName, initialStatus = 'PENDING') => {
    const { txtRecipientName, txtRecipientPhone, txtDeliveryAddress, txtOrderNote, discountAmount } = this.state;
    const cart = this.context.mycart || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingFee = subtotal >= 500000 ? 0 : 30000;
    const total = Math.max(0, subtotal + shippingFee - discountAmount);

    const orderPayload = {
      customer: this.context.customer,
      items: cart,
      total: total,
      deliveryAddress: txtDeliveryAddress.trim() + (txtOrderNote ? ` (Ghi chú: ${txtOrderNote.trim()})` : ''),
      deliveryPhone: txtRecipientPhone.trim(),
      paymentMethod: methodName,
      status: initialStatus
    };

    this.setState({ isSubmitting: true, showQRModal: false });
    if (this.qrTimer) clearInterval(this.qrTimer);

    try {
      const config = {
        headers: { 'x-access-token': this.context.token }
      };
      const res = await axios.post('/api/customer/orders', orderPayload, config);

      if (res.data && res.data.success) {
        // Auto-save delivery address & phone for next time
        try {
          localStorage.setItem('vlsc_last_delivery_address', txtDeliveryAddress.trim());
          localStorage.setItem('vlsc_last_delivery_phone', txtRecipientPhone.trim());
          localStorage.setItem('vlsc_last_recipient_name', txtRecipientName.trim());
        } catch (e) {}

        if (this.context.customer) {
          const updatedCust = res.data.customer || {
            ...this.context.customer,
            address: txtDeliveryAddress.trim(),
            phone: txtRecipientPhone.trim(),
            name: txtRecipientName.trim()
          };
          this.context.setCustomer(updatedCust);
        }

        this.context.clearCart();
        this.setState({
          isSubmitting: false,
          orderSuccess: res.data.order || { _id: 'HD' + Date.now().toString().slice(-6), total: total, paymentMethod: methodName }
        });
        if (this.context.showToast) {
          const toastMsg = initialStatus === 'APPROVED'
            ? 'Xác nhận đơn hàng thành công!'
            : 'Đặt hàng thành công! Đơn hàng đang chờ shop xác nhận & đối soát thanh toán.';
          this.context.showToast(toastMsg, 'success');
        }
      } else {
        this.setState({ isSubmitting: false });
        if (this.context.showToast) this.context.showToast(res.data.message || 'Đặt hàng không thành công', 'danger');
      }
    } catch (err) {
      console.error('[Checkout error]:', err);
      this.setState({ isSubmitting: false });
      if (this.context.showToast) this.context.showToast('Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại!', 'danger');
    }
  };

  formatCountdown(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  render() {
    const cart = this.context.mycart || [];
    const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    const shippingFee = subtotal >= 500000 || subtotal === 0 ? 0 : 30000;
    const total = Math.max(0, subtotal + shippingFee - this.state.discountAmount);

    // If order was successfully placed
    if (this.state.orderSuccess) {
      const order = this.state.orderSuccess;
      return (
        <div className="py-5">
          <div className="container" style={{ maxWidth: '680px' }}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 text-center bg-white">
              <div className="mb-4">
                <span className="p-3 bg-success bg-opacity-10 text-success rounded-circle d-inline-flex align-items-center justify-content-center" style={{ width: '80px', height: '80px' }}>
                  <i className="bi bi-check-circle-fill display-5"></i>
                </span>
              </div>
              <h2 className="fw-extrabold text-dark mb-2">ĐẶT HÀNG THÀNH CÔNG!</h2>
              <p className="text-secondary mb-4">
                Cảm ơn bạn đã tin tưởng mua sắm tại <strong>VLSC Shop</strong>. Mã đơn hàng của bạn là <strong className="text-dark">#{order._id ? order._id.toString().slice(-8).toUpperCase() : 'VLSC888'}</strong>.
              </p>

              <div className="bg-light p-3.5 rounded-3 mb-4 text-start">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Tổng thanh toán:</span>
                  <span className="fw-bold text-success">{formatVND(total)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Phương thức thanh toán:</span>
                  <span className="fw-bold text-primary small">{order.paymentMethod || this.state.paymentMethod}</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-secondary small">Trạng thái xử lý:</span>
                  <span className="fw-bold text-success small">
                    {order.status === 'APPROVED' ? 'Đã duyệt & Đang chuẩn bị giao' : 'Đang xử lý đơn hàng'}
                  </span>
                </div>
              </div>

              <div className="d-flex flex-wrap gap-3 justify-content-center">
                <Link to="/myorders" className="btn btn-success rounded-pill px-4 py-2.5 fw-bold d-flex align-items-center gap-2">
                  <i className="bi bi-receipt"></i> Xem đơn hàng của tôi
                </Link>
                <Link to="/home" className="btn btn-outline-secondary rounded-pill px-4 py-2.5 fw-bold">
                  Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Empty Cart State
    if (cart.length === 0) {
      return (
        <div className="py-5">
          <div className="container text-center py-5" style={{ maxWidth: '540px' }}>
            <div className="mb-4">
              <span className="p-4 bg-light text-secondary rounded-circle d-inline-flex align-items-center justify-content-center shadow-sm">
                <i className="bi bi-cart-x display-4 text-muted"></i>
              </span>
            </div>
            <h3 className="fw-extrabold text-dark mb-2">Giỏ hàng của bạn đang trống</h3>
            <p className="text-secondary mb-4">
              Hãy khám phá hàng trăm sản phẩm công nghệ và phụ kiện chính hãng với nhiều ưu đãi hấp dẫn ngay hôm nay.
            </p>
            <Link to="/home" className="btn btn-success rounded-pill px-4 py-3 fw-bold shadow-sm d-inline-flex align-items-center gap-2">
              <i className="bi bi-arrow-left"></i> Khám phá sản phẩm ngay
            </Link>
          </div>
        </div>
      );
    }

    const { bankConfig } = this.state;
    // VietQR dynamic image URL using official VietQR API or custom QR image URL
    const vietQrUrl = bankConfig.customQrUrl || `https://img.vietqr.io/image/${bankConfig.bankCode || 'MB'}-${bankConfig.accountNo || '0388888888'}-compact2.png?amount=${total}&addInfo=${encodeURIComponent(this.state.qrMemo || 'VLSC SHOP')}&accountName=${encodeURIComponent(bankConfig.accountName || 'VLSC SHOP')}`;

    return (
      <div className="py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none fw-semibold">Trang chủ</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Giỏ hàng & Đặt hàng</li>
          </ol>
        </nav>

        <h1 className="h3 fw-extrabold text-dark mb-4 d-flex align-items-center gap-2">
          <i className="bi bi-bag-check-fill text-success"></i> GIỎ HÀNG CỦA BẠN
          <span className="badge bg-success-subtle text-success fs-6 rounded-pill px-3 py-1 fw-bold border border-success-subtle">
            {cart.reduce((sum, item) => sum + item.quantity, 0)} món
          </span>
        </h1>

        <div className="row g-4">
          {/* Left Column: Cart Items List */}
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
              <div className="table-responsive">
                <table className="table align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4 py-3 text-secondary fw-semibold small">Sản phẩm</th>
                      <th className="py-3 text-secondary fw-semibold small text-center">Đơn giá</th>
                      <th className="py-3 text-secondary fw-semibold small text-center">Số lượng</th>
                      <th className="py-3 text-secondary fw-semibold small text-end">Tạm tính</th>
                      <th className="pe-4 py-3 text-secondary fw-semibold small text-center">Xóa</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const prod = item.product;
                      const imgSrc = prod.images && prod.images.length > 0
                        ? prod.images[0]
                        : (prod.image && prod.image.startsWith('http') ? prod.image : "data:image/jpg;base64," + prod.image);

                      return (
                        <tr key={prod._id} className="border-bottom">
                          <td className="ps-4 py-3">
                            <div className="d-flex align-items-center gap-3">
                              <img
                                src={imgSrc}
                                alt={prod.name}
                                className="rounded-3 border object-fit-contain p-1"
                                style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: '#fafafa' }}
                              />
                              <div>
                                <Link to={'/product/' + prod._id} className="fw-bold text-dark text-decoration-none d-block text-truncate" style={{ maxWidth: '240px' }} title={prod.name}>
                                  {prod.name}
                                </Link>
                                <span className="badge bg-light text-secondary border small mt-1">
                                  {prod.category ? prod.category.name : 'Chính hãng'}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-3 text-center fw-semibold text-dark">
                            {formatVND(prod.price)}
                          </td>

                          <td className="py-3 text-center">
                            <div className="quantity-control-group d-inline-flex">
                              <button
                                type="button"
                                onClick={() => this.context.updateCartItem(prod._id, item.quantity - 1)}
                                aria-label="Giảm"
                              >
                                <i className="bi bi-dash"></i>
                              </button>
                              <input
                                type="number"
                                min="1"
                                max="99"
                                value={item.quantity}
                                onChange={(e) => this.context.updateCartItem(prod._id, parseInt(e.target.value) || 1)}
                              />
                              <button
                                type="button"
                                onClick={() => this.context.updateCartItem(prod._id, item.quantity + 1)}
                                aria-label="Tăng"
                              >
                                <i className="bi bi-plus"></i>
                              </button>
                            </div>
                          </td>

                          <td className="py-3 text-end fw-extrabold text-success">
                            {formatVND(prod.price * item.quantity)}
                          </td>

                          <td className="pe-4 py-3 text-center">
                            <button
                              className="btn btn-outline-danger btn-sm rounded-circle p-2 border-0"
                              onClick={() => this.lnkRemoveClick(prod._id)}
                              title="Xóa sản phẩm này"
                            >
                              <i className="bi bi-trash3-fill"></i>
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="p-3 bg-light d-flex justify-content-between align-items-center">
                <Link to="/home" className="btn btn-outline-secondary btn-sm rounded-pill px-3 fw-bold d-inline-flex align-items-center gap-1">
                  <i className="bi bi-arrow-left"></i> Tiếp tục chọn thêm sản phẩm
                </Link>
                <button
                  className="btn btn-link btn-sm text-danger text-decoration-none fw-bold"
                  onClick={() => this.context.clearCart()}
                >
                  <i className="bi bi-trash me-1"></i> Xóa toàn bộ giỏ hàng
                </button>
              </div>
            </div>

            {/* Delivery Information Form */}
            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4 bg-white">
              <div className="d-flex align-items-center justify-content-between mb-3">
                <h5 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
                  <i className="bi bi-geo-alt-fill text-success"></i> Thông tin nhận hàng & Vận chuyển
                </h5>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small fw-semibold">
                  <i className="bi bi-check-circle-fill me-1"></i> Tự động lưu địa chỉ
                </span>
              </div>

              {!this.context.token && (
                <div className="alert alert-warning d-flex align-items-center gap-2 rounded-3 py-2 px-3 small mb-3">
                  <i className="bi bi-exclamation-triangle-fill fs-5"></i>
                  <span>Bạn chưa đăng nhập. Vui lòng <Link to="/login" className="fw-bold text-dark">Đăng nhập</Link> để lưu lịch sử đơn hàng và tích điểm thành viên.</span>
                </div>
              )}

              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Họ và tên người nhận *</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Ví dụ: Nguyễn Văn A"
                    value={this.state.txtRecipientName}
                    onChange={(e) => this.setState({ txtRecipientName: e.target.value })}
                    required
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label small fw-bold text-secondary">Số điện thoại liên hệ *</label>
                  <input
                    type="tel"
                    className="form-control rounded-3"
                    placeholder="Ví dụ: 0912345678"
                    value={this.state.txtRecipientPhone}
                    onChange={(e) => this.setState({ txtRecipientPhone: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Địa chỉ giao hàng chi tiết *</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                    value={this.state.txtDeliveryAddress}
                    onChange={(e) => this.setState({ txtDeliveryAddress: e.target.value })}
                    required
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-bold text-secondary">Ghi chú đơn hàng (Tùy chọn)</label>
                  <input
                    type="text"
                    className="form-control rounded-3"
                    placeholder="Ví dụ: Giao giờ hành chính, gọi trước khi giao"
                    value={this.state.txtOrderNote}
                    onChange={(e) => this.setState({ txtOrderNote: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="card border-0 shadow-sm rounded-4 p-4 bg-white">
              <h5 className="fw-extrabold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-credit-card-2-front-fill text-success"></i> Chọn Phương thức thanh toán
              </h5>

              <div className="d-flex flex-column gap-2.5">
                {/* Option 1: COD */}
                <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition-all ${this.state.paymentMethod === 'COD' ? 'border-success bg-success-subtle shadow-sm' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input mt-0"
                      checked={this.state.paymentMethod === 'COD'}
                      onChange={() => this.setState({ paymentMethod: 'COD' })}
                    />
                    <div>
                      <strong className="text-dark d-block small">Thanh toán khi nhận hàng (COD)</strong>
                      <span className="text-secondary small" style={{ fontSize: '12px' }}>Thanh toán tiền mặt cho shipper khi nhận và kiểm tra hàng</span>
                    </div>
                  </div>
                  <i className="bi bi-cash-stack text-success fs-4"></i>
                </label>

                {/* Option 2: VNPAY-QR / VietQR */}
                <label className={`p-3 rounded-3 border d-flex align-items-center justify-content-between cursor-pointer transition-all ${this.state.paymentMethod === 'VNPAY-QR' ? 'border-success bg-success-subtle shadow-sm' : 'bg-light'}`} style={{ cursor: 'pointer' }}>
                  <div className="d-flex align-items-center gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      className="form-check-input mt-0"
                      checked={this.state.paymentMethod === 'VNPAY-QR'}
                      onChange={() => this.setState({ paymentMethod: 'VNPAY-QR' })}
                    />
                    <div>
                      <div className="d-flex align-items-center gap-2">
                        <strong className="text-dark d-block small">Chuyển khoản QR Ngân hàng / VNPAY-QR</strong>
                        <span className="badge bg-danger text-white rounded-pill" style={{ fontSize: '10px' }}>HOT - Duyệt tức thì</span>
                      </div>
                      <span className="text-secondary small" style={{ fontSize: '12px' }}>Quét mã VietQR bằng App Banking bất kỳ (MBBank, Vietcombank, Techcombank...)</span>
                    </div>
                  </div>
                  <i className="bi bi-qr-code-scan text-primary fs-4"></i>
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Order Summary & Checkout Action */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top bg-white" style={{ top: '90px' }}>
              <h5 className="fw-extrabold text-dark mb-3">TỔNG QUAN ĐƠN HÀNG</h5>

              {/* Coupon Code Form */}
              <form onSubmit={this.handleApplyCoupon} className="mb-3">
                <label className="form-label small fw-bold text-secondary">Mã ưu đãi / Voucher</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control rounded-start-3 text-uppercase"
                    placeholder="Nhập mã (vd: VLSCNEW)"
                    value={this.state.couponCode}
                    onChange={(e) => this.setState({ couponCode: e.target.value })}
                  />
                  <button type="submit" className="btn btn-outline-success fw-bold px-3">
                    Áp dụng
                  </button>
                </div>
                {this.state.couponError && (
                  <div className="text-danger small mt-1" style={{ fontSize: '11px' }}>{this.state.couponError}</div>
                )}
                {this.state.appliedCoupon && (
                  <div className="text-success small mt-1 fw-bold" style={{ fontSize: '11px' }}>
                    <i className="bi bi-check-circle me-1"></i> Mã '{this.state.appliedCoupon}' đã được áp dụng
                  </div>
                )}
              </form>

              <hr className="my-3" />

              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Tạm tính tiền hàng:</span>
                <span className="fw-semibold text-dark">{formatVND(subtotal)}</span>
              </div>

              <div className="d-flex justify-content-between mb-2">
                <span className="text-secondary small">Phí vận chuyển toàn quốc:</span>
                {shippingFee === 0 ? (
                  <span className="fw-bold text-success">Miễn phí 0 ₫</span>
                ) : (
                  <span className="fw-semibold text-dark">{formatVND(shippingFee)}</span>
                )}
              </div>

              {this.state.discountAmount > 0 && (
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-secondary small">Giảm giá Voucher:</span>
                  <span className="fw-bold text-danger">-{formatVND(this.state.discountAmount)}</span>
                </div>
              )}

              <hr className="my-3" />

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                  <span className="fw-extrabold text-dark fs-6 d-block">TỔNG THANH TOÁN:</span>
                  <span className="text-secondary small" style={{ fontSize: '11px' }}>(Đã bao gồm thuế VAT)</span>
                </div>
                <span className="fs-3 fw-extrabold text-success">{formatVND(total)}</span>
              </div>

              <button
                type="button"
                className="btn btn-success btn-lg w-100 rounded-pill py-3 fw-extrabold shadow-sm d-flex align-items-center justify-content-center gap-2"
                onClick={this.handleCheckoutClick}
                disabled={this.state.isSubmitting}
              >
                {this.state.isSubmitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    Đang xử lý đơn hàng...
                  </>
                ) : this.state.paymentMethod === 'COD' ? (
                  <>
                    <i className="bi bi-bag-check-fill fs-5"></i> XÁC NHẬN ĐẶT HÀNG (COD)
                  </>
                ) : (
                  <>
                    <i className="bi bi-qr-code-scan fs-5"></i> ĐẶT HÀNG & THANH TOÁN QR
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Modal: Interactive QR Code Payment Gateway */}
        {this.state.showQRModal && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header bg-success text-white p-3.5">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-qr-code-scan"></i> CỔNG THANH TOÁN QR THỜI GIAN THỰC (VIETQR / VNPAY)
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => this.setState({ showQRModal: false })}></button>
                </div>
                
                <div className="modal-body p-4">
                  <div className="row g-4 align-items-center">
                    {/* Left: Dynamic VietQR Image */}
                    <div className="col-md-5 text-center border-end-md">
                      <div className="p-3 bg-white border rounded-4 shadow-sm d-inline-block position-relative">
                        <img
                          src={vietQrUrl}
                          alt="Mã QR Thanh Toán Ngân Hàng VietQR"
                          className="img-fluid rounded-3"
                          style={{ maxWidth: '240px', height: 'auto' }}
                        />
                        <div className="mt-2 small text-muted">
                          <i className="bi bi-shield-check text-success me-1"></i> Mã VietQR chuẩn NAPAS 24/7
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="badge bg-warning bg-opacity-10 text-dark border border-warning px-3 py-2 rounded-pill font-monospace fw-bold">
                          <i className="bi bi-clock-history me-1 text-warning"></i> Hết hạn sau: {this.formatCountdown(this.state.qrCountdown)}
                        </span>
                      </div>
                    </div>

                    {/* Right: Transfer Details & Instant Confirmation */}
                    <div className="col-md-7">
                      <h6 className="fw-extrabold text-dark mb-3">THÔNG TIN CHUYỂN KHOẢN CHÍNH THỨC</h6>

                      <div className="p-3 bg-light rounded-3 mb-3 small">
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Ngân hàng thụ hưởng:</span>
                          <strong className="text-dark">{bankConfig.bankName || 'MBBank (Ngân Hàng Quân Đội)'}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Số tài khoản:</span>
                          <span className="fw-extrabold text-primary font-monospace fs-6">{bankConfig.accountNo || '0388888888'}</span>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Chủ tài khoản:</span>
                          <strong className="text-dark">{bankConfig.accountName || 'CONG TY TNHH VLSC SHOP'}</strong>
                        </div>
                        <div className="d-flex justify-content-between mb-2">
                          <span className="text-secondary">Số tiền chuyển:</span>
                          <span className="fw-extrabold text-success fs-6">{formatVND(total)}</span>
                        </div>
                        <div className="d-flex justify-content-between">
                          <span className="text-secondary">Nội dung ghi chú:</span>
                          <span className="fw-extrabold text-danger font-monospace fs-6">{this.state.qrMemo}</span>
                        </div>
                      </div>

                      <div className="alert alert-info d-flex align-items-center gap-2 py-2 px-3 small rounded-3 mb-3">
                        <div className="spinner-border spinner-border-sm text-info flex-shrink-0" role="status"></div>
                        <span>Hệ thống đang tự động lắng nghe giao dịch từ ứng dụng ngân hàng của bạn...</span>
                      </div>

                      <div className="d-grid gap-2">
                        <button
                          type="button"
                          className="btn btn-success btn-lg rounded-pill fw-extrabold py-3 shadow-sm d-flex align-items-center justify-content-center gap-2"
                          onClick={() => this.submitOrderApi('Chuyển khoản VNPAY-QR (Đã chuyển khoản)', 'PENDING')}
                        >
                          <i className="bi bi-check-circle-fill fs-5"></i> XÁC NHẬN ĐÃ CHUYỂN KHOẢN (GỬI ĐƠN CHỜ DUYỆT)
                        </button>
                        <button
                          type="button"
                          className="btn btn-outline-secondary rounded-pill border-0 small text-secondary"
                          onClick={() => this.setState({ showQRModal: false })}
                        >
                          Hủy giao dịch & Chọn lại phương thức
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Mycart);
