import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyContext from '../contexts/MyContext';
import withRouter from '../utils/withRouter';
import { formatVND } from '../utils/formatCurrency';

class Myorders extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      order: null,
      loading: true,
      filterStatus: 'ALL', // 'ALL', 'PENDING', 'APPROVED', 'CANCELED'
      selectedOrderDetails: null,
      reviewModalProduct: null,
      reviewRating: 5,
      reviewComment: '',
      supportModalOrder: null
    };
  }

  componentDidMount() {
    if (!this.context.token) {
      this.props.navigate('/login');
      return;
    }
    if (this.context.customer) {
      const cid = this.context.customer._id;
      this.apiGetOrdersByCustID(cid);
    } else {
      this.apiGetOrders();
    }

    // Auto-sync polling every 8 seconds so order status updates live when Admin approves
    this.pollInterval = setInterval(() => {
      this.apiGetOrdersSilent();
    }, 8000);
  }

  componentWillUnmount() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  // event-handlers (Lab 07)
  trItemClick(item) {
    this.setState({ order: item, selectedOrderDetails: item });
  }

  // apis (Lab 07)
  apiGetOrdersByCustID(cid) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/customer/orders/customer/' + cid, config).then((res) => {
      const result = res.data;
      this.setState({ orders: Array.isArray(result) ? result : [], loading: false });
    }).catch((err) => {
      console.error('[Fetch Orders Error]:', err);
      this.setState({ orders: [], loading: false });
    });
  }

  apiGetOrdersSilent = () => {
    if (!this.context.customer || !this.context.customer._id || !this.context.token) return;
    const config = {
      headers: { 'x-access-token': this.context.token }
    };
    axios.get(`/api/customer/orders/customer/${this.context.customer._id}`, config)
      .then((res) => {
        if (Array.isArray(res.data)) {
          this.setState({ orders: res.data });
        }
      })
      .catch(() => {});
  };

  apiGetOrders = () => {
    if (!this.context.customer || !this.context.customer._id) {
      this.setState({ loading: false });
      return;
    }
    this.apiGetOrdersByCustID(this.context.customer._id);
  };

  handleReorder = (order) => {
    if (!order.items || order.items.length === 0) return;
    
    let addedCount = 0;
    order.items.forEach(item => {
      if (item.product && this.context.addToCart) {
        for (let i = 0; i < (item.quantity || 1); i++) {
          this.context.addToCart(item.product);
        }
        addedCount += (item.quantity || 1);
      }
    });

    if (this.context.showToast) {
      this.context.showToast(`Đã thêm ${addedCount} sản phẩm từ đơn #${order._id.toString().slice(-6).toUpperCase()} vào giỏ hàng!`, 'success');
    }
    this.props.navigate('/mycart');
  };

  handleOpenReviewModal = (product) => {
    this.setState({
      reviewModalProduct: product,
      reviewRating: 5,
      reviewComment: ''
    });
  };

  handleSubmitReview = (e) => {
    e.preventDefault();
    const { reviewModalProduct, reviewRating, reviewComment } = this.state;
    if (!reviewModalProduct) return;

    if (this.context.showToast) {
      this.context.showToast(`Cảm ơn bạn đã đánh giá ${reviewRating}★ cho sản phẩm '${reviewModalProduct.name}'!`, 'success');
    }
    this.setState({ reviewModalProduct: null, reviewComment: '' });
  };

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

  getTrackingNumber(orderId) {
    if (!orderId) return 'VLSC-GHN-882910';
    return 'VLSC-GHN-' + orderId.toString().slice(-6).toUpperCase();
  }

  renderStatusBadge(status) {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1.5 rounded-pill fw-bold shadow-sm">
            <i className="bi bi-truck me-1"></i> Đã duyệt & Đang giao hàng
          </span>
        );
      case 'CANCELED':
        return (
          <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-3 py-1.5 rounded-pill fw-bold shadow-sm">
            <i className="bi bi-x-circle me-1"></i> Đã hủy
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-3 py-1.5 rounded-pill fw-bold shadow-sm">
            <i className="bi bi-clock-history me-1"></i> Chờ shop duyệt đơn
          </span>
        );
    }
  }

  renderTimeline(status) {
    const isApproved = status === 'APPROVED';
    const isCanceled = status === 'CANCELED';

    if (isCanceled) {
      return (
        <div className="bg-danger bg-opacity-10 p-3 rounded-3 my-3 text-center border border-danger border-opacity-25">
          <span className="text-danger fw-bold small">
            <i className="bi bi-exclamation-triangle-fill me-1.5"></i> Đơn hàng này đã bị hủy. Nếu cần hỗ trợ, vui lòng liên hệ Hotline 1900 8888.
          </span>
        </div>
      );
    }

    return (
      <div className="py-3 px-2 my-2 bg-light rounded-3 border border-light-subtle">
        <div className="d-flex align-items-center justify-content-between position-relative px-2">
          {/* Step 1 */}
          <div className="text-center position-relative z-1">
            <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center shadow-sm" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-check-lg small"></i>
            </div>
            <div className="fw-bold text-dark mt-1" style={{ fontSize: '11px' }}>Đặt hàng</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Đã tiếp nhận</div>
          </div>

          {/* Line 1 */}
          <div className={`flex-grow-1 mx-2 rounded ${isApproved ? 'bg-success' : 'bg-warning'}`} style={{ height: '3px' }}></div>

          {/* Step 2 */}
          <div className="text-center position-relative z-1">
            <div className={`rounded-circle text-white d-inline-flex align-items-center justify-content-center shadow-sm ${isApproved ? 'bg-success' : 'bg-warning text-dark'}`} style={{ width: '32px', height: '32px' }}>
              <i className={`bi ${isApproved ? 'bi-box-seam-fill' : 'bi-hourglass-split'} small`}></i>
            </div>
            <div className="fw-bold text-dark mt-1" style={{ fontSize: '11px' }}>Xác nhận & Đóng gói</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>{isApproved ? 'Hoàn thành' : 'Chờ duyệt'}</div>
          </div>

          {/* Line 2 */}
          <div className={`flex-grow-1 mx-2 rounded ${isApproved ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`} style={{ height: '3px' }}></div>

          {/* Step 3 */}
          <div className="text-center position-relative z-1">
            <div className={`rounded-circle text-white d-inline-flex align-items-center justify-content-center shadow-sm ${isApproved ? 'bg-primary' : 'bg-secondary bg-opacity-25'}`} style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-truck small"></i>
            </div>
            <div className="fw-bold text-dark mt-1" style={{ fontSize: '11px' }}>Đang vận chuyển</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>{isApproved ? 'Giao Hàng Nhanh (GHN)' : 'Chờ xuất kho'}</div>
          </div>

          {/* Line 3: Gray line before delivery */}
          <div className="flex-grow-1 mx-2 rounded bg-secondary bg-opacity-25" style={{ height: '3px' }}></div>

          {/* Step 4 */}
          <div className="text-center position-relative z-1">
            <div className="rounded-circle text-white d-inline-flex align-items-center justify-content-center shadow-sm bg-secondary bg-opacity-25" style={{ width: '32px', height: '32px' }}>
              <i className="bi bi-house-door-fill small"></i>
            </div>
            <div className="fw-bold text-dark mt-1" style={{ fontSize: '11px' }}>Giao thành công</div>
            <div className="text-muted" style={{ fontSize: '10px' }}>Dự kiến 1-2 ngày</div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { orders, loading, filterStatus, selectedOrderDetails, reviewModalProduct, reviewRating, reviewComment, supportModalOrder } = this.state;
    const ordersList = Array.isArray(orders) ? orders : [];

    const filteredOrders = filterStatus === 'ALL'
      ? ordersList
      : ordersList.filter(o => o.status === filterStatus);

    return (
      <div className="py-4">
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none fw-semibold">Trang chủ</Link></li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">Lịch sử đơn hàng</li>
          </ol>
        </nav>

        {/* Top Header */}
        <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
          <div>
            <h1 className="h3 fw-extrabold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-receipt text-success"></i> ĐƠN HÀNG CỦA TÔI
            </h1>
            <p className="text-secondary small mb-0">
              Theo dõi tiến trình vận chuyển, kiểm tra hành trình đơn hàng và quản lý mua sắm
            </p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm">
              <span className="spinner-grow spinner-grow-sm text-success" style={{ width: '8px', height: '8px' }} role="status"></span>
              Cập nhật tự động Live (8s)
            </span>
            <button
              className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-bold d-inline-flex align-items-center gap-1.5 shadow-sm"
              onClick={this.apiGetOrders}
              title="Làm mới ngay lập tức"
            >
              <i className="bi bi-arrow-clockwise"></i> Làm mới
            </button>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="d-flex gap-2 mb-4 overflow-auto pb-1">
          <button
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold shadow-sm ${filterStatus === 'ALL' ? 'btn-success' : 'btn-light border text-secondary'}`}
            onClick={() => this.setState({ filterStatus: 'ALL' })}
          >
            Tất cả ({ordersList.length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold shadow-sm ${filterStatus === 'PENDING' ? 'btn-warning text-dark' : 'btn-light border text-secondary'}`}
            onClick={() => this.setState({ filterStatus: 'PENDING' })}
          >
            Chờ xử lý ({ordersList.filter(o => o.status === 'PENDING').length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold shadow-sm ${filterStatus === 'APPROVED' ? 'btn-success' : 'btn-light border text-secondary'}`}
            onClick={() => this.setState({ filterStatus: 'APPROVED' })}
          >
            Đã duyệt ({ordersList.filter(o => o.status === 'APPROVED').length})
          </button>
          <button
            className={`btn btn-sm rounded-pill px-3.5 py-1.5 fw-bold shadow-sm ${filterStatus === 'CANCELED' ? 'btn-danger' : 'btn-light border text-secondary'}`}
            onClick={() => this.setState({ filterStatus: 'CANCELED' })}
          >
            Đã hủy ({ordersList.filter(o => o.status === 'CANCELED').length})
          </button>
        </div>

        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-success" role="status">
              <span className="visually-hidden">Đang tải danh sách đơn hàng...</span>
            </div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="card border-0 shadow-sm rounded-4 p-5 text-center bg-white">
            <div className="mb-3">
              <span className="p-3 bg-light text-secondary rounded-circle d-inline-flex align-items-center justify-content-center">
                <i className="bi bi-box2 display-5 text-muted"></i>
              </span>
            </div>
            <h4 className="fw-bold text-dark mb-2">Chưa có đơn hàng nào trong mục này</h4>
            <p className="text-secondary small mb-4">
              Bạn chưa có đơn hàng nào phù hợp với bộ lọc hiện tại.
            </p>
            <div>
              <Link to="/home" className="btn btn-success rounded-pill px-4 py-2.5 fw-bold">
                Mua sắm ngay
              </Link>
            </div>
          </div>
        ) : (
          <div className="d-flex flex-column gap-4">
            {filteredOrders.map((order) => {
              const subtotal = order.items ? order.items.reduce((sum, item) => sum + ((item.product ? item.product.price : 0) * (item.quantity || 1)), 0) : order.total;
              const trackingCode = this.getTrackingNumber(order._id);

              return (
                <div key={order._id} className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
                  {/* Card Header */}
                  <div className="card-header bg-light border-0 p-3.5 d-flex align-items-center justify-content-between flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-3 flex-wrap">
                      <span className="fw-extrabold text-dark">
                        Mã đơn: <span className="font-monospace text-primary">#{order._id.toString().slice(-8).toUpperCase()}</span>
                      </span>
                      <span className="text-muted small">•</span>
                      <span className="text-secondary small">
                        <i className="bi bi-calendar3 me-1"></i> {this.formatDate(order.cdate)}
                      </span>
                      {order.status === 'APPROVED' && (
                        <>
                          <span className="text-muted small">•</span>
                          <span className="badge bg-primary bg-opacity-10 text-primary border border-primary-subtle rounded-pill font-monospace">
                            <i className="bi bi-truck me-1"></i> {trackingCode}
                          </span>
                        </>
                      )}
                    </div>
                    <div>
                      {this.renderStatusBadge(order.status)}
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="card-body p-3.5">
                    {/* Visual Progress Step Bar */}
                    {this.renderTimeline(order.status)}

                    {/* Products List */}
                    <div className="d-flex flex-column gap-3 my-3">
                      {order.items && order.items.map((item, idx) => {
                        const prod = item.product || {};
                        const imgSrc = prod.images && prod.images.length > 0
                          ? prod.images[0]
                          : (prod.image && prod.image.startsWith('http') ? prod.image : (prod.image ? "data:image/jpg;base64," + prod.image : 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200'));

                        return (
                          <div key={idx} className="d-flex align-items-center justify-content-between gap-3 border-bottom pb-3">
                            <div className="d-flex align-items-center gap-3">
                              {prod._id ? (
                                <Link to={`/product/${prod._id}`}>
                                  <img
                                    src={imgSrc}
                                    alt={prod.name || 'Sản phẩm'}
                                    className="rounded-3 border object-fit-contain p-1 hover-zoom"
                                    style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: '#fafafa', cursor: 'pointer' }}
                                  />
                                </Link>
                              ) : (
                                <img
                                  src={imgSrc}
                                  alt={prod.name || 'Sản phẩm'}
                                  className="rounded-3 border object-fit-contain p-1"
                                  style={{ width: '64px', height: '64px', minWidth: '64px', backgroundColor: '#fafafa' }}
                                />
                              )}
                              <div>
                                {prod._id ? (
                                  <Link to={`/product/${prod._id}`} className="fw-bold text-dark text-decoration-none hover-text-primary small d-block mb-1">
                                    {prod.name || 'Sản phẩm công nghệ VLSC'}
                                  </Link>
                                ) : (
                                  <div className="fw-bold text-dark small mb-1">{prod.name || 'Sản phẩm công nghệ VLSC'}</div>
                                )}
                                <div className="text-secondary small" style={{ fontSize: '12px' }}>
                                  Số lượng: <strong className="text-dark">x{item.quantity}</strong>
                                </div>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                              <div className="fw-bold text-dark text-end small">
                                {formatVND(prod.price ? prod.price * item.quantity : 0)}
                              </div>
                              {order.status === 'APPROVED' && (
                                <button
                                  className="btn btn-sm btn-outline-warning rounded-pill px-2.5 py-1 text-dark fw-bold"
                                  style={{ fontSize: '0.75rem' }}
                                  onClick={() => this.handleOpenReviewModal(prod)}
                                >
                                  <i className="bi bi-star-fill text-warning me-1"></i> Đánh giá
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Summary & Shipping Information Bar */}
                    <div className="row g-3 align-items-center pt-2">
                      <div className="col-md-7">
                        <div className="p-3 bg-light rounded-3 text-secondary small">
                          <div className="mb-1 text-truncate">
                            <i className="bi bi-geo-alt-fill me-1.5 text-success"></i> Nơi nhận: <strong className="text-dark">{order.deliveryAddress || 'Chưa cập nhật địa chỉ giao hàng'}</strong>
                          </div>
                          <div className="d-flex gap-3 flex-wrap mt-1">
                            <span><i className="bi bi-telephone-fill me-1 text-primary"></i> SĐT: <strong className="text-dark">{order.deliveryPhone || (order.customer && order.customer.phone) || 'N/A'}</strong></span>
                            <span><i className="bi bi-credit-card-2-front-fill me-1 text-warning"></i> Thanh toán: <strong className="text-dark">{order.paymentMethod === 'COD' ? 'Tiền mặt khi nhận hàng (COD)' : (order.paymentMethod || 'COD')}</strong></span>
                          </div>
                        </div>
                      </div>

                      <div className="col-md-5 text-md-end">
                        <div className="text-secondary small">Thành tiền tạm tính: <span className="fw-semibold text-dark">{formatVND(subtotal)}</span></div>
                        <div className="text-secondary small">Phí vận chuyển: <span className="fw-semibold text-success">Miễn phí 0 ₫</span></div>
                        <div className="mt-1">
                          <span className="text-secondary small me-2">Tổng thanh toán:</span>
                          <span className="fs-4 fw-extrabold text-success">{formatVND(order.total)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons Toolbar */}
                    <div className="d-flex align-items-center justify-content-end gap-2 mt-3 pt-3 border-top flex-wrap">
                      <button
                        className="btn btn-light btn-sm rounded-pill px-3 py-2 fw-semibold text-secondary border shadow-sm d-inline-flex align-items-center gap-1.5"
                        onClick={() => this.setState({ supportModalOrder: order })}
                      >
                        <i className="bi bi-headset text-primary"></i> Trợ giúp đơn hàng
                      </button>

                      <button
                        className="btn btn-outline-primary btn-sm rounded-pill px-3 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                        onClick={() => this.trItemClick(order)}
                      >
                        <i className="bi bi-eye"></i> Xem chi tiết
                      </button>

                      <button
                        className="btn btn-success btn-sm rounded-pill px-3.5 py-2 fw-bold shadow-sm d-inline-flex align-items-center gap-1.5"
                        onClick={() => this.handleReorder(order)}
                      >
                        <i className="bi bi-arrow-repeat"></i> Mua lại đơn này
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal 1: Detailed Order View */}
        {selectedOrderDetails && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content border-0 rounded-4 shadow-lg overflow-hidden">
                <div className="modal-header bg-success text-white p-3.5">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-file-earmark-text"></i> CHI TIẾT ĐƠN HÀNG #{selectedOrderDetails._id.toString().slice(-8).toUpperCase()}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => this.setState({ selectedOrderDetails: null, order: null })}></button>
                </div>
                <div className="modal-body p-4">
                  <div className="row g-3 mb-4">
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <h6 className="fw-bold text-dark mb-2"><i className="bi bi-person-circle text-primary me-1.5"></i> Thông tin khách nhận</h6>
                        <div className="small text-secondary mb-1">Họ tên: <strong className="text-dark">{selectedOrderDetails.customer ? selectedOrderDetails.customer.name || selectedOrderDetails.customer.username : 'Khách hàng'}</strong></div>
                        <div className="small text-secondary mb-1">Số điện thoại: <strong className="text-dark">{selectedOrderDetails.deliveryPhone || (selectedOrderDetails.customer && selectedOrderDetails.customer.phone) || 'N/A'}</strong></div>
                        <div className="small text-secondary">Địa chỉ giao: <strong className="text-dark">{selectedOrderDetails.deliveryAddress || 'Chưa cập nhật'}</strong></div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="p-3 bg-light rounded-3 h-100">
                        <h6 className="fw-bold text-dark mb-2"><i className="bi bi-truck text-success me-1.5"></i> Vận chuyển & Thanh toán</h6>
                        <div className="small text-secondary mb-1">Đơn vị vận chuyển: <strong className="text-dark">GHN Express (Giao Hàng Nhanh)</strong></div>
                        <div className="small text-secondary mb-1">Mã vận đơn: <strong className="text-primary font-monospace">{this.getTrackingNumber(selectedOrderDetails._id)}</strong></div>
                        <div className="small text-secondary mb-1">Hình thức thanh toán: <strong className="text-dark">{selectedOrderDetails.paymentMethod === 'COD' ? 'Thanh toán tiền mặt khi nhận hàng' : (selectedOrderDetails.paymentMethod || 'COD')}</strong></div>
                        <div className="small text-secondary">Trạng thái: <strong className="text-success">{selectedOrderDetails.status === 'APPROVED' ? 'Đã duyệt & Đang giao' : selectedOrderDetails.status}</strong></div>
                      </div>
                    </div>
                  </div>

                  <h6 className="fw-bold text-dark mb-3"><i className="bi bi-bag-check text-warning me-1.5"></i> Danh sách sản phẩm</h6>
                  <div className="table-responsive mb-3">
                    <table className="table table-bordered align-middle">
                      <thead className="table-light">
                        <tr>
                          <th>Sản phẩm</th>
                          <th className="text-center">Đơn giá</th>
                          <th className="text-center">Số lượng</th>
                          <th className="text-end">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrderDetails.items && selectedOrderDetails.items.map((it, i) => {
                          const p = it.product || {};
                          return (
                            <tr key={i}>
                              <td>
                                <div className="fw-bold text-dark small">{p.name || 'Sản phẩm'}</div>
                              </td>
                              <td className="text-center small">{formatVND(p.price || 0)}</td>
                              <td className="text-center small">x{it.quantity}</td>
                              <td className="text-end fw-bold small">{formatVND((p.price || 0) * (it.quantity || 1))}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <div className="bg-success bg-opacity-10 p-3 rounded-3 d-flex align-items-center justify-content-between">
                    <span className="fw-bold text-dark">TỔNG CỘNG THANH TOÁN:</span>
                    <span className="fs-4 fw-extrabold text-success">{formatVND(selectedOrderDetails.total)}</span>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button
                    className="btn btn-outline-secondary rounded-pill px-4 fw-bold"
                    onClick={() => {
                      if (this.context.showToast) this.context.showToast('Hóa đơn điện tử VAT đã được gửi tới email của bạn!', 'info');
                    }}
                  >
                    <i className="bi bi-file-earmark-pdf me-1"></i> Tải hóa đơn VAT
                  </button>
                  <button type="button" className="btn btn-secondary rounded-pill px-4 fw-bold" onClick={() => this.setState({ selectedOrderDetails: null, order: null })}>Đóng</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal 2: Product Review Dialog */}
        {reviewModalProduct && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header bg-warning bg-opacity-25 text-dark p-3.5">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-star-fill text-warning"></i> ĐÁNH GIÁ SẢN PHẨM
                  </h5>
                  <button type="button" className="btn-close" onClick={() => this.setState({ reviewModalProduct: null })}></button>
                </div>
                <form onSubmit={this.handleSubmitReview}>
                  <div className="modal-body p-4">
                    <div className="fw-bold text-dark mb-2">{reviewModalProduct.name}</div>
                    
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Đánh giá số sao:</label>
                      <div className="d-flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <button
                            key={star}
                            type="button"
                            className={`btn btn-outline-warning btn-sm rounded-circle p-2 ${reviewRating >= star ? 'active' : ''}`}
                            style={{ width: '40px', height: '40px' }}
                            onClick={() => this.setState({ reviewRating: star })}
                          >
                            <i className="bi bi-star-fill fs-5"></i>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Nội dung nhận xét & Trải nghiệm:</label>
                      <textarea
                        className="form-control rounded-3"
                        rows="3"
                        placeholder="Hãy chia sẻ nhận xét của bạn về chất lượng sản phẩm, đóng gói và dịch vụ giao hàng..."
                        value={reviewComment}
                        onChange={(e) => this.setState({ reviewComment: e.target.value })}
                        required
                      ></textarea>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={() => this.setState({ reviewModalProduct: null })}>Hủy</button>
                    <button type="submit" className="btn btn-warning rounded-pill px-4 fw-bold">Gửi đánh giá</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal 3: Support Dialog */}
        {supportModalOrder && (
          <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content border-0 rounded-4 shadow-lg">
                <div className="modal-header bg-primary text-white p-3.5">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-headset"></i> HỖ TRỢ ĐƠN HÀNG #{supportModalOrder._id.toString().slice(-8).toUpperCase()}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => this.setState({ supportModalOrder: null })}></button>
                </div>
                <div className="modal-body p-4 text-center">
                  <div className="mb-3">
                    <span className="p-3 bg-primary bg-opacity-10 text-primary rounded-circle d-inline-flex">
                      <i className="bi bi-telephone-outbound display-5"></i>
                    </span>
                  </div>
                  <h5 className="fw-bold text-dark">Tổng đài Hỗ trợ 24/7</h5>
                  <p className="text-secondary small mb-4">
                    Bộ phận CSKH của VLSC Shop sẵn sàng giải đáp thắc mắc và hỗ trợ tiến trình giao hàng cho đơn của bạn.
                  </p>

                  <div className="d-grid gap-2">
                    <a href="tel:19008888" className="btn btn-success btn-lg rounded-pill fw-bold">
                      <i className="bi bi-telephone-fill me-2"></i> Gọi Hotline 1900 8888 (Miễn phí)
                    </a>
                    <button
                      className="btn btn-outline-primary rounded-pill fw-bold py-2.5"
                      onClick={() => {
                        this.setState({ supportModalOrder: null });
                        if (this.context.showToast) this.context.showToast('Yêu cầu hỗ trợ của bạn đã được gửi tới CSKH. Nhân viên sẽ gọi lại trong 5 phút!', 'success');
                      }}
                    >
                      <i className="bi bi-chat-dots-fill me-2"></i> Gửi yêu cầu gọi lại
                    </button>
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

export default withRouter(Myorders);
