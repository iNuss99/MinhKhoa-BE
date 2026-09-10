import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';
import Order from './OrderComponent';
import Customer from './CustomerComponent';
import UserManagement from './UserManagementComponent';
import AuditLogComponent from './AuditLogComponent';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';

class Main extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      globalSearch: '',
      showNotifications: false,
      sidebarOpen: false,
      showPaymentConfigModal: false,
      bankName: 'MBBank (Ngân Hàng Quân Đội)',
      bankCode: 'MB',
      accountNo: '0931143830',
      accountName: 'DO MINH KHOA',
      customQrUrl: '',
      configLoading: false,
      notifications: [
        { id: 1, title: 'Đơn hàng mới #1048', desc: 'Khách hàng sonkk đã thanh toán 14.500.000₫ qua VietQR', time: '5 phút trước', read: false, type: 'order' },
        { id: 2, title: 'Cảnh báo sắp hết hàng', desc: 'Sản phẩm MacBook Pro M3 chỉ còn 2 chiếc trong kho', time: '18 phút trước', read: false, type: 'stock' },
        { id: 3, title: 'Bảo mật hệ thống', desc: 'Phiên đăng nhập phân quyền RBAC thành công', time: '1 giờ trước', read: true, type: 'security' }
      ]
    };
  }

  componentDidMount() {
    this.fetchPaymentConfig();
  }

  fetchPaymentConfig = () => {
    if (!this.context || !this.context.token) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/payment-config', config)
      .then(res => {
        if (res.data && res.data.success && res.data.config) {
          const c = res.data.config;
          this.setState({
            bankName: c.bankName || 'MBBank (Ngân Hàng Quân Đội)',
            bankCode: c.bankCode || 'MB',
            accountNo: c.accountNo || '0931143830',
            accountName: c.accountName || 'DO MINH KHOA',
            customQrUrl: c.customQrUrl || ''
          });
        }
      })
      .catch(() => {});
  };

  handleBankSelectChange = (e) => {
    const code = e.target.value;
    const bankMap = {
      'MB': 'MBBank (Military Commercial Bank)',
      'VCB': 'Vietcombank (Foreign Trade Bank)',
      'TCB': 'Techcombank (Technological & Commercial Bank)',
      'ICB': 'VietinBank (Industrial & Commercial Bank)',
      'BIDV': 'BIDV (Bank for Investment & Development)',
      'ACB': 'ACB (Asia Commercial Bank)',
      'VPB': 'VPBank (Vietnam Prosperity Bank)',
      'TPB': 'TPBank (Tien Phong Bank)',
      'STB': 'Sacombank (Saigon Thương Tín)',
      'VIB': 'VIB (International Bank)',
      'MSB': 'MSB (Maritime Bank)'
    };

    if (bankMap[code]) {
      this.setState({
        bankCode: code,
        bankName: bankMap[code]
      });
    } else {
      this.setState({ bankCode: code });
    }
  };

  handleSavePaymentConfig = (e) => {
    e.preventDefault();
    this.setState({ configLoading: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    const payload = {
      bankName: this.state.bankName,
      bankCode: this.state.bankCode,
      accountNo: this.state.accountNo,
      accountName: this.state.accountName,
      customQrUrl: this.state.customQrUrl
    };

    axios.put('/api/admin/payment-config', payload, config)
      .then(res => {
        this.setState({ configLoading: false, showPaymentConfigModal: false });
        if (res.data && res.data.success) {
          if (this.context && this.context.toastMessage) {
            this.context.toastMessage('Store Payment QR Configuration updated successfully!', 'success');
          }
        }
      })
      .catch(() => {
        axios.put('/api/customer/payment-config', payload, config)
          .then(res => {
            this.setState({ configLoading: false, showPaymentConfigModal: false });
            if (res.data && res.data.success) {
              if (this.context && this.context.toastMessage) {
                this.context.toastMessage('Store Payment QR Configuration updated successfully!', 'success');
              }
            }
          })
          .catch(err => {
            console.error('[Payment Config Save Error]:', err);
            this.setState({ configLoading: false });
            if (this.context && this.context.toastMessage) {
              this.context.toastMessage('Please restart Node server in Terminal to load new APIs.', 'warning');
            }
          });
      });
  };

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }

  markAllNotificationsRead = () => {
    this.setState({
      notifications: this.state.notifications.map(n => ({ ...n, read: true }))
    });
    if (this.context && this.context.toastMessage) {
      this.context.toastMessage('Đã đánh dấu tất cả thông báo hệ thống là đã đọc', 'info');
    }
  };

  render() {
    if (this.context.token !== '') {
      const unreadCount = this.state.notifications.filter(n => !n.read).length;

      // Live Preview VietQR URL generated automatically
      const liveQrPreviewUrl = this.state.customQrUrl || `https://img.vietqr.io/image/${this.state.bankCode || 'MB'}-${this.state.accountNo || '0931143830'}-compact2.png?amount=100000&addInfo=VLSC%20DEMO&accountName=${encodeURIComponent(this.state.accountName || 'DO MINH KHOA')}`;

      return (
        <div className={`admin-layout ${this.state.sidebarOpen ? 'sidebar-mobile-open' : ''}`}>
          <Menu />
          
          <div className="admin-main-wrapper">
            <header className="admin-header">
              {/* Left Header: Mobile Toggle & Global Search */}
              <div className="d-flex align-items-center gap-3 flex-grow-1" style={{ maxWidth: '480px' }}>
                <button
                  className="btn btn-light d-lg-none rounded-circle p-2 border"
                  onClick={() => this.setState({ sidebarOpen: !this.state.sidebarOpen })}
                  aria-label="Đóng/Mở menu"
                >
                  <i className="bi bi-list fs-5"></i>
                </button>

                <div className="admin-global-search position-relative w-100">
                  <i className="bi bi-search position-absolute top-50 start-0 translate-middle-y ms-3 text-muted"></i>
                  <input
                    type="search"
                    className="form-control rounded-pill ps-5 pe-3 bg-light border"
                    placeholder="Tìm nhanh đơn hàng, sản phẩm, mã SKU..."
                    value={this.state.globalSearch}
                    onChange={(e) => this.setState({ globalSearch: e.target.value })}
                  />
                </div>
              </div>

              {/* Right Header: Notification Center & Consolidated User Profile Dropdown */}
              <div className="d-flex align-items-center gap-3">
                {/* Notification Center Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-light position-relative p-0 rounded-circle border shadow-xs d-flex align-items-center justify-content-center cursor-pointer transition-all"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    title="Trung tâm thông báo"
                    style={{ width: '40px', height: '40px', background: '#ffffff', borderColor: '#e2e8f0' }}
                  >
                    <i className="bi bi-bell-fill fs-5 text-secondary"></i>
                    {unreadCount > 0 && (
                      <span
                        className="position-absolute badge rounded-pill bg-danger border border-white"
                        style={{
                          top: '-4px',
                          right: '-4px',
                          fontSize: '0.68rem',
                          padding: '3px 6px',
                          fontWeight: '800'
                        }}
                      >
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  <div className="dropdown-menu dropdown-menu-end shadow-lg border rounded-4 p-0 mt-2" style={{ width: '360px', borderColor: '#e2e8f0' }}>
                    <div className="d-flex align-items-center justify-content-between p-3 border-bottom bg-light rounded-top-4">
                      <div className="d-flex align-items-center gap-2">
                        <span className="p-1.5 bg-success text-white rounded-2 d-inline-flex align-items-center justify-content-center shadow-xs" style={{ width: '26px', height: '26px', fontSize: '13px' }}>
                          <i className="bi bi-bell-fill"></i>
                        </span>
                        <strong className="text-dark small fw-bold">Thông báo hệ thống</strong>
                        {unreadCount > 0 && (
                          <span className="badge bg-danger rounded-pill fw-bold" style={{ fontSize: '0.65rem' }}>
                            {unreadCount} mới
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          className="btn btn-link btn-sm p-0 text-success fw-bold text-decoration-none"
                          onClick={this.markAllNotificationsRead}
                          style={{ fontSize: '0.78rem' }}
                        >
                          Đánh dấu đã đọc
                        </button>
                      )}
                    </div>

                    <div className="notification-list p-2" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                      {this.state.notifications.map((item) => (
                        <div
                          key={item.id}
                          className={`p-3 rounded-3 mb-1.5 transition-all d-flex align-items-start gap-2.5 ${
                            item.read ? 'bg-white' : 'bg-success-subtle bg-opacity-40 border-start border-success border-3'
                          }`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div
                            className={`rounded-3 d-flex align-items-center justify-content-center flex-shrink-0 shadow-xs ${
                              item.type === 'order'
                                ? 'bg-success text-white'
                                : item.type === 'stock'
                                ? 'bg-warning text-dark'
                                : 'bg-primary text-white'
                            }`}
                            style={{ width: '34px', height: '34px', fontSize: '15px' }}
                          >
                            <i className={`bi ${item.type === 'order' ? 'bi-cart-check-fill' : item.type === 'stock' ? 'bi-exclamation-triangle-fill' : 'bi-shield-lock-fill'}`}></i>
                          </div>

                          <div className="flex-grow-1 overflow-hidden">
                            <div className="d-flex align-items-center justify-content-between gap-1">
                              <strong className="text-dark small fw-bold text-truncate" style={{ fontSize: '0.86rem' }}>
                                {item.title}
                              </strong>
                              <small className="text-muted flex-shrink-0" style={{ fontSize: '0.72rem' }}>
                                {item.time}
                              </small>
                            </div>
                            <p className="text-secondary small mb-0 mt-1" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* User Profile Dropdown Menu */}
                <div className="dropdown">
                  <button
                    className="btn bg-white border rounded-pill px-3 py-1.5 d-flex align-items-center gap-2.5 shadow-xs cursor-pointer transition-all"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ borderColor: '#e2e8f0' }}
                  >
                    <div className="position-relative">
                      <div
                        className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-xs flex-shrink-0"
                        style={{
                          width: '34px',
                          height: '34px',
                          background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          fontSize: '0.9rem'
                        }}
                      >
                        {(this.context.username || 'A').charAt(0).toUpperCase()}
                      </div>
                      <span
                        className="position-absolute bg-success border border-white rounded-circle"
                        style={{ width: '9px', height: '9px', bottom: '0px', right: '0px' }}
                      ></span>
                    </div>

                    <div className="text-start d-none d-sm-block ps-1 pe-1">
                      <div className="fw-extrabold text-dark small" style={{ lineHeight: '1.2', fontSize: '0.85rem' }}>{this.context.username || 'Admin'}</div>
                      <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill fw-bold text-uppercase" style={{ fontSize: '0.62rem' }}>
                        {this.context.role || 'Admin'}
                      </span>
                    </div>
                    <i className="bi bi-chevron-down text-muted small ms-0.5"></i>
                  </button>

                  <div className="dropdown-menu dropdown-menu-end shadow-lg border rounded-4 p-3 mt-2" style={{ width: '310px', borderColor: '#e2e8f0' }}>
                    {/* User Summary Header */}
                    <div className="d-flex align-items-center gap-3 pb-3 border-bottom mb-3">
                      <div className="position-relative">
                        <div
                          className="text-white rounded-circle d-flex align-items-center justify-content-center fw-bold fs-5 shadow-xs flex-shrink-0"
                          style={{
                            width: '44px',
                            height: '44px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                          }}
                        >
                          {(this.context.username || 'A').charAt(0).toUpperCase()}
                        </div>
                        <span
                          className="position-absolute bg-success border border-white rounded-circle"
                          style={{ width: '11px', height: '11px', bottom: '1px', right: '1px' }}
                          title="Đang hoạt động"
                        ></span>
                      </div>

                      <div className="overflow-hidden flex-grow-1">
                        <div className="fw-extrabold text-dark text-truncate fs-6" title={this.context.username}>{this.context.username || 'Admin'}</div>
                        <div className="d-flex align-items-center gap-1.5 mt-0.5">
                          <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-0.5 rounded-pill fw-bold text-uppercase d-inline-flex align-items-center gap-1" style={{ fontSize: '0.68rem' }}>
                            <i className="bi bi-shield-check"></i> ROLE: {this.context.role || 'Admin'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Role Switcher Select */}
                    <div className="mb-3">
                      <label className="form-label text-secondary fw-bold small mb-1.5 d-flex align-items-center" style={{ fontSize: '0.78rem' }}>
                        <i className="bi bi-shield-lock-fill text-success fs-6 me-2"></i>
                        <span>Đổi vai trò RBAC (Test)</span>
                      </label>
                      <select
                        className="form-select form-select-sm rounded-3 fw-bold text-dark bg-light border py-2 ps-3 pe-4 shadow-xs"
                        style={{ fontSize: '0.82rem', borderColor: '#e2e8f0' }}
                        value={(this.context.role || 'admin').toLowerCase()}
                        onChange={(e) => {
                          const selectedRole = e.target.value;
                          this.context.setRole(selectedRole);
                          if (this.context.toastMessage) {
                            this.context.toastMessage(`Đã chuyển đổi vai trò thành: ${selectedRole.toUpperCase()}`, 'info');
                          }
                        }}
                      >
                        <option value="admin">👑 ADMIN (Quản trị)</option>
                        <option value="ceo">👔 CEO (Ban giám đốc)</option>
                        <option value="manager">💼 MANAGER (Quản lý)</option>
                        <option value="staff">🛍️ STAFF (Nhân viên)</option>
                        <option value="warehouse">📦 WAREHOUSE (Kho)</option>
                        <option value="auditor">🔍 AUDITOR (Kiểm toán)</option>
                      </select>
                    </div>

                    {/* QR Payment Config Trigger */}
                    {['admin', 'ceo'].includes((this.context.role || 'admin').toLowerCase()) && (
                      <button
                        className="btn btn-light w-100 text-start d-flex align-items-center justify-content-between p-2.5 rounded-3 mb-2 border shadow-xs transition-all"
                        style={{ fontSize: '0.82rem', backgroundColor: '#f8fafc', borderColor: '#e2e8f0' }}
                        onClick={() => {
                          this.fetchPaymentConfig();
                          this.setState({ showPaymentConfigModal: true });
                        }}
                      >
                        <div className="d-flex align-items-center gap-2">
                          <span className="p-1.5 bg-success-subtle text-success rounded-2 d-inline-flex align-items-center justify-content-center" style={{ width: '26px', height: '26px' }}>
                            <i className="bi bi-qr-code-scan"></i>
                          </span>
                          <span className="fw-bold text-dark">Cấu hình QR Thanh toán</span>
                        </div>
                        <i className="bi bi-chevron-right text-muted small"></i>
                      </button>
                    )}

                    <hr className="dropdown-divider my-2 opacity-50" />

                    {/* Logout Link */}
                    <Link
                      to='/admin/home'
                      className="btn btn-light text-danger bg-danger-subtle border-0 btn-sm rounded-3 w-100 py-2.5 fw-bold d-flex align-items-center justify-content-center gap-2 text-decoration-none transition-all shadow-xs"
                      style={{ fontSize: '0.82rem' }}
                      onClick={() => this.lnkLogoutClick()}
                    >
                      <i className="bi bi-box-arrow-right fs-6"></i> Đăng xuất hệ thống
                    </Link>
                  </div>
                </div>
              </div>
            </header>

            <main className="admin-content">
              <Routes>
                <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
                <Route path='/admin/home' element={<Home globalSearch={this.state.globalSearch} />} />
                <Route path='/admin/category' element={<Category />} />
                <Route path='/admin/product' element={<Product />} />
                <Route path='/admin/order' element={<Order />} />
                <Route path='/admin/customer' element={<Customer />} />
                <Route path='/admin/users' element={<UserManagement />} />
                <Route path='/admin/audit-logs' element={<AuditLogComponent />} />
              </Routes>
            </main>
          </div>

          {/* Modal: Store Payment & Dynamic QR Code Config */}
          {this.state.showPaymentConfigModal && (
            <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.65)', zIndex: 1060 }}>
              <div className="modal-dialog modal-dialog-centered modal-lg">
                <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                  <div className="modal-header bg-success text-white p-3.5">
                    <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                      <i className="bi bi-qr-code-scan"></i> CẤU HÌNH TÀI KHOẢN NGÂN HÀNG & MÃ QR THANH TOÁN VIETQR
                    </h5>
                    <button type="button" className="btn-close btn-close-white" onClick={() => this.setState({ showPaymentConfigModal: false })}></button>
                  </div>
                  
                  <form onSubmit={this.handleSavePaymentConfig}>
                    <div className="modal-body p-4">
                      <div className="alert alert-success d-flex align-items-center gap-2 rounded-3 py-2 px-3 small mb-4 border border-success border-opacity-25">
                        <i className="bi bi-lightning-charge-fill fs-4 text-success flex-shrink-0"></i>
                        <span>
                          <strong>MÃ QR DỰA TRÊN SỐ TIỀN THỰC TẾ:</strong> Chọn ngân hàng, nhập số tài khoản và tên chủ tài khoản. Hệ thống sẽ **TỰ ĐỘNG TẠO MÃ VIETQR DỘNG** khớp chính xác với tổng số tiền từng đơn hàng!
                        </span>
                      </div>

                      <div className="row g-4">
                        {/* Left: Input Form */}
                        <div className="col-md-7">
                          <div className="row g-3">
                            <div className="col-12">
                              <label className="form-label small fw-bold text-secondary">Chọn ngân hàng thụ hưởng *</label>
                              <select
                                className="form-select rounded-3 fw-semibold"
                                value={this.state.bankCode}
                                onChange={this.handleBankSelectChange}
                              >
                                <option value="MB">MBBank - Ngân Hàng Quân Đội</option>
                                <option value="VCB">Vietcombank - Ngoại Thương Việt Nam</option>
                                <option value="TCB">Techcombank - Kỹ Thương Việt Nam</option>
                                <option value="ICB">VietinBank - Công Thương Việt Nam</option>
                                <option value="BIDV">BIDV - Đầu Tư & Phát Triển</option>
                                <option value="ACB">ACB - Á Châu</option>
                                <option value="VPB">VPBank - Thịnh Vượng</option>
                                <option value="TPB">TPBank - Tiên Phong</option>
                                <option value="STB">Sacombank - Sài Gòn Thương Tín</option>
                                <option value="VIB">VIB - Quốc Tế</option>
                                <option value="MSB">MSB - Hàng Hải</option>
                              </select>
                            </div>

                            <div className="col-12">
                              <label className="form-label small fw-bold text-secondary">Tên ngân hàng hiển thị *</label>
                              <input
                                type="text"
                                className="form-control rounded-3"
                                placeholder="Tên ngân hàng"
                                value={this.state.bankName}
                                onChange={(e) => this.setState({ bankName: e.target.value })}
                                required
                              />
                            </div>

                            <div className="col-12">
                              <label className="form-label small fw-bold text-secondary">Số tài khoản ngân hàng (STK) *</label>
                              <input
                                type="text"
                                className="form-control rounded-3 font-monospace fs-6 fw-bold"
                                placeholder="Nhập số tài khoản (ví dụ: 0931143830)"
                                value={this.state.accountNo}
                                onChange={(e) => this.setState({ accountNo: e.target.value })}
                                required
                              />
                            </div>

                            <div className="col-12">
                              <label className="form-label small fw-bold text-secondary">Tên chủ tài khoản *</label>
                              <input
                                type="text"
                                className="form-control rounded-3 text-uppercase fw-bold"
                                placeholder="Nhập tên chủ tài khoản (ví dụ: DO MINH KHOA)"
                                value={this.state.accountName}
                                onChange={(e) => this.setState({ accountName: e.target.value })}
                                required
                              />
                            </div>
                          </div>
                        </div>

                        {/* Right: Live Preview of Auto-Generated VietQR */}
                        <div className="col-md-5 text-center border-start-md">
                          <div className="p-3 bg-light rounded-4 border">
                            <span className="badge bg-success bg-opacity-10 text-success border border-success-subtle px-3 py-1 rounded-pill fw-bold small mb-2 d-inline-block">
                              <i className="bi bi-check-circle-fill me-1"></i> XEM TRƯỚC MÃ QR DỘNG
                            </span>
                            
                            <div className="p-2 bg-white rounded-3 shadow-sm d-inline-block border my-2">
                              <img
                                src={liveQrPreviewUrl}
                                alt="Mã QR tự động"
                                className="img-fluid rounded-2"
                                style={{ maxWidth: '180px', height: 'auto' }}
                              />
                            </div>

                            <div className="small text-secondary mt-1" style={{ fontSize: '11px' }}>
                              STK: <strong className="text-dark font-monospace">{this.state.accountNo}</strong>
                            </div>
                            <div className="small text-secondary" style={{ fontSize: '11px' }}>
                              Chủ TK: <strong className="text-dark">{this.state.accountName}</strong>
                            </div>
                            <div className="mt-2 text-success fw-bold" style={{ fontSize: '10px' }}>
                              ⚡ Mã VietQR tạo tự động khớp 100% với giá trị đơn hàng!
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="modal-footer bg-light">
                      <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={() => this.setState({ showPaymentConfigModal: false })}>Hủy</button>
                      <button type="submit" className="btn btn-success rounded-pill px-4 fw-bold shadow-sm" disabled={this.state.configLoading}>
                        {this.state.configLoading ? 'Đang lưu...' : '💾 LƯU CẤU HÌNH QR THANH TOÁN'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (<div />);
  }
}

export default Main;
