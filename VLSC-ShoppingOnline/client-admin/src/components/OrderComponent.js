import React, { Component } from 'react';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class Order extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      selectedOrder: null,
      filterStatus: 'ALL', // 'ALL', 'PENDING', 'APPROVED', 'CANCELED'
      searchKeyword: '',
      loading: true,
      actionLoading: false
    };
  }

  componentDidMount() {
    this.apiGetOrders();
    // Auto-sync polling every 6 seconds so orders placed by customers appear in real-time
    this.pollInterval = setInterval(() => {
      this.apiGetOrdersSilent();
    }, 6000);
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  apiGetOrdersSilent = () => {
    if (!this.context || !this.context.token) return;
    const config = {
      headers: { 'x-access-token': this.context.token }
    };
    axios.get('/api/admin/orders', config)
      .then((res) => {
        if (Array.isArray(res.data)) {
          if (res.data.length > this.state.orders.length && this.state.orders.length > 0) {
            if (this.context && this.context.toastMessage) {
              this.context.toastMessage('🔔 Có đơn hàng mới vừa được khách hàng đặt!', 'success');
            }
          }
          this.setState({ orders: res.data });
        }
      })
      .catch(() => {});
  };

  apiGetOrders = () => {
    this.setState({ loading: true });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.get('/api/admin/orders', config)
      .then((res) => {
        this.setState({
          orders: Array.isArray(res.data) ? res.data : [],
          loading: false
        });
      })
      .catch((err) => {
        console.error('[Admin Get Orders Error]:', err);
        this.setState({ orders: [], loading: false });
        if (err.response?.status === 401 && this.context) {
          this.context.setToken('');
          this.context.setUsername('');
          if (this.context.toastMessage) this.context.toastMessage('Phiên làm việc hết hạn. Vui lòng đăng nhập lại!', 'warning');
        } else if (this.context && this.context.toastMessage) {
          this.context.toastMessage('Không thể tải danh sách đơn hàng', 'danger');
        }
      });
  };

  handleUpdateStatus = (orderId, newStatus) => {
    const statusText = newStatus === 'APPROVED' ? 'DUYỆT' : 'HỦY';
    if (!window.confirm(`Bạn có chắc chắn muốn ${statusText} đơn hàng này không?`)) {
      return;
    }

    this.setState({ actionLoading: true });
    const config = {
      headers: { 'x-access-token': this.context.token }
    };

    axios.put(`/api/admin/orders/status/${orderId}`, { status: newStatus }, config)
      .then((res) => {
        this.setState({ actionLoading: false });
        if (res.data && res.data.success) {
          if (this.context && this.context.toastMessage) {
            this.context.toastMessage(res.data.message || `Đã cập nhật đơn hàng thành ${newStatus}`, 'success');
          }
          // Update local state
          const updatedOrders = this.state.orders.map(o => {
            if (o._id === orderId) {
              return { ...o, status: newStatus };
            }
            return o;
          });

          let updatedSelected = this.state.selectedOrder;
          if (updatedSelected && updatedSelected._id === orderId) {
            updatedSelected = { ...updatedSelected, status: newStatus };
          }

          this.setState({
            orders: updatedOrders,
            selectedOrder: updatedSelected
          });
        }
      })
      .catch((err) => {
        console.error('[Update Order Status Error]:', err);
        this.setState({ actionLoading: false });
        if (this.context && this.context.toastMessage) {
          this.context.toastMessage('Lỗi khi cập nhật trạng thái đơn hàng', 'danger');
        }
      });
  };

  formatVND(value) {
    if (!value && value !== 0) return '0 ₫';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  }

  formatDate(timestamp) {
    if (!timestamp) return 'Hôm nay';
    const date = new Date(timestamp);
    return date.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  renderStatusBadge(status) {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-check2-circle me-1"></i> ĐÃ DUYỆT
          </span>
        );
      case 'CANCELED':
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-x-circle me-1"></i> ĐÃ HỦY
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2.5 py-1 rounded-pill fw-bold" style={{ fontSize: '0.75rem' }}>
            <i className="bi bi-clock-history me-1"></i> CHỜ DUYỆT
          </span>
        );
    }
  }

  renderOrderProducts(order) {
    if (!order.items || order.items.length === 0) {
      return <span className="text-muted small fst-italic">Không có sản phẩm</span>;
    }

    if (order.items.length === 1) {
      const item = order.items[0];
      const prod = item.product || {};
      const imgSrc = prod.images && prod.images.length > 0
        ? prod.images[0]
        : (prod.image && prod.image.startsWith('http') ? prod.image : (prod.image ? "data:image/jpg;base64," + prod.image : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'));

      return (
        <div className="d-flex align-items-center gap-2" style={{ minWidth: '220px', maxWidth: '320px' }}>
          <img
            src={imgSrc}
            alt={prod.name || 'Sản phẩm'}
            className="rounded-2 border p-0.5 object-fit-contain flex-shrink-0 bg-white shadow-sm"
            style={{ width: '38px', height: '38px', minWidth: '38px' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'; }}
          />
          <div className="overflow-hidden">
            <div className="fw-bold text-dark text-truncate small" title={prod.name || 'Sản phẩm'}>
              {prod.name || 'Sản phẩm'}
            </div>
            <div className="text-secondary small d-flex align-items-center gap-1.5" style={{ fontSize: '11.5px' }}>
              <span className="badge bg-light text-dark border px-1.5 py-0.5">SL: {item.quantity || 1}</span>
              {prod.price && <span className="text-muted">• {this.formatVND(prod.price)}</span>}
            </div>
          </div>
        </div>
      );
    }

    // Multiple items
    const firstItem = order.items[0];
    const firstProd = firstItem.product || {};
    const totalQty = order.items.reduce((sum, i) => sum + (i.quantity || 1), 0);
    const firstImg = firstProd.images && firstProd.images.length > 0
      ? firstProd.images[0]
      : (firstProd.image && firstProd.image.startsWith('http') ? firstProd.image : (firstProd.image ? "data:image/jpg;base64," + firstProd.image : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'));

    return (
      <div className="d-flex align-items-center gap-2" style={{ minWidth: '220px', maxWidth: '320px' }}>
        <div className="position-relative flex-shrink-0">
          <img
            src={firstImg}
            alt={firstProd.name || 'Sản phẩm'}
            className="rounded-2 border p-0.5 object-fit-contain bg-white shadow-sm"
            style={{ width: '38px', height: '38px', minWidth: '38px' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=100'; }}
          />
          <span 
            className="position-absolute bottom-0 end-0 badge rounded-pill bg-dark text-white p-0 d-flex align-items-center justify-content-center border border-white"
            style={{ width: '18px', height: '18px', fontSize: '9px', transform: 'translate(25%, 25%)' }}
            title={`Tổng ${totalQty} sản phẩm`}
          >
            {totalQty}
          </span>
        </div>
        <div className="overflow-hidden">
          <div className="fw-bold text-dark text-truncate small" title={firstProd.name || 'Sản phẩm'}>
            {firstProd.name || 'Sản phẩm'}
          </div>
          <div className="d-flex align-items-center gap-1.5 mt-0.5">
            <button 
              type="button"
              className="btn btn-link p-0 text-decoration-none badge bg-success-subtle text-success border border-success-subtle px-1.5 py-0.5 fw-bold"
              style={{ fontSize: '10.5px' }}
              onClick={() => this.setState({ selectedOrder: order })}
              title="Bấm để xem danh sách tất cả sản phẩm"
            >
              +{order.items.length - 1} sản phẩm khác
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { orders, loading, filterStatus, searchKeyword, selectedOrder } = this.state;
    const ordersList = Array.isArray(orders) ? orders : [];

    // Filter by tab and search keyword
    const filteredOrders = ordersList.filter(o => {
      const matchStatus = filterStatus === 'ALL' || o.status === filterStatus;
      const idStr = o._id ? o._id.toString().toLowerCase() : '';
      const custName = o.customer && o.customer.name ? o.customer.name.toLowerCase() : '';
      const custPhone = (o.deliveryPhone || (o.customer && o.customer.phone) || '').toLowerCase();
      const kw = searchKeyword.toLowerCase().trim();

      const matchProduct = o.items && o.items.some(i => i.product && i.product.name && i.product.name.toLowerCase().includes(kw));
      const matchKw = !kw || idStr.includes(kw) || custName.includes(kw) || custPhone.includes(kw) || matchProduct;
      return matchStatus && matchKw;
    });

    const pendingCount = ordersList.filter(o => o.status === 'PENDING').length;
    const approvedCount = ordersList.filter(o => o.status === 'APPROVED').length;
    const canceledCount = ordersList.filter(o => o.status === 'CANCELED').length;
    const approvedRevenue = ordersList
      .filter(o => o.status === 'APPROVED')
      .reduce((sum, o) => sum + (o.total || 0), 0);

    return (
      <div className="container-fluid py-4">
        {/* Top Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 fw-extrabold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-receipt-cutoff text-warning"></i> ORDER MANAGEMENT & FULFILLMENT
            </h1>
            <p className="text-secondary mb-0 small">
              Control order approval workflow, GHN shipping logistics, and VietQR payment verification
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold small d-inline-flex align-items-center gap-1.5">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} role="status"></span>
              Tự động cập nhật (6s)
            </span>
            <button
              onClick={this.apiGetOrders}
              className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1 shadow-sm"
            >
              <i className="bi bi-arrow-clockwise"></i> Làm mới
            </button>
          </div>
        </div>

        {/* Quick KPI Summary Cards */}
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-bold">Tổng đơn hàng</div>
                  <div className="fs-3 fw-extrabold text-dark mt-1">{orders.length}</div>
                </div>
                <div className="p-2.5 bg-primary bg-opacity-10 text-primary rounded-3">
                  <i className="bi bi-bag-check fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-warning border-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-bold">Đơn chờ xử lý</div>
                  <div className="fs-3 fw-extrabold text-warning mt-1">{pendingCount}</div>
                </div>
                <div className="p-2.5 bg-warning bg-opacity-10 text-warning rounded-3">
                  <i className="bi bi-hourglass-split fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-success border-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-bold">Đã duyệt & Giao hàng</div>
                  <div className="fs-3 fw-extrabold text-success mt-1">{approvedCount}</div>
                </div>
                <div className="p-2.5 bg-success bg-opacity-10 text-success rounded-3">
                  <i className="bi bi-check2-circle fs-4"></i>
                </div>
              </div>
            </div>
          </div>

          <div className="col-sm-6 col-xl-3">
            <div className="card border-0 shadow-sm rounded-4 p-3 bg-white border-start border-info border-4">
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <div className="text-secondary small fw-bold">Doanh thu đã duyệt</div>
                  <div className="fs-5 fw-extrabold text-dark mt-1">{this.formatVND(approvedRevenue)}</div>
                </div>
                <div className="p-2.5 bg-info bg-opacity-10 text-info rounded-3">
                  <i className="bi bi-cash-coin fs-4"></i>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="card border-0 shadow-sm rounded-4 p-3.5 mb-4 bg-white">
          <div className="row g-3 align-items-center justify-content-between">
            {/* Filter Tabs */}
            <div className="col-md-7">
              <div className="d-flex gap-2 overflow-auto pb-1">
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${filterStatus === 'ALL' ? 'btn-success' : 'btn-light border text-secondary'}`}
                  onClick={() => this.setState({ filterStatus: 'ALL' })}
                >
                  Tất cả ({orders.length})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${filterStatus === 'PENDING' ? 'btn-warning text-dark' : 'btn-light border text-secondary'}`}
                  onClick={() => this.setState({ filterStatus: 'PENDING' })}
                >
                  Chờ xử lý ({pendingCount})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${filterStatus === 'APPROVED' ? 'btn-success' : 'btn-light border text-secondary'}`}
                  onClick={() => this.setState({ filterStatus: 'APPROVED' })}
                >
                  Đã duyệt ({approvedCount})
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-3 py-1.5 fw-bold ${filterStatus === 'CANCELED' ? 'btn-danger' : 'btn-light border text-secondary'}`}
                  onClick={() => this.setState({ filterStatus: 'CANCELED' })}
                >
                  Đã hủy ({canceledCount})
                </button>
              </div>
            </div>

            {/* Search Input */}
            <div className="col-md-5">
              <div className="input-group">
                <span className="input-group-text bg-light border-end-0 rounded-start-pill ps-3">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="search"
                  className="form-control bg-light border-start-0 rounded-end-pill py-2"
                  placeholder="Tìm theo mã đơn, tên khách hàng, SĐT..."
                  value={searchKeyword}
                  onChange={(e) => this.setState({ searchKeyword: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-secondary fw-semibold small">Mã đơn hàng</th>
                  <th className="py-3 text-secondary fw-semibold small">Khách hàng</th>
                  <th className="py-3 text-secondary fw-semibold small">Sản phẩm</th>
                  <th className="py-3 text-secondary fw-semibold small">Ngày đặt</th>
                  <th className="py-3 text-secondary fw-semibold small">Tổng tiền</th>
                  <th className="py-3 text-secondary fw-semibold small text-center">Trạng thái</th>
                  <th className="pe-4 py-3 text-secondary fw-semibold small text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <div className="spinner-border text-success" role="status">
                        <span className="visually-hidden">Đang nạp dữ liệu đơn hàng...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-5 text-secondary">
                      <i className="bi bi-inbox fs-3 d-block text-muted mb-2"></i>
                      Không tìm thấy đơn hàng nào phù hợp với điều kiện tìm kiếm.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order) => {
                    return (
                      <tr key={order._id} className="border-bottom hover-row">
                        <td className="ps-4 py-3">
                          <button
                            className="btn btn-link p-0 text-decoration-none fw-bold font-monospace text-primary text-start"
                            onClick={() => this.setState({ selectedOrder: order })}
                            title="Bấm để xem chi tiết đơn hàng"
                          >
                            #{order._id ? order._id.toString().slice(-8).toUpperCase() : 'ORDER'}
                          </button>
                        </td>

                        <td className="py-3">
                          <div className="fw-bold text-dark">{order.customer ? order.customer.name : 'Khách vãng lai'}</div>
                          <div className="text-secondary small" style={{ fontSize: '12px' }}>
                            {order.deliveryPhone || (order.customer ? order.customer.phone : 'N/A')}
                          </div>
                        </td>

                        <td className="py-3">
                          {this.renderOrderProducts(order)}
                        </td>

                        <td className="py-3 text-secondary small">
                          {this.formatDate(order.cdate)}
                        </td>

                        <td className="py-3 fw-extrabold text-success">
                          {this.formatVND(order.total)}
                        </td>

                        <td className="py-3 text-center">
                          {this.renderStatusBadge(order.status)}
                        </td>

                        <td className="pe-4 py-3 text-center">
                          <div className="d-inline-flex gap-2 align-items-center justify-content-center">
                            <button
                              className="btn btn-sm btn-light border text-primary rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center"
                              style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', padding: 0 }}
                              onClick={() => this.setState({ selectedOrder: order })}
                              title="Xem chi tiết đơn hàng"
                            >
                              <i className="bi bi-eye-fill fs-6"></i>
                            </button>

                            {order.status === 'PENDING' && (
                              <>
                                <button
                                  className="btn btn-sm btn-success text-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center"
                                  style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', padding: 0 }}
                                  onClick={() => this.handleUpdateStatus(order._id, 'APPROVED')}
                                  title="Duyệt đơn hàng (Approve)"
                                >
                                  <i className="bi bi-check-lg fs-5"></i>
                                </button>
                                <button
                                  className="btn btn-sm btn-outline-danger rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center bg-white"
                                  style={{ width: '36px', height: '36px', minWidth: '36px', minHeight: '36px', padding: 0 }}
                                  onClick={() => this.handleUpdateStatus(order._id, 'CANCELED')}
                                  title="Hủy đơn hàng (Cancel)"
                                >
                                  <i className="bi bi-x-lg fs-6"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Drill-down Detail Modal */}
        {selectedOrder && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
            <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
              <div className="modal-content rounded-4 border-0 shadow-lg">
                <div className="modal-header bg-light border-0 p-3.5 rounded-top-4">
                  <div>
                    <h5 className="modal-title fw-extrabold text-dark d-flex align-items-center gap-2">
                      <i className="bi bi-receipt text-success"></i> Chi tiết đơn hàng #{selectedOrder._id ? selectedOrder._id.toString().slice(-8).toUpperCase() : ''}
                    </h5>
                    <div className="text-secondary small mt-0.5">
                      Ngày đặt: {this.formatDate(selectedOrder.cdate)} • {this.renderStatusBadge(selectedOrder.status)}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="btn-close"
                    onClick={() => this.setState({ selectedOrder: null })}
                  ></button>
                </div>

                <div className="modal-body p-4">
                  {/* Customer & Delivery Box */}
                  <div className="bg-light p-3.5 rounded-3 mb-4">
                    <h6 className="fw-bold text-dark mb-2"><i className="bi bi-person-lines-fill text-success me-1.5"></i> Thông tin giao nhận</h6>
                    <div className="row g-2 small">
                      <div className="col-sm-6">
                        <span className="text-secondary">Khách hàng:</span> <strong className="text-dark">{selectedOrder.customer ? selectedOrder.customer.name : 'N/A'}</strong>
                      </div>
                      <div className="col-sm-6">
                        <span className="text-secondary">Số điện thoại:</span> <strong className="text-dark">{selectedOrder.deliveryPhone || (selectedOrder.customer ? selectedOrder.customer.phone : 'N/A')}</strong>
                      </div>
                      <div className="col-12">
                        <span className="text-secondary">Địa chỉ giao hàng:</span> <strong className="text-dark">{selectedOrder.deliveryAddress || 'N/A'}</strong>
                      </div>
                      <div className="col-12">
                        <span className="text-secondary">Phương thức thanh toán:</span>{' '}
                        {selectedOrder.paymentMethod && selectedOrder.paymentMethod.includes('QR') ? (
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle px-2.5 py-1 rounded-pill fw-bold">
                            <i className="bi bi-qr-code-scan me-1"></i> {selectedOrder.paymentMethod}
                          </span>
                        ) : (
                          <strong className="text-success">{selectedOrder.paymentMethod || 'Thanh toán COD (Tiền mặt)'}</strong>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-box-seam-fill text-success me-1.5"></i> Danh sách sản phẩm trong đơn</h6>
                  <div className="table-responsive">
                    <table className="table align-middle mb-0">
                      <thead className="table-light small">
                        <tr>
                          <th className="py-2">Sản phẩm</th>
                          <th className="py-2 text-center">Đơn giá</th>
                          <th className="py-2 text-center">Số lượng</th>
                          <th className="py-2 text-end">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items && selectedOrder.items.map((item, idx) => {
                          const prod = item.product || {};
                          const imgSrc = prod.images && prod.images.length > 0
                            ? prod.images[0]
                            : (prod.image && prod.image.startsWith('http') ? prod.image : (prod.image ? "data:image/jpg;base64," + prod.image : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'));

                          return (
                            <tr key={idx} className="border-bottom">
                              <td className="py-2.5">
                                <div className="d-flex align-items-center gap-2">
                                  <img
                                    src={imgSrc}
                                    alt={prod.name}
                                    className="rounded-2 border object-fit-contain p-1"
                                    style={{ width: '44px', height: '44px', minWidth: '44px', backgroundColor: '#fafafa' }}
                                  />
                                  <span className="fw-bold text-dark small">{prod.name}</span>
                                </div>
                              </td>
                              <td className="py-2.5 text-center small text-secondary">
                                {this.formatVND(prod.price)}
                              </td>
                              <td className="py-2.5 text-center fw-bold small">
                                x{item.quantity}
                              </td>
                              <td className="py-2.5 text-end fw-bold text-dark small">
                                {this.formatVND((prod.price || 0) * (item.quantity || 1))}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                    <span className="fw-bold text-secondary">Tổng thanh toán đơn hàng:</span>
                    <span className="fs-4 fw-extrabold text-success">{this.formatVND(selectedOrder.total)}</span>
                  </div>
                </div>

                <div className="modal-footer bg-light border-0 p-3 rounded-bottom-4 d-flex justify-content-between">
                  <div>
                    {selectedOrder.status === 'PENDING' && (
                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success fw-bold d-flex align-items-center gap-1.5"
                          onClick={() => this.handleUpdateStatus(selectedOrder._id, 'APPROVED')}
                        >
                          <i className="bi bi-check-circle-fill"></i> Duyệt đơn hàng
                        </button>
                        <button
                          className="btn btn-outline-danger fw-bold d-flex align-items-center gap-1.5"
                          onClick={() => this.handleUpdateStatus(selectedOrder._id, 'CANCELED')}
                        >
                          <i className="bi bi-x-circle-fill"></i> Hủy đơn
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary rounded-pill px-4 fw-bold"
                    onClick={() => this.setState({ selectedOrder: null })}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default Order;
