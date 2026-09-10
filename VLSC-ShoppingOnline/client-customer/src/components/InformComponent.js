import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import { SHOP_CONFIG } from '../utils/shopConfig';

class Inform extends Component {
  static contextType = MyContext;

  render() {
    const isLoggedIn = !!this.context.token;
    const customer = this.context.customer;
    const cartCount = this.context.mycart ? this.context.mycart.reduce((sum, item) => sum + item.quantity, 0) : 0;

    return (
      <div className="top-inform-bar">
        <div className="container d-flex flex-wrap justify-content-between align-items-center gap-2 py-1">
          {/* Left: Promotion Announcement */}
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success text-white fw-bold px-2 py-1 rounded-pill">
              <i className="bi bi-stars me-1"></i> Ưu đãi đặc quyền
            </span>
            <span className="text-secondary fw-semibold small d-none d-sm-inline">
              Miễn phí vận chuyển toàn quốc cho đơn hàng từ 500.000 ₫!
            </span>
          </div>

          {/* Right: Support, Contact & Dynamic Auth State */}
          <div className="d-flex align-items-center gap-3 small">
            <span className="text-secondary d-none d-md-inline-flex align-items-center gap-1">
              <i className="bi bi-telephone-fill text-success me-1"></i> Hotline: <b className="text-dark ms-1">{SHOP_CONFIG.hotline}</b>
            </span>

            <span className="text-muted d-none d-md-inline">•</span>

            <Link to='/mycart' className="text-secondary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1.5">
              <i className="bi bi-cart-fill text-success me-1"></i>
              <span>Giỏ hàng:</span>
              <b className="text-dark ms-1">{cartCount}</b> món
            </Link>

            <span className="text-muted">•</span>

            {isLoggedIn ? (
              <>
                <Link to='/myorders' className="text-secondary text-decoration-none fw-semibold d-inline-flex align-items-center gap-1">
                  <i className="bi bi-receipt-cutoff text-success me-1"></i> Đơn hàng
                </Link>
                <span className="text-muted">•</span>
                <Link to="/myprofile" className="text-dark fw-bold text-decoration-none d-inline-flex align-items-center gap-2 bg-success-subtle px-3 py-1 rounded-pill border border-success-subtle">
                  <i className="bi bi-person-check-fill text-success"></i>
                  <span>Xin chào, <span className="text-success">{customer ? customer.name : 'Quý khách'}</span></span>
                  <span className="badge bg-warning text-dark fw-extrabold" style={{ fontSize: '10px' }}>VIP</span>
                </Link>
              </>
            ) : (
              <Link to='/active' className="text-secondary fw-semibold text-decoration-none d-inline-flex align-items-center gap-1">
                <i className="bi bi-shield-check text-success me-1"></i> Kích hoạt tài khoản
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  // event-handlers
  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setCustomer(null);
    this.context.setMycart([]);
  }
}

export default Inform;
