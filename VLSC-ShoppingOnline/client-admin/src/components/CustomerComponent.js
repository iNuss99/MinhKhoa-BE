import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class Customer extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      customers: [],
      orders: [],
      order: null,
      selectedCustomer: null,
      searchKeyword: '',
      statusFilter: 'all', // 'all' | 'active' | 'locked'
      copiedId: null,
      loading: true,
      ordersLoading: false,
      actionLoading: false
    };
  }

  componentDidMount() {
    this.apiGetCustomers();
    // Auto-sync polling every 8 seconds
    this.pollInterval = setInterval(() => {
      this.apiGetCustomersSilent();
    }, 8000);
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  apiGetCustomersSilent = () => {
    if (!this.context || !this.context.token) return;
    const config = {
      headers: { 'x-access-token': this.context.token }
    };
    axios.get('/api/admin/customers', config)
      .then((res) => {
        if (Array.isArray(res.data)) {
          this.setState({ customers: res.data });
        }
      })
      .catch(() => {});
  };

  // --- APIS (Lab 09 Standards) ---
  apiGetCustomers = () => {
    this.setState({ loading: true });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.get('/api/admin/customers', config)
      .then((res) => {
        const result = Array.isArray(res.data) ? res.data : [];
        this.setState({
          customers: result,
          loading: false
        });
      })
      .catch((err) => {
        console.error('[Admin Get Customers Error]:', err);
        this.setState({ customers: [], loading: false });
        if (err.response?.status === 401 && this.context) {
          this.context.setToken('');
          this.context.setUsername('');
          if (this.context.toastMessage) this.context.toastMessage('Phiên làm việc hết hạn. Vui lòng đăng nhập lại!', 'warning');
        } else if (this.context && this.context.toastMessage) {
          this.context.toastMessage('Không thể tải danh sách khách hàng', 'danger');
        }
      });
  };

  apiGetOrdersByCustID = (cid) => {
    this.setState({ ordersLoading: true });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.get('/api/admin/orders/customer/' + cid, config)
      .then((res) => {
        const result = Array.isArray(res.data) ? res.data : [];
        this.setState({
          orders: result,
          ordersLoading: false,
          order: result.length > 0 ? result[0] : null // Auto-select first order for convenience
        });
      })
      .catch((err) => {
        console.error('[Admin Get Orders By CustID Error]:', err);
        this.setState({ orders: [], ordersLoading: false, order: null });
        if (this.context && this.context.toastMessage) {
          this.context.toastMessage('Không thể tải danh sách đơn hàng của khách hàng này', 'danger');
        }
      });
  };

  apiPutCustomerDeactive = (id, token) => {
    this.setState({ actionLoading: true });
    const body = { token: token };
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.put('/api/admin/customers/deactive/' + id, body, config)
      .then((res) => {
        this.setState({ actionLoading: false });
        const result = res.data;
        if (result) {
          if (this.context && this.context.toastMessage) {
            this.context.toastMessage('Đã vô hiệu hóa (DEACTIVE) tài khoản khách hàng thành công!', 'success');
          }
          this.apiGetCustomers();
        } else {
          alert('SORRY BABY !');
        }
      })
      .catch((err) => {
        console.error('[Admin Deactive Customer Error]:', err);
        this.setState({ actionLoading: false });
        alert('SORRY BABY !');
      });
  };

  apiGetCustomerSendmail = (id) => {
    this.setState({ actionLoading: true });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.get('/api/admin/customers/sendmail/' + id, config)
      .then((res) => {
        this.setState({ actionLoading: false });
        const result = res.data;
        if (result && result.message) {
          if (this.context && this.context.toastMessage) {
            this.context.toastMessage(result.message, result.success ? 'success' : 'warning');
          }
          alert(result.message);
        }
      })
      .catch((err) => {
        console.error('[Admin Sendmail Error]:', err);
        this.setState({ actionLoading: false });
        alert('Email failure');
      });
  };

  // --- EVENT HANDLERS ---
  trCustomerClick = (item) => {
    this.setState({
      selectedCustomer: item,
      orders: [],
      order: null
    });
    this.apiGetOrdersByCustID(item._id);
  };

  trOrderClick = (item) => {
    this.setState({ order: item });
  };

  lnkDeactiveClick = (item, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Bạn có chắc muốn vô hiệu hóa (DEACTIVE) tài khoản '${item.username}'?`)) {
      this.apiPutCustomerDeactive(item._id, item.token);
    }
  };

  lnkEmailClick = (item, e) => {
    if (e) e.stopPropagation();
    if (window.confirm(`Gửi email kích hoạt tài khoản kèm mã xác thực tới '${item.email}'?`)) {
      this.apiGetCustomerSendmail(item._id);
    }
  };

  closeCustomerDetail = () => {
    this.setState({
      selectedCustomer: null,
      orders: [],
      order: null
    });
  };

  copyToClipboard = (text, e) => {
    if (e) e.stopPropagation();
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      this.setState({ copiedId: text });
      setTimeout(() => this.setState({ copiedId: null }), 1800);
    }
  };

  // --- HELPERS ---
  formatPrice = (amount) => {
    return (amount || 0).toLocaleString('vi-VN') + '₫';
  };

  formatDate = (cdate) => {
    if (!cdate) return 'N/A';
    const d = new Date(cdate);
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    return `${time} - ${date}`;
  };

  getAvatarColor = (name) => {
    const gradients = [
      'linear-gradient(135deg, #10b981 0%, #059669 100%)',
      'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
      'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
      'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
      'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
      'linear-gradient(135deg, #ec4899 0%, #be185d 100%)'
    ];
    const code = (name || 'U').charCodeAt(0);
    return gradients[code % gradients.length];
  };

  renderStatusBadge = (status) => {
    const s = (status || 'PENDING').toUpperCase();
    if (s === 'APPROVED') {
      return (
        <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem' }}>
          <i className="bi bi-check-circle-fill me-1"></i> APPROVED
        </span>
      );
    }
    if (s === 'CANCELED') {
      return (
        <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem' }}>
          <i className="bi bi-x-circle-fill me-1"></i> CANCELED
        </span>
      );
    }
    return (
      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.72rem' }}>
        <i className="bi bi-clock-history me-1"></i> PENDING
      </span>
    );
  };

  render() {
    const { customers, orders, order, selectedCustomer, loading, ordersLoading, searchKeyword, statusFilter, copiedId } = this.state;
    const custList = Array.isArray(customers) ? customers : [];

    const activeCount = custList.filter(c => c.active === 1).length;
    const lockedCount = custList.filter(c => c.active !== 1).length;

    const filtered = custList.filter(c => {
      // Status filter
      if (statusFilter === 'active' && c.active !== 1) return false;
      if (statusFilter === 'locked' && c.active === 1) return false;

      // Keyword search
      const kw = searchKeyword.toLowerCase().trim();
      if (!kw) return true;
      const id = (c._id || '').toString().toLowerCase();
      const username = (c.username || '').toLowerCase();
      const name = (c.name || '').toLowerCase();
      const email = (c.email || '').toLowerCase();
      const phone = (c.phone || '').toLowerCase();
      return id.includes(kw) || username.includes(kw) || name.includes(kw) || email.includes(kw) || phone.includes(kw);
    });

    return (
      <div className="container-fluid py-2">
        {/* Modern Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <span className="badge bg-success-subtle text-success p-2 rounded-3 fs-5">
                <i className="bi bi-people-fill"></i>
              </span>
              <div>
                <h1 className="h4 fw-extrabold text-dark mb-0">Quản lý Khách hàng</h1>
                <p className="text-secondary small mb-0 mt-0.5">
                  Xem danh sách thành viên, tra cứu lịch sử đơn hàng, khóa tài khoản và gửi mã kích hoạt
                </p>
              </div>
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-white text-secondary border px-3 py-2 rounded-pill fw-semibold d-inline-flex align-items-center gap-2 shadow-xs">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '7px', height: '7px' }} role="status"></span>
              Live Sync (8s)
            </span>
            <button
              className="btn btn-outline-success btn-sm rounded-pill px-3.5 py-2 fw-bold d-inline-flex align-items-center gap-1.5 shadow-xs"
              onClick={this.apiGetCustomers}
              title="Làm mới danh sách ngay"
            >
              <i className="bi bi-arrow-clockwise"></i> Làm mới
            </button>
          </div>
        </div>

        {/* Interactive KPI Stat Cards (Clickable to Filter) */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div
              className={`stat-card-kpi ${statusFilter === 'all' ? 'active-kpi' : ''}`}
              onClick={() => this.setState({ statusFilter: 'all' })}
              title="Nhấp để hiển thị tất cả khách hàng"
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Tổng số khách hàng
                  </div>
                  <div className="fs-3 fw-extrabold text-dark mt-1">
                    {custList.length}
                  </div>
                  <div className="small text-secondary mt-1">
                    Toàn bộ tài khoản trong hệ thống
                  </div>
                </div>
                <div className="kpi-icon-box bg-primary-subtle text-primary">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`stat-card-kpi ${statusFilter === 'active' ? 'active-kpi' : ''}`}
              onClick={() => this.setState({ statusFilter: 'active' })}
              title="Nhấp để lọc tài khoản đang hoạt động"
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-success small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Đang hoạt động (Active = 1)
                  </div>
                  <div className="fs-3 fw-extrabold text-success mt-1">
                    {activeCount}
                  </div>
                  <div className="small text-secondary mt-1">
                    Tài khoản hợp lệ & đăng nhập được
                  </div>
                </div>
                <div className="kpi-icon-box bg-success-subtle text-success">
                  <i className="bi bi-check-circle-fill"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div
              className={`stat-card-kpi ${statusFilter === 'locked' ? 'active-kpi' : ''}`}
              onClick={() => this.setState({ statusFilter: 'locked' })}
              title="Nhấp để lọc tài khoản chưa kích hoạt hoặc bị khóa"
            >
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-warning-emphasis small fw-bold text-uppercase" style={{ letterSpacing: '0.5px' }}>
                    Chưa kích hoạt / Bị khóa
                  </div>
                  <div className="fs-3 fw-extrabold text-warning-emphasis mt-1">
                    {lockedCount}
                  </div>
                  <div className="small text-secondary mt-1">
                    Cần gửi email kích hoạt lại token
                  </div>
                </div>
                <div className="kpi-icon-box bg-warning-subtle text-warning-emphasis">
                  <i className="bi bi-shield-slash-fill"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integrated Search & Filter Toolbar */}
        <div className="card border-0 shadow-sm rounded-4 p-3 bg-white mb-4">
          <div className="row g-3 align-items-center">
            {/* Search Input */}
            <div className="col-lg-7">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="search"
                  className="form-control bg-light border-start-0 border-end-0 py-2"
                  placeholder="Tìm nhanh theo ID, Tên đăng nhập, Họ tên, Email, Số điện thoại..."
                  value={searchKeyword}
                  onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                />
                {searchKeyword && (
                  <button
                    className="btn bg-light border-start-0 border rounded-end-pill pe-3 text-muted"
                    type="button"
                    onClick={() => this.setState({ searchKeyword: '' })}
                    title="Xóa tìm kiếm"
                  >
                    <i className="bi bi-x-circle-fill"></i>
                  </button>
                )}
                {!searchKeyword && (
                  <span className="input-group-text bg-light border-start-0 rounded-end-pill pe-3"></span>
                )}
              </div>
            </div>

            {/* Filter Tabs & Counter */}
            <div className="col-lg-5 d-flex align-items-center justify-content-lg-end gap-2 flex-wrap">
              <div className="segmented-control-group">
                <button
                  className={`filter-tab-pill ${statusFilter === 'all' ? 'active' : ''}`}
                  onClick={() => this.setState({ statusFilter: 'all' })}
                >
                  Tất cả <span className="badge bg-secondary-subtle text-dark rounded-pill ms-1">{custList.length}</span>
                </button>
                <button
                  className={`filter-tab-pill ${statusFilter === 'active' ? 'active' : ''}`}
                  onClick={() => this.setState({ statusFilter: 'active' })}
                >
                  Hoạt động <span className="badge bg-success text-white rounded-pill ms-1">{activeCount}</span>
                </button>
                <button
                  className={`filter-tab-pill ${statusFilter === 'locked' ? 'active' : ''}`}
                  onClick={() => this.setState({ statusFilter: 'locked' })}
                >
                  Bị khóa <span className="badge bg-warning text-dark rounded-pill ms-1">{lockedCount}</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 1: CUSTOMER LIST TABLE */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4">
          <div className="card-header bg-white py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
            <div className="d-flex align-items-center gap-2">
              <h2 className="h6 fw-extrabold mb-0 text-dark">
                Danh sách khách hàng
              </h2>
              <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-0.5 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                {filtered.length} kết quả
              </span>
            </div>
            <small className="text-secondary d-flex align-items-center gap-1">
              <i className="bi bi-cursor-fill text-success"></i> Nhấp vào dòng để xem danh sách đơn hàng
            </small>
          </div>

          <div className="table-responsive">
            <table className="table-modern">
              <thead>
                <tr>
                  <th className="ps-4" style={{ width: '25%' }}>Khách hàng</th>
                  <th style={{ width: '14%' }}>Mã ID</th>
                  <th style={{ width: '14%' }}>Mật khẩu</th>
                  <th style={{ width: '23%' }}>Liên hệ</th>
                  <th className="text-center" style={{ width: '12%' }}>Trạng thái</th>
                  <th className="pe-4 text-center" style={{ width: '12%' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Đang tải danh sách...</span>
                      </div>
                      <div className="text-secondary small mt-2">Đang nạp danh sách khách hàng...</div>
                    </td>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      <i className="bi bi-person-x fs-2 d-block text-muted mb-2"></i>
                      Không tìm thấy khách hàng nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => {
                    const isSelected = selectedCustomer && selectedCustomer._id === item._id;
                    const shortId = item._id ? item._id.slice(-6) : 'N/A';

                    return (
                      <tr
                        key={item._id}
                        className={isSelected ? 'row-selected' : ''}
                        onClick={() => this.trCustomerClick(item)}
                        title="Bấm để xem đơn hàng của khách hàng này"
                      >
                        {/* Avatar & Customer Info */}
                        <td className="ps-4 py-3">
                          <div className="d-flex align-items-center">
                            <div
                              className="avatar-circle text-white shadow-xs"
                              style={{ background: this.getAvatarColor(item.username || item.name) }}
                            >
                              {(item.username || item.name || 'U').charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div className="fw-bold text-dark text-truncate" style={{ fontSize: '0.94rem' }}>
                                {item.name || item.username}
                              </div>
                              <div className="text-muted small text-truncate">
                                @{item.username}
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Short Copyable ID */}
                        <td className="py-3">
                          <span
                            className="code-pill cursor-pointer"
                            onClick={(e) => this.copyToClipboard(item._id, e)}
                            title={`Mã đầy đủ: ${item._id} (Nhấp để sao chép)`}
                          >
                            <i className={copiedId === item._id ? "bi bi-check text-success" : "bi bi-copy"}></i>
                            #{shortId}
                          </span>
                        </td>

                        {/* Password Censored Tag */}
                        <td className="py-3">
                          <span
                            className="badge bg-light text-secondary border px-2.5 py-1.5 font-monospace d-inline-flex align-items-center gap-1.5"
                            style={{ fontSize: '0.78rem' }}
                            title={item.password ? `Mã hóa: ${item.password}` : 'Mật khẩu bảo mật'}
                          >
                            <i className="bi bi-shield-lock text-muted"></i>
                            <span>{item.password ? (item.password.length > 8 ? '••••••••' : item.password) : '••••••••'}</span>
                          </span>
                        </td>

                        {/* Contact Info (Phone & Email) */}
                        <td className="py-3">
                          <div className="d-flex flex-column gap-1">
                            <span className="text-dark small d-flex align-items-center">
                              <i className="bi bi-telephone text-muted me-2" style={{ fontSize: '0.85rem' }}></i>
                              <span className="font-monospace">{item.phone || 'Chưa có SĐT'}</span>
                            </span>
                            <span className="text-muted small d-flex align-items-center text-truncate" style={{ maxWidth: '240px' }}>
                              <i className="bi bi-envelope text-muted me-2" style={{ fontSize: '0.85rem' }}></i>
                              <span className="text-truncate">{item.email || 'Chưa có email'}</span>
                            </span>
                          </div>
                        </td>

                        {/* Active Status Badge */}
                        <td className="py-3 text-center">
                          {item.active === 1 ? (
                            <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-check-circle-fill me-1"></i> Hoạt động
                            </span>
                          ) : (
                            <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
                              <i className="bi bi-lock-fill me-1"></i> Bị khóa (0)
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="pe-4 py-3 text-center">
                          {item.active === 0 ? (
                            <button
                              className="btn btn-sm btn-outline-primary rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                              onClick={(e) => this.lnkEmailClick(item, e)}
                              title="Gửi email kích hoạt tài khoản kèm ID & Token"
                            >
                              <i className="bi bi-envelope-check-fill"></i> Gửi mail
                            </button>
                          ) : (
                            <button
                              className="btn btn-sm btn-outline-danger rounded-pill px-3 py-1 fw-bold d-inline-flex align-items-center gap-1 shadow-xs"
                              onClick={(e) => this.lnkDeactiveClick(item, e)}
                              title="Vô hiệu hóa (Khóa) tài khoản này"
                            >
                              <i className="bi bi-slash-circle-fill"></i> Khóa TK
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SECTION 2 & 3: SIDE-BY-SIDE 2-COLUMN SPLIT WORKSPACE (Orders & Order Items) */}
        {selectedCustomer && (
          <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white mb-4 border-top border-success border-3">
            {/* Customer Workspace Top Banner */}
            <div className="card-header bg-light py-3 px-4 border-bottom d-flex align-items-center justify-content-between flex-wrap gap-2">
              <div className="d-flex align-items-center gap-3">
                <div
                  className="avatar-circle text-white shadow-xs"
                  style={{ width: '42px', height: '42px', background: this.getAvatarColor(selectedCustomer.username) }}
                >
                  {(selectedCustomer.username || selectedCustomer.name || 'U').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="d-flex align-items-center gap-2">
                    <h5 className="h6 fw-extrabold mb-0 text-dark">
                      {selectedCustomer.name || selectedCustomer.username}
                    </h5>
                    <span className="badge bg-light text-secondary border font-monospace small">
                      ID: #{selectedCustomer._id ? selectedCustomer._id.slice(-6) : ''}
                    </span>
                    {selectedCustomer.active === 1 ? (
                      <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-2 py-0.5 small fw-bold">Active</span>
                    ) : (
                      <span className="badge bg-warning-subtle text-warning-emphasis border border-warning-subtle rounded-pill px-2 py-0.5 small fw-bold">Locked</span>
                    )}
                  </div>
                  <div className="text-secondary small mt-0.5">
                    Email: <span className="text-dark fw-semibold">{selectedCustomer.email}</span> • SĐT: <span className="text-dark fw-semibold">{selectedCustomer.phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              <div className="d-flex align-items-center gap-2">
                <span className="badge bg-success px-3 py-1.5 rounded-pill fw-bold">
                  {orders.length} Đơn hàng
                </span>
                <button
                  className="btn btn-sm btn-light border rounded-pill px-3 py-1 fw-bold text-secondary d-inline-flex align-items-center gap-1"
                  onClick={this.closeCustomerDetail}
                  title="Thu gọn chi tiết khách hàng"
                >
                  <i className="bi bi-x-lg"></i> Đóng
                </button>
              </div>
            </div>

            {/* Split Grid: Left (Order List) | Right (Order Items Detail) */}
            <div className="p-4">
              <div className="split-workspace-container">
                {/* COLUMN 1: ORDER LIST */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-receipt text-success"></i> Danh sách đơn hàng ({orders.length})
                    </h6>
                    <small className="text-muted">Bấm chọn đơn để xem chi tiết</small>
                  </div>

                  {ordersLoading ? (
                    <div className="text-center py-5 bg-light rounded-4 border">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Đang tải đơn hàng...</span>
                      </div>
                      <div className="text-muted small mt-2">Đang lấy lịch sử đơn hàng...</div>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-5 bg-light rounded-4 border text-secondary">
                      <i className="bi bi-inbox fs-2 text-muted d-block mb-2"></i>
                      Khách hàng này chưa có đơn hàng nào trong hệ thống.
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-2" style={{ maxHeight: '480px', overflowY: 'auto', overflowX: 'hidden' }}>
                      {orders.map((item) => {
                        const isOrderSelected = order && order._id === item._id;
                        return (
                          <div
                            key={item._id}
                            className={`order-row-item ${isOrderSelected ? 'selected' : ''}`}
                            onClick={() => this.trOrderClick(item)}
                          >
                            <div className="d-flex align-items-center justify-content-between">
                              <div className="d-flex align-items-center gap-2">
                                <span className="font-monospace fw-bold text-primary small">
                                  #{item._id.slice(-6)}
                                </span>
                                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                                  • {this.formatDate(item.cdate)}
                                </span>
                              </div>
                              {this.renderStatusBadge(item.status)}
                            </div>

                            <div className="d-flex align-items-center justify-content-between mt-2 pt-2 border-top">
                              <span className="text-secondary small">
                                {item.items ? item.items.length : 0} sản phẩm
                              </span>
                              <span className="fw-extrabold text-success text-nowrap">
                                {this.formatPrice(item.total)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* COLUMN 2: ORDER ITEMS DETAIL */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <h6 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                      <i className="bi bi-box-seam text-info"></i> Chi tiết sản phẩm trong đơn
                    </h6>
                    {order && (
                      <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold font-monospace" style={{ fontSize: '0.75rem' }}>
                        Mã: #{order._id.slice(-6)}
                      </span>
                    )}
                  </div>

                  {!order ? (
                    <div className="text-center py-5 bg-light rounded-4 border text-secondary h-100 d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '200px' }}>
                      <i className="bi bi-hand-index-thumb fs-2 text-muted mb-2"></i>
                      <span>Chọn một đơn hàng ở cột bên trái để xem chi tiết sản phẩm.</span>
                    </div>
                  ) : (
                    <div className="card border rounded-4 overflow-hidden bg-white shadow-xs">
                      <div className="table-responsive border-0">
                        <table className="table-compact">
                          <thead>
                            <tr>
                              <th className="ps-3" style={{ width: '36px' }}>#</th>
                              <th>Sản phẩm</th>
                              <th className="text-end text-nowrap" style={{ width: '110px' }}>Đơn giá</th>
                              <th className="text-center" style={{ width: '48px' }}>SL</th>
                              <th className="pe-3 text-end text-nowrap" style={{ width: '120px' }}>Thành tiền</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items && order.items.map((item, index) => {
                              const prod = item.product || {};
                              const imgSrc = prod.images && prod.images.length > 0
                                ? prod.images[0]
                                : (prod.image && prod.image.startsWith('http') ? prod.image : (prod.image ? (prod.image.startsWith('data:') ? prod.image : "data:image/jpg;base64," + prod.image) : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'));

                              const price = prod.price || 0;
                              const qty = item.quantity || 0;
                              const amount = price * qty;

                              return (
                                <tr key={prod._id || index}>
                                  <td className="ps-3 text-muted small fw-bold">
                                    {index + 1}
                                  </td>
                                  <td>
                                    <div className="d-flex align-items-center gap-2">
                                      <img
                                        src={imgSrc}
                                        alt={prod.name || 'Sản phẩm'}
                                        width="38px"
                                        height="38px"
                                        className="rounded-3 border object-fit-cover shadow-xs flex-shrink-0"
                                      />
                                      <div className="overflow-hidden">
                                        <div className="fw-bold text-dark text-truncate small" title={prod.name} style={{ maxWidth: '160px' }}>
                                          {prod.name || 'Sản phẩm'}
                                        </div>
                                        <div className="text-muted font-monospace" style={{ fontSize: '0.7rem' }}>
                                          #{prod._id ? prod._id.slice(-6) : ''}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="text-end small fw-semibold text-dark text-nowrap">
                                    {this.formatPrice(price)}
                                  </td>
                                  <td className="text-center">
                                    <span className="badge bg-light text-dark border px-2 py-0.5 rounded-pill font-monospace fw-bold" style={{ fontSize: '0.75rem' }}>
                                      x{qty}
                                    </span>
                                  </td>
                                  <td className="pe-3 text-end fw-bold text-success small text-nowrap">
                                    {this.formatPrice(amount)}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>

                      {/* Order Summary Footer */}
                      <div className="bg-light p-3 border-top d-flex align-items-center justify-content-between flex-wrap gap-2">
                        <div className="small text-secondary">
                          Trạng thái: {this.renderStatusBadge(order.status)}
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <span className="small text-secondary fw-semibold">Tổng thanh toán:</span>
                          <span className="fs-5 fw-extrabold text-success text-nowrap">
                            {this.formatPrice(order.total)}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Customer;
