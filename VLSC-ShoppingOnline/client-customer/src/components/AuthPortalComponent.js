import React, { Component } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';
import { SHOP_CONFIG } from '../utils/shopConfig';

class AuthPortal extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);

    // Determine initial tab from defaultTab prop or route path
    const path = props.location?.pathname || '/login';
    let initialTab = props.defaultTab || 'login';
    if (!props.defaultTab) {
      if (path.includes('signup')) initialTab = 'signup';
      else if (path.includes('active')) initialTab = 'active';
    }

    this.state = {
      activeTab: initialTab,

      // Login Form State
      loginUsername: 'sonkk',
      loginPassword: '123',
      showLoginPassword: false,
      rememberMe: true,
      loginLoading: false,

      // Signup Form State
      regUsername: '',
      regPassword: '',
      regName: '',
      regPhone: '',
      regEmail: '',
      showRegPassword: false,
      signupLoading: false,

      // Active Form State
      actID: '',
      actToken: '',
      activeLoading: false,

      // Feedback message
      feedbackMessage: '',
      feedbackType: 'info' // 'success', 'danger', 'info', 'warning'
    };
  }

  componentDidMount() {
    this.syncTabFromPath();

    // Check if there was auto-fill state from navigation or previous signup
    if (this.props.location?.state?.activationInfo) {
      const { id, token } = this.props.location.state.activationInfo;
      this.setState({
        actID: id || '',
        actToken: token || '',
        activeTab: 'active',
        feedbackMessage: 'Thông tin kích hoạt đã được tự động điền sẵn. Nhấn "Kích hoạt ngay" để hoàn tất!',
        feedbackType: 'success'
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.props.location?.pathname !== prevProps.location?.pathname) {
      this.syncTabFromPath();
    }
  }

  syncTabFromPath = () => {
    if (this.props.defaultTab) {
      if (this.state.activeTab !== this.props.defaultTab) {
        this.setState({ activeTab: this.props.defaultTab, feedbackMessage: '' });
      }
      return;
    }
    const path = this.props.location?.pathname || '/login';
    let nextTab = 'login';
    if (path.includes('signup')) nextTab = 'signup';
    else if (path.includes('active')) nextTab = 'active';

    if (nextTab !== this.state.activeTab) {
      this.setState({ activeTab: nextTab, feedbackMessage: '' });
    }
  };

  switchTab = (tab) => {
    this.setState({ activeTab: tab, feedbackMessage: '' });
    if (tab === 'login') this.props.navigate('/login');
    else if (tab === 'signup') this.props.navigate('/signup');
    else if (tab === 'active') this.props.navigate('/active');
  };

  // ==========================================
  // LOGIN FLOW
  // ==========================================
  handleLoginSubmit = (e) => {
    e.preventDefault();
    const { loginUsername, loginPassword } = this.state;

    if (!loginUsername || !loginPassword) {
      this.setState({
        feedbackMessage: 'Vui lòng nhập đầy đủ Tên đăng nhập và Mật khẩu',
        feedbackType: 'warning'
      });
      return;
    }

    this.setState({ loginLoading: true, feedbackMessage: '' });
    const payload = { username: loginUsername.trim(), password: loginPassword };

    axios.post('/api/customer/login', payload)
      .then((res) => {
        this.setState({ loginLoading: false });
        const data = res.data;
        if (data.success) {
          if (this.context) {
            this.context.setToken(data.token);
            this.context.setCustomer(data.customer);
            if (this.context.showToast) {
              this.context.showToast(`Đăng nhập thành công! Chào mừng ${data.customer.name || data.customer.username}`, 'success');
            }
          }
          this.props.navigate('/home');
        } else {
          this.setState({
            feedbackMessage: data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.',
            feedbackType: 'danger'
          });
        }
      })
      .catch((err) => {
        this.setState({
          loginLoading: false,
          feedbackMessage: 'Lỗi kết nối máy chủ: ' + (err.response?.data?.message || err.message),
          feedbackType: 'danger'
        });
      });
  };

  // ==========================================
  // SIGNUP FLOW
  // ==========================================
  handleSignupSubmit = (e) => {
    e.preventDefault();
    const { regUsername, regPassword, regName, regPhone, regEmail } = this.state;

    if (!regUsername || !regPassword || !regName || !regPhone || !regEmail) {
      this.setState({
        feedbackMessage: 'Vui lòng điền đầy đủ tất cả các trường thông tin bắt buộc.',
        feedbackType: 'warning'
      });
      return;
    }

    this.setState({ signupLoading: true, feedbackMessage: '' });
    const payload = {
      username: regUsername.trim(),
      password: regPassword,
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim()
    };

    axios.post('/api/customer/signup', payload)
      .then((res) => {
        this.setState({ signupLoading: false });
        const data = res.data;
        if (data.success) {
          const actInfo = data.activationInfo;
          this.setState({
            actID: actInfo ? actInfo.id : '',
            actToken: actInfo ? actInfo.token : '',
            activeTab: 'active',
            feedbackMessage: data.message || 'Đăng ký thành công! Mã kích hoạt đã được tự động điền bên dưới.',
            feedbackType: 'success'
          });
          this.props.navigate('/active');
          if (this.context && this.context.showToast) {
            this.context.showToast('Đăng ký thành công! Nhấn Kích hoạt để hoàn tất.', 'success');
          }
        } else {
          this.setState({
            feedbackMessage: data.message || 'Đăng ký không thành công. Vui lòng thử lại.',
            feedbackType: 'danger'
          });
        }
      })
      .catch((err) => {
        this.setState({
          signupLoading: false,
          feedbackMessage: 'Lỗi hệ thống khi đăng ký: ' + (err.response?.data?.message || err.message),
          feedbackType: 'danger'
        });
      });
  };

  // ==========================================
  // ACTIVE FLOW
  // ==========================================
  handleActiveSubmit = (e) => {
    e.preventDefault();
    const { actID, actToken } = this.state;

    if (!actID || !actToken) {
      this.setState({
        feedbackMessage: 'Vui lòng nhập đầy đủ Account ID và Mã Token kích hoạt.',
        feedbackType: 'warning'
      });
      return;
    }

    this.setState({ activeLoading: true, feedbackMessage: '' });
    const payload = { id: actID.trim(), token: actToken.trim() };

    axios.post('/api/customer/active', payload)
      .then((res) => {
        this.setState({ activeLoading: false });
        const data = res.data;
        if (data.success) {
          this.setState({
            activeTab: 'login',
            loginUsername: data.customer ? data.customer.username : this.state.regUsername,
            feedbackMessage: 'Kích hoạt tài khoản thành công! Bạn có thể đăng nhập ngay bây giờ.',
            feedbackType: 'success'
          });
          this.props.navigate('/login');
          if (this.context && this.context.showToast) {
            this.context.showToast('Tài khoản đã được kích hoạt thành công!', 'success');
          }
        } else {
          this.setState({
            feedbackMessage: data.message || 'Mã kích hoạt hoặc ID không chính xác.',
            feedbackType: 'danger'
          });
        }
      })
      .catch((err) => {
        this.setState({
          activeLoading: false,
          feedbackMessage: 'Lỗi kích hoạt: ' + (err.response?.data?.message || err.message),
          feedbackType: 'danger'
        });
      });
  };

  render() {
    const { activeTab, feedbackMessage, feedbackType } = this.state;

    return (
      <div className="auth-portal-wrapper">
        <div className="auth-portal-grid">
          
          {/* =========================================================
              LEFT COLUMN: BRANDING, VALUE PROPOSITIONS & PERKS
             ========================================================= */}
          <div className="auth-portal-brand-col">
            <div className="auth-brand-content">
              
              {/* Brand Top Header */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <div className="auth-brand-logo-icon">
                  <i className="bi bi-shop fs-3"></i>
                </div>
                <div>
                  <h1 className="auth-brand-logo-text mb-0">{SHOP_CONFIG.brandName}</h1>
                  <span className="auth-brand-subbadge">Hệ Thống Phân Phối Công Nghệ</span>
                </div>
              </div>

              {/* Headline */}
              <div className="auth-hero-headline mb-4">
                <h2>Trải nghiệm mua sắm thiết bị chính hãng đỉnh cao</h2>
                <p>
                  Đăng nhập để theo dõi lịch sử đơn hàng, tích lũy điểm thưởng thành viên và nhận ngay ưu đãi độc quyền tới 50%.
                </p>
              </div>

              {/* VIP Perks List */}
              <div className="auth-perks-list mb-4">
                <div className="auth-perk-item">
                  <div className="auth-perk-icon bg-emerald-glow">
                    <i className="bi bi-shield-check text-success"></i>
                  </div>
                  <div>
                    <strong>100% Chính Hãng Chuẩn Apple & Quốc Tế</strong>
                    <p>Sản phẩm nguyên seal nguyên hộp, đầy đủ hóa đơn VAT và bảo hành chính hãng.</p>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon bg-blue-glow">
                    <i className="bi bi-arrow-repeat text-info"></i>
                  </div>
                  <div>
                    <strong>Đổi mới 1:1 trong 30 ngày</strong>
                    <p>Chính sách bảo hành vượt trội, đổi ngay máy mới nếu phát sinh lỗi phần cứng.</p>
                  </div>
                </div>

                <div className="auth-perk-item">
                  <div className="auth-perk-icon bg-gold-glow">
                    <i className="bi bi-gift-fill text-warning"></i>
                  </div>
                  <div>
                    <strong>Đặc quyền Khách hàng Thân thiết (VIP Club)</strong>
                    <p>Tích lũy hoàn tiền tới 5% mỗi hóa đơn, voucher sinh nhật và giao hàng hỏa tốc 2H.</p>
                  </div>
                </div>
              </div>

              {/* Social Proof & Trust Badges */}
              <div className="auth-trust-box">
                <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <div className="text-warning fs-5">
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                      <i className="bi bi-star-fill"></i>
                    </div>
                    <span className="fw-extrabold text-white">4.9/5.0</span>
                  </div>
                  <span className="badge bg-white bg-opacity-15 text-white px-3 py-1.5 rounded-pill border border-white border-opacity-25 small">
                    <i className="bi bi-people-fill me-1"></i> 100.000+ Khách hàng tin dùng
                  </span>
                </div>
              </div>

            </div>
          </div>

          {/* =========================================================
              RIGHT COLUMN: AUTH WORKSPACE & INTERACTIVE FORMS
             ========================================================= */}
          <div className="auth-portal-form-col">
            <div className="auth-form-card-wrapper">

              {/* Top Bar: Back to Shop & Security Indicator */}
              <div className="auth-form-topbar d-flex align-items-center justify-content-between mb-4">
                <Link to="/home" className="btn-back-to-shop">
                  <i className="bi bi-arrow-left"></i>
                  <span>Quay lại cửa hàng</span>
                </Link>

                <div className="auth-security-pill">
                  <i className="bi bi-lock-fill text-success"></i>
                  <span>SSL 256-Bit Encrypted</span>
                </div>
              </div>

              {/* Auth Tab Switcher */}
              <div className="auth-nav-tabs-wrapper mb-4">
                <button
                  type="button"
                  className={`auth-nav-tab ${activeTab === 'login' ? 'active' : ''}`}
                  onClick={() => this.switchTab('login')}
                >
                  <i className="bi bi-box-arrow-in-right me-1.5"></i> Đăng nhập
                </button>
                <button
                  type="button"
                  className={`auth-nav-tab ${activeTab === 'signup' ? 'active' : ''}`}
                  onClick={() => this.switchTab('signup')}
                >
                  <i className="bi bi-person-plus me-1.5"></i> Đăng ký
                </button>
                <button
                  type="button"
                  className={`auth-nav-tab ${activeTab === 'active' ? 'active' : ''}`}
                  onClick={() => this.switchTab('active')}
                >
                  <i className="bi bi-shield-check me-1.5"></i> Kích hoạt
                </button>
              </div>

              {/* Feedback Alert if present */}
              {feedbackMessage && (
                <div className={`alert alert-${feedbackType} d-flex align-items-center gap-2.5 rounded-3 py-2.5 px-3 mb-4 shadow-sm animate-fade-in`}>
                  <i className={`bi ${feedbackType === 'success' ? 'bi-check-circle-fill' : feedbackType === 'warning' ? 'bi-exclamation-triangle-fill' : feedbackType === 'danger' ? 'bi-x-circle-fill' : 'bi-info-circle-fill'} fs-5`}></i>
                  <div className="small fw-semibold flex-grow-1">{feedbackMessage}</div>
                  <button type="button" className="btn-close ms-auto" onClick={() => this.setState({ feedbackMessage: '' })}></button>
                </div>
              )}

              {/* ===================================================
                  TAB 1: CUSTOMER LOGIN FORM
                 =================================================== */}
              {activeTab === 'login' && (
                <div className="auth-pane animate-fade-in">
                  <div className="auth-pane-header mb-4">
                    <h3 className="auth-pane-title">Chào mừng bạn trở lại</h3>
                    <p className="auth-pane-subtitle">Nhập thông tin tài khoản của bạn để tiếp tục mua sắm</p>
                  </div>

                  <form onSubmit={this.handleLoginSubmit}>
                    <div className="form-group-floating mb-3">
                      <label className="auth-label">Tên đăng nhập (Username)</label>
                      <div className="input-group-auth">
                        <span className="input-icon-left"><i className="bi bi-person"></i></span>
                        <input
                          type="text"
                          className="form-control auth-input"
                          placeholder="Nhập tên đăng nhập"
                          value={this.state.loginUsername}
                          onChange={(e) => this.setState({ loginUsername: e.target.value })}
                          required
                          autoComplete="username"
                        />
                      </div>
                    </div>

                    <div className="form-group-floating mb-3">
                      <div className="d-flex align-items-center justify-content-between mb-1">
                        <label className="auth-label mb-0">Mật khẩu</label>
                        <span className="small text-muted" style={{ fontSize: '0.8rem' }}>Mặc định: 123</span>
                      </div>
                      <div className="input-group-auth">
                        <span className="input-icon-left"><i className="bi bi-key"></i></span>
                        <input
                          type={this.state.showLoginPassword ? 'text' : 'password'}
                          className="form-control auth-input pe-5"
                          placeholder="Nhập mật khẩu"
                          value={this.state.loginPassword}
                          onChange={(e) => this.setState({ loginPassword: e.target.value })}
                          required
                          autoComplete="current-password"
                        />
                        <button
                          type="button"
                          className="input-btn-toggle-password"
                          onClick={() => this.setState({ showLoginPassword: !this.state.showLoginPassword })}
                          title="Ẩn/Hiện mật khẩu"
                        >
                          <i className={`bi ${this.state.showLoginPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                        </button>
                      </div>
                    </div>

                    <div className="d-flex align-items-center justify-content-between mb-4">
                      <label className="form-check d-flex align-items-center gap-2 cursor-pointer mb-0">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={this.state.rememberMe}
                          onChange={(e) => this.setState({ rememberMe: e.target.checked })}
                        />
                        <span className="small text-secondary fw-semibold">Ghi nhớ đăng nhập</span>
                      </label>

                      <button
                        type="button"
                        className="btn btn-link text-success fw-bold p-0 text-decoration-none small"
                        onClick={() => this.switchTab('active')}
                      >
                        Kích hoạt tài khoản?
                      </button>
                    </div>

                    <button
                      type="submit"
                      className="btn-auth-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                      disabled={this.state.loginLoading}
                    >
                      {this.state.loginLoading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang xác thực...</span>
                      ) : (
                        <span><i className="bi bi-box-arrow-in-right me-2"></i> ĐĂNG NHẬP NGAY</span>
                      )}
                    </button>

                    <div className="auth-form-footer text-center mt-4 pt-2 border-top">
                      <span className="text-muted small">Chưa có tài khoản thành viên? </span>
                      <button
                        type="button"
                        className="btn btn-link text-success fw-extrabold text-decoration-none small p-0 ms-1"
                        onClick={() => this.switchTab('signup')}
                      >
                        Đăng ký tài khoản mới →
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ===================================================
                  TAB 2: CUSTOMER SIGNUP FORM
                 =================================================== */}
              {activeTab === 'signup' && (
                <div className="auth-pane animate-fade-in">
                  <div className="auth-pane-header mb-4">
                    <h3 className="auth-pane-title">Tạo tài khoản thành viên mới</h3>
                    <p className="auth-pane-subtitle">Đăng ký chỉ mất 30 giây để bắt đầu nhận ưu đãi độc quyền</p>
                  </div>

                  <form onSubmit={this.handleSignupSubmit}>
                    <div className="row g-3 mb-3">
                      <div className="col-12 col-md-6">
                        <label className="auth-label">Tên đăng nhập *</label>
                        <div className="input-group-auth">
                          <span className="input-icon-left"><i className="bi bi-person"></i></span>
                          <input
                            type="text"
                            className="form-control auth-input"
                            placeholder="vd: nguyenvana"
                            value={this.state.regUsername}
                            onChange={(e) => this.setState({ regUsername: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="auth-label">Mật khẩu *</label>
                        <div className="input-group-auth">
                          <span className="input-icon-left"><i className="bi bi-lock"></i></span>
                          <input
                            type={this.state.showRegPassword ? 'text' : 'password'}
                            className="form-control auth-input pe-5"
                            placeholder="Mật khẩu an toàn"
                            value={this.state.regPassword}
                            onChange={(e) => this.setState({ regPassword: e.target.value })}
                            required
                          />
                          <button
                            type="button"
                            className="input-btn-toggle-password"
                            onClick={() => this.setState({ showRegPassword: !this.state.showRegPassword })}
                            title="Ẩn/Hiện mật khẩu"
                          >
                            <i className={`bi ${this.state.showRegPassword ? 'bi-eye-slash-fill' : 'bi-eye-fill'}`}></i>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="form-group-floating mb-3">
                      <label className="auth-label">Họ và tên của bạn *</label>
                      <div className="input-group-auth">
                        <span className="input-icon-left"><i className="bi bi-card-heading"></i></span>
                        <input
                          type="text"
                          className="form-control auth-input"
                          placeholder="vd: Nguyễn Văn A"
                          value={this.state.regName}
                          onChange={(e) => this.setState({ regName: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="row g-3 mb-4">
                      <div className="col-12 col-md-6">
                        <label className="auth-label">Số điện thoại *</label>
                        <div className="input-group-auth">
                          <span className="input-icon-left"><i className="bi bi-telephone"></i></span>
                          <input
                            type="tel"
                            className="form-control auth-input"
                            placeholder="0912345678"
                            value={this.state.regPhone}
                            onChange={(e) => this.setState({ regPhone: e.target.value })}
                            required
                          />
                        </div>
                      </div>

                      <div className="col-12 col-md-6">
                        <label className="auth-label">Địa chỉ Email *</label>
                        <div className="input-group-auth">
                          <span className="input-icon-left"><i className="bi bi-envelope"></i></span>
                          <input
                            type="email"
                            className="form-control auth-input"
                            placeholder="email@example.com"
                            value={this.state.regEmail}
                            onChange={(e) => this.setState({ regEmail: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="auth-terms-note mb-4 p-2.5 rounded-3 bg-light border text-muted small">
                      <i className="bi bi-shield-check text-success me-1"></i> Bằng việc đăng ký, bạn đồng ý với <span className="text-dark fw-bold">Điều khoản bảo mật</span> & <span className="text-dark fw-bold">Chính sách khách hàng</span> của VLSC.
                    </div>

                    <button
                      type="submit"
                      className="btn-auth-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                      disabled={this.state.signupLoading}
                    >
                      {this.state.signupLoading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang tạo tài khoản...</span>
                      ) : (
                        <span><i className="bi bi-person-check-fill me-2"></i> HOÀN TẤT ĐĂNG KÝ</span>
                      )}
                    </button>

                    <div className="auth-form-footer text-center mt-4 pt-2 border-top">
                      <span className="text-muted small">Đã có tài khoản VLSC? </span>
                      <button
                        type="button"
                        className="btn btn-link text-success fw-extrabold text-decoration-none small p-0 ms-1"
                        onClick={() => this.switchTab('login')}
                      >
                        Đăng nhập ngay →
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* ===================================================
                  TAB 3: CUSTOMER ACCOUNT ACTIVATION FORM
                 =================================================== */}
              {activeTab === 'active' && (
                <div className="auth-pane animate-fade-in">
                  <div className="auth-pane-header mb-4">
                    <h3 className="auth-pane-title">Kích hoạt tài khoản thành viên</h3>
                    <p className="auth-pane-subtitle">
                      Nhập Account ID & Mã Token kích hoạt (hệ thống tự động điền khi vừa đăng ký)
                    </p>
                  </div>

                  <form onSubmit={this.handleActiveSubmit}>
                    <div className="form-group-floating mb-3">
                      <label className="auth-label">Mã ID Tài khoản (Account ID) *</label>
                      <div className="input-group-auth">
                        <span className="input-icon-left"><i className="bi bi-key-fill"></i></span>
                        <input
                          type="text"
                          className="form-control auth-input font-monospace"
                          placeholder="vd: 662d8c7928b9401a..."
                          value={this.state.actID}
                          onChange={(e) => this.setState({ actID: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group-floating mb-4">
                      <label className="auth-label">Mã Token Xác thực (Verification Token) *</label>
                      <div className="input-group-auth">
                        <span className="input-icon-left"><i className="bi bi-shield-lock-fill"></i></span>
                        <input
                          type="text"
                          className="form-control auth-input font-monospace"
                          placeholder="vd: 8f81b312781b..."
                          value={this.state.actToken}
                          onChange={(e) => this.setState({ actToken: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="p-3 rounded-3 bg-success-subtle border border-success-subtle mb-4">
                      <div className="d-flex align-items-center gap-2 text-success fw-bold small mb-1">
                        <i className="bi bi-lightning-charge-fill"></i> Kích hoạt nhanh 1-Click
                      </div>
                      <p className="text-secondary small mb-0" style={{ fontSize: '0.84rem' }}>
                        Nếu bạn vừa đăng ký tài khoản thành công ở tab trước, toàn bộ mã xác thực đã được nạp tự động. Bạn chỉ cần nhấn nút bên dưới.
                      </p>
                    </div>

                    <button
                      type="submit"
                      className="btn-auth-primary w-100 py-3 rounded-pill fw-bold text-white shadow-sm"
                      disabled={this.state.activeLoading}
                    >
                      {this.state.activeLoading ? (
                        <span><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang kích hoạt...</span>
                      ) : (
                        <span><i className="bi bi-check2-circle me-2"></i> KÍCH HOẠT TÀI KHOẢN NGAY</span>
                      )}
                    </button>

                    <div className="auth-form-footer text-center mt-4 pt-2 border-top">
                      <span className="text-muted small">Đã kích hoạt trước đó? </span>
                      <button
                        type="button"
                        className="btn btn-link text-success fw-extrabold text-decoration-none small p-0 ms-1"
                        onClick={() => this.switchTab('login')}
                      >
                        Quay lại Đăng nhập →
                      </button>
                    </div>
                  </form>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    );
  }
}

export default withRouter(AuthPortal);
