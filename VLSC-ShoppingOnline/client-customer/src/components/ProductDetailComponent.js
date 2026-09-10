import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import { formatVND, formatPriceDiscount } from '../utils/formatCurrency';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      product: null,
      relatedProducts: [],
      recentlyViewed: [],
      txtQuantity: 1,
      selectedImageIndex: 0,
      activeTab: 'specs', // 'specs', 'warranty', 'faq', 'reviews'
      loading: true,
      wishlistIds: [],
      copiedCoupon: false
    };
  }

  // event-handlers
  btnAdd2CartClick(e) {
    if (e) e.preventDefault();
    const product = this.state.product;
    const quantity = parseInt(this.state.txtQuantity);
    if (quantity) {
      const mycart = this.context.mycart;
      const index = mycart.findIndex(x => x.product._id === product._id); // check if the _id exists in mycart
      if (index === -1) { // not found, push newItem
        const newItem = { product: product, quantity: quantity };
        mycart.push(newItem);
      } else { // increasing the quantity
        mycart[index].quantity += quantity;
      }
      this.context.setMycart(mycart);
      alert('OK BABY!');
    } else {
      alert('Please input quantity');
    }
  }

  handleAddToCart = (prod, e) => {
    this.btnAdd2CartClick(e);
  };

  handleBuyNow = (prod, e) => {
    if (e) e.preventDefault();
    const product = this.state.product;
    const quantity = parseInt(this.state.txtQuantity);
    if (quantity) {
      const mycart = this.context.mycart;
      const index = mycart.findIndex(x => x.product._id === product._id);
      if (index === -1) {
        const newItem = { product: product, quantity: quantity };
        mycart.push(newItem);
      } else {
        mycart[index].quantity += quantity;
      }
      this.context.setMycart(mycart);
    }
    this.props.navigate('/mycart');
  };

  componentDidMount() {
    const params = this.props.params;
    this.apiGetProduct(params.id);
    this.loadWishlist();
    this.loadRecentlyViewed();
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;
    if (params.id !== prevProps.params.id) {
      this.setState({ selectedImageIndex: 0, activeTab: 'specs' });
      this.apiGetProduct(params.id);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  loadWishlist() {
    try {
      const saved = JSON.parse(localStorage.getItem('vlsc_wishlist') || '[]');
      this.setState({ wishlistIds: saved.map(p => p._id || p) });
    } catch (e) {
      this.setState({ wishlistIds: [] });
    }
  }

  toggleWishlist(product, e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    try {
      let saved = JSON.parse(localStorage.getItem('vlsc_wishlist') || '[]');
      const existsIndex = saved.findIndex(p => (p._id || p) === product._id);
      if (existsIndex >= 0) {
        saved.splice(existsIndex, 1);
      } else {
        saved.push({
          _id: product._id,
          name: product.name,
          price: product.price,
          image: product.images && product.images.length > 0 ? product.images[0] : product.image,
          rating: product.rating || 4.9,
          soldCount: product.soldCount || 120
        });
      }
      localStorage.setItem('vlsc_wishlist', JSON.stringify(saved));
      this.setState({ wishlistIds: saved.map(p => p._id || p) });
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  }

  saveRecentlyViewed(product) {
    try {
      let list = JSON.parse(localStorage.getItem('vlsc_recently_viewed') || '[]');
      list = list.filter(p => p._id !== product._id);
      list.unshift({
        _id: product._id,
        name: product.name,
        price: product.price,
        image: product.images && product.images.length > 0 ? product.images[0] : product.image,
        rating: product.rating || 4.9,
        soldCount: product.soldCount || 120
      });
      if (list.length > 6) list = list.slice(0, 6);
      localStorage.setItem('vlsc_recently_viewed', JSON.stringify(list));
      this.setState({ recentlyViewed: list.filter(p => p._id !== product._id) });
    } catch (e) {}
  }

  loadRecentlyViewed() {
    try {
      const list = JSON.parse(localStorage.getItem('vlsc_recently_viewed') || '[]');
      this.setState({ recentlyViewed: list });
    } catch (e) {}
  }

  apiGetProduct(id) {
    this.setState({ loading: true });
    axios.get('/api/customer/products/' + id).then((res) => {
      const prod = res.data;
      this.setState({ product: prod, loading: false });
      if (prod) {
        this.saveRecentlyViewed(prod);
        this.apiGetRelated(id);
      }
    }).catch(() => {
      this.setState({ loading: false });
    });
  }

  apiGetRelated(id) {
    axios.get('/api/customer/products/' + id + '/related').then((res) => {
      this.setState({ relatedProducts: Array.isArray(res.data) ? res.data : [] });
    }).catch(() => {});
  }

  getProductImages(prod) {
    if (prod.images && prod.images.length > 0) {
      return prod.images;
    }
    if (prod.image) {
      const src = prod.image.startsWith('http') ? prod.image : "data:image/jpg;base64," + prod.image;
      return [src, src, src];
    }
    return ['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'];
  }

  copyCoupon(code) {
    navigator.clipboard.writeText(code);
    this.setState({ copiedCoupon: true });
    setTimeout(() => this.setState({ copiedCoupon: false }), 2500);
  }

  render() {
    const prod = this.state.product;
    if (prod != null) {
      const images = this.getProductImages(prod);
      const activeImage = images[this.state.selectedImageIndex] || images[0];
      const isWishlisted = this.state.wishlistIds.includes(prod._id);
      const angleLabels = ['Mặt trước', 'Mặt sau', 'Hộp & Phụ kiện', 'Chi tiết'];

      return (
        <div className="py-3">
          {/* Breadcrumbs Navigation */}
          <nav aria-label="breadcrumb" className="mb-3">
            <ol className="breadcrumb">
              <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none fw-semibold">Trang chủ</Link></li>
              <li className="breadcrumb-item">
                <Link to={'/product/category/' + (prod.category ? prod.category._id : 'all')} className="text-secondary text-decoration-none fw-semibold">
                  {prod.category ? prod.category.name : 'Sản phẩm'}
                </Link>
              </li>
              <li className="breadcrumb-item active text-dark fw-bold text-truncate" style={{ maxWidth: '280px' }} aria-current="page">
                {prod.name}
              </li>
            </ol>
          </nav>

          {/* Main Product Showcase Card */}
          <div className="product-detail-card p-4 p-md-5 mb-5 rounded-4 shadow-sm bg-white border">
            <div className="row g-5">
              {/* Product Multi-Angle Image Gallery Column */}
              <div className="col-lg-6">
                <div className="product-gallery-container">
                  <div className="product-detail-img-box position-relative mb-3 rounded-4 overflow-hidden border bg-light">
                    <span className="badge bg-success position-absolute top-0 start-0 m-3 px-3 py-2 rounded-pill fw-bold shadow-sm z-2">
                      <i className="bi bi-patch-check-fill me-1"></i> Chính hãng 100%
                    </span>

                    <button
                      className={`btn-wishlist-detail position-absolute top-0 end-0 m-3 rounded-circle border-0 shadow-sm ${isWishlisted ? 'text-danger bg-white' : 'text-secondary bg-white'}`}
                      onClick={(e) => this.toggleWishlist(prod, e)}
                      title={isWishlisted ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                      <i className={`bi ${isWishlisted ? 'bi-heart-fill' : 'bi-heart'} fs-5`}></i>
                    </button>

                    <img
                      src={activeImage}
                      alt={prod.name}
                      className="img-fluid w-100 object-fit-contain p-4 gallery-main-img"
                      style={{ maxHeight: '420px', minHeight: '320px', transition: 'transform 0.3s ease' }}
                    />
                  </div>

                  {/* Thumbnail Angle Selectors (Tối thiểu 3 góc ảnh) */}
                  <div className="d-flex align-items-center gap-2 justify-content-center flex-wrap">
                    {images.map((img, idx) => (
                      <button
                        key={idx}
                        type="button"
                        className={`gallery-thumb-btn border rounded-3 p-1 position-relative ${this.state.selectedImageIndex === idx ? 'border-success border-2 shadow-sm' : 'border-light-subtle'}`}
                        style={{ width: '82px', height: '82px', background: '#fff' }}
                        onClick={() => this.setState({ selectedImageIndex: idx })}
                      >
                        <img src={img} alt={`Góc ${idx + 1}`} className="w-100 h-100 object-fit-cover rounded-2" />
                        <span className="thumb-angle-label badge bg-dark bg-opacity-75 position-absolute bottom-0 start-50 translate-middle-x mb-1" style={{ fontSize: '9px', whiteSpace: 'nowrap' }}>
                          {angleLabels[idx] || `Góc ${idx + 1}`}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Product Info & Purchase Column */}
              <div className="col-lg-6">
                <div className="d-flex align-items-center gap-2 mb-2">
                  <span className="badge bg-success-subtle text-success fw-bold px-3 py-1.5 rounded-pill border border-success-subtle">
                    <i className="bi bi-tag-fill me-1"></i> {prod.category ? prod.category.name : 'Thiết bị điện tử'}
                  </span>
                  <span className="badge bg-primary-subtle text-primary fw-bold px-3 py-1.5 rounded-pill border border-primary-subtle">
                    {prod.brand || 'Apple'}
                  </span>
                  <span className="text-muted small fw-semibold ms-auto">
                    <i className="bi bi-shield-check text-success me-1"></i> Sẵn sàng giao ngay
                  </span>
                </div>

                <h1 className="h2 fw-extrabold text-dark mb-2" style={{ lineHeight: '1.3' }}>
                  {prod.name}
                </h1>

                {/* Rating & Sold Counter */}
                <div className="d-flex align-items-center gap-3 mb-3 pb-2 border-bottom">
                  <div className="d-flex align-items-center text-warning gap-1 fw-bold">
                    <i className="bi bi-star-fill"></i>
                    <span className="text-dark fs-6">{prod.rating ? prod.rating.toFixed(1) : '4.9'}</span>
                    <span className="text-muted small fw-normal">({prod.ratingCount || 142} đánh giá)</span>
                  </div>
                  <span className="text-muted">•</span>
                  <div className="text-secondary small fw-semibold">
                    <i className="bi bi-bag-check-fill text-success me-1"></i>
                    Đã bán <strong className="text-dark">{prod.soldCount || 856}</strong> chiếc
                  </div>
                </div>

                {/* Price Display */}
                <div className="product-price-box p-3 rounded-3 bg-light mb-4 d-flex align-items-baseline gap-3 flex-wrap">
                  <span className="display-6 fw-extrabold text-success">
                    {formatVND(prod.price)}
                  </span>
                  <span className="text-muted text-decoration-line-through small fs-6">
                    {formatPriceDiscount(prod.price, 15)}
                  </span>
                  <span className="badge bg-danger text-white fw-bold rounded-pill px-2.5 py-1 small">
                    Tiết kiệm 15%
                  </span>
                </div>

                {/* Voucher Box for Customer (First Purchase Retention) */}
                <div className="coupon-box-compact p-3 rounded-3 mb-4 border border-warning border-opacity-50 bg-warning-subtle d-flex align-items-center justify-content-between">
                  <div>
                    <div className="fw-bold text-dark small mb-0.5">
                      <i className="bi bi-gift-fill text-warning me-1.5"></i> Mã giảm giá dành cho bạn:
                    </div>
                    <div className="text-secondary" style={{ fontSize: '12px' }}>
                      Nhập <strong className="text-dark">VLSCNEW</strong> giảm 100k cho đơn từ 1.000.000 ₫
                    </div>
                  </div>
                  <button
                    className="btn btn-sm btn-dark rounded-pill px-3 fw-bold"
                    onClick={() => this.copyCoupon('VLSCNEW')}
                  >
                    {this.state.copiedCoupon ? '✓ Đã chép' : 'Sao chép'}
                  </button>
                </div>

                {/* Storage / Version selector if available */}
                {prod.storage && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-dark small mb-1.5">Dung lượng / Phiên bản:</label>
                    <div className="d-flex gap-2">
                      <span className="btn btn-sm btn-outline-success active rounded-pill px-3 py-1.5 fw-bold">
                        {prod.storage}
                      </span>
                    </div>
                  </div>
                )}

                {/* Quantity selector */}
                <div className="mb-4">
                  <label className="form-label fw-bold text-dark small mb-2">Số lượng:</label>
                  <div className="quantity-control-group">
                    <button
                      type="button"
                      onClick={() => this.setState({ txtQuantity: Math.max(1, parseInt(this.state.txtQuantity) - 1) })}
                      aria-label="Giảm số lượng"
                    >
                      <i className="bi bi-dash"></i>
                    </button>
                    <input
                      type="number"
                      min="1"
                      max="99"
                      value={this.state.txtQuantity}
                      onChange={(e) => { this.setState({ txtQuantity: e.target.value }) }}
                    />
                    <button
                      type="button"
                      onClick={() => this.setState({ txtQuantity: parseInt(this.state.txtQuantity || 1) + 1 })}
                      aria-label="Tăng số lượng"
                    >
                      <i className="bi bi-plus"></i>
                    </button>
                  </div>
                </div>

                {/* Call to Action Buttons */}
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <button
                    className="btn btn-success btn-lg rounded-pill px-4 py-3 fw-bold d-flex align-items-center gap-2 shadow flex-grow-1 justify-content-center"
                    onClick={(e) => this.handleAddToCart(prod, e)}
                  >
                    <i className="bi bi-cart-plus-fill fs-5"></i> Thêm vào giỏ hàng
                  </button>
                  <button
                    className="btn btn-outline-success btn-lg rounded-pill px-4 py-3 fw-bold flex-grow-1 justify-content-center"
                    onClick={(e) => this.handleBuyNow(prod, e)}
                  >
                    Mua ngay (Giao 2H)
                  </button>
                </div>

                {/* Trust and Policy Badges */}
                <div className="row g-3 pt-3 border-top text-secondary small">
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <i className="bi bi-truck text-success fs-5"></i>
                    <span>Miễn phí vận chuyển toàn quốc</span>
                  </div>
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <i className="bi bi-arrow-counterclockwise text-success fs-5"></i>
                    <span>1 đổi 1 trong 30 ngày đầu</span>
                  </div>
                  <div className="col-sm-4 d-flex align-items-center gap-2">
                    <i className="bi bi-shield-check text-success fs-5"></i>
                    <span>Bảo hành chính hãng 12 tháng</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Content Tabs Section (Thông số kỹ thuật / Chính sách bảo hành / FAQ / Đánh giá) */}
          <div className="product-tabs-container mb-5 bg-white rounded-4 shadow-sm border p-4 p-md-5">
            <ul className="nav nav-pills product-detail-nav-pills gap-2 mb-4 border-bottom pb-3">
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 ${this.state.activeTab === 'specs' ? 'active bg-success text-white' : 'text-secondary'}`}
                  onClick={() => this.setState({ activeTab: 'specs' })}
                >
                  <i className="bi bi-cpu me-1.5"></i> Thông số kỹ thuật
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 ${this.state.activeTab === 'warranty' ? 'active bg-success text-white' : 'text-secondary'}`}
                  onClick={() => this.setState({ activeTab: 'warranty' })}
                >
                  <i className="bi bi-shield-lock me-1.5"></i> Chính sách bảo hành
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 ${this.state.activeTab === 'faq' ? 'active bg-success text-white' : 'text-secondary'}`}
                  onClick={() => this.setState({ activeTab: 'faq' })}
                >
                  <i className="bi bi-question-circle me-1.5"></i> Câu hỏi thường gặp (FAQ)
                </button>
              </li>
              <li className="nav-item">
                <button
                  className={`nav-link rounded-pill fw-bold px-4 py-2 ${this.state.activeTab === 'reviews' ? 'active bg-success text-white' : 'text-secondary'}`}
                  onClick={() => this.setState({ activeTab: 'reviews' })}
                >
                  <i className="bi bi-chat-heart me-1.5"></i> Đánh giá khách hàng ({prod.reviews ? prod.reviews.length : 2})
                </button>
              </li>
            </ul>

            {/* Tab 1: Tech Specs */}
            {this.state.activeTab === 'specs' && (
              <div className="tab-pane-content">
                <h5 className="fw-bold text-dark mb-3">Bảng thông số kỹ thuật chi tiết:</h5>
                <div className="table-responsive">
                  <table className="table table-striped table-bordered align-middle">
                    <tbody>
                      {prod.specs ? Object.entries(prod.specs).map(([key, val], idx) => (
                        <tr key={idx}>
                          <th className="text-secondary fw-semibold bg-light" style={{ width: '30%' }}>{key}</th>
                          <td className="text-dark fw-medium">{val}</td>
                        </tr>
                      )) : (
                        <>
                          <tr>
                            <th className="text-secondary bg-light" style={{ width: '30%' }}>Thương hiệu</th>
                            <td className="text-dark fw-medium">{prod.brand || 'Apple'}</td>
                          </tr>
                          <tr>
                            <th className="text-secondary bg-light">Dung lượng</th>
                            <td className="text-dark fw-medium">{prod.storage || '128 GB'}</td>
                          </tr>
                          <tr>
                            <th className="text-secondary bg-light">Tình trạng</th>
                            <td className="text-dark fw-medium">Mới 100% Nguyên Seal Hộp</td>
                          </tr>
                          <tr>
                            <th className="text-secondary bg-light">Phụ kiện kèm theo</th>
                            <td className="text-dark fw-medium">Thân máy, Cáp sạc Type-C, Sách hướng dẫn sử dụng, Cây lấy sim</td>
                          </tr>
                        </>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Tab 2: Warranty Policy */}
            {this.state.activeTab === 'warranty' && (
              <div className="tab-pane-content">
                <h5 className="fw-bold text-dark mb-3">Chính sách bảo hành & Quyền lợi khách hàng tại VLSC Shop:</h5>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="p-3.5 rounded-3 border bg-light h-100">
                      <h6 className="fw-bold text-success mb-2"><i className="bi bi-patch-check-fill me-2"></i>1 Đổi 1 Trong 30 Ngày Đầu</h6>
                      <p className="small text-secondary mb-0">
                        Áp dụng đối với tất cả sản phẩm gặp lỗi phần cứng do nhà sản xuất. Quý khách được đổi ngay máy mới nguyên seal cùng mẫu mã mà không mất bất kỳ chi phí nào.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3.5 rounded-3 border bg-light h-100">
                      <h6 className="fw-bold text-success mb-2"><i className="bi bi-shield-shaded me-2"></i>Bảo Hành 12 Tháng Toàn Diện</h6>
                      <p className="small text-secondary mb-0">
                        {prod.warranty || 'Bảo hành chính hãng tại tất cả Trung tâm bảo hành ủy quyền trên toàn quốc. Hỗ trợ tiếp nhận bảo hành tận nhà miễn phí.'}
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3.5 rounded-3 border bg-light h-100">
                      <h6 className="fw-bold text-success mb-2"><i className="bi bi-box-seam-fill me-2"></i>Quy Trình Đồng Kiểm Khi Nhận Hàng</h6>
                      <p className="small text-secondary mb-0">
                        Khách hàng được quyền mở hộp kiểm tra ngoại quan máy, phụ kiện và tem bảo hành trước khi thanh toán tiền cho nhân viên giao hàng.
                      </p>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="p-3.5 rounded-3 border bg-light h-100">
                      <h6 className="fw-bold text-success mb-2"><i className="bi bi-tools me-2"></i>Hỗ Trợ Kỹ Thuật Trọn Đời</h6>
                      <p className="small text-secondary mb-0">
                        Miễn phí cài đặt phần mềm, vệ sinh máy định kỳ và tư vấn chuyển đổi dữ liệu từ thiết bị cũ sang máy mới.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: FAQ */}
            {this.state.activeTab === 'faq' && (
              <div className="tab-pane-content">
                <h5 className="fw-bold text-dark mb-3">Câu hỏi thường gặp:</h5>
                <div className="accordion" id="faqAccordion">
                  {(prod.faq && prod.faq.length > 0 ? prod.faq : [
                    { q: 'Sản phẩm có đầy đủ hóa đơn VAT điện tử không?', a: 'Tất cả sản phẩm tại VLSC Shop đều được xuất hóa đơn VAT điện tử đầy đủ theo đúng quy định pháp luật Việt Nam.' },
                    { q: 'Thời gian giao hàng mất bao lâu?', a: 'Nội thành TP.HCM và Hà Nội giao hỏa tốc từ 2 đến 4 giờ. Các tỉnh thành khác giao nhanh trong 24 - 48 giờ làm việc.' },
                    { q: 'Cửa hàng có hỗ trợ trả góp 0% không?', a: 'Có, VLSC hỗ trợ trả góp 0% lãi suất qua thẻ tín dụng hơn 25 ngân hàng hoặc qua công ty tài chính Home Credit, FE Credit.' }
                  ]).map((item, idx) => (
                    <div className="accordion-item mb-2 border rounded-3 overflow-hidden" key={idx}>
                      <h2 className="accordion-header">
                        <button className="accordion-button collapsed fw-bold text-dark" type="button" data-bs-toggle="collapse" data-bs-target={`#faq-${idx}`}>
                          <i className="bi bi-question-circle text-success me-2"></i> {item.q}
                        </button>
                      </h2>
                      <div id={`#faq-${idx}`} className="accordion-collapse collapse show">
                        <div className="accordion-body text-secondary small">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tab 4: Reviews */}
            {this.state.activeTab === 'reviews' && (
              <div className="tab-pane-content">
                <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom flex-wrap gap-2">
                  <div>
                    <h5 className="fw-bold text-dark mb-1">Đánh giá từ khách hàng đã mua:</h5>
                    <div className="d-flex align-items-center gap-2">
                      <div className="text-warning fs-5">
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                        <i className="bi bi-star-fill"></i>
                      </div>
                      <span className="fw-bold text-dark fs-5">{prod.rating ? prod.rating.toFixed(1) : '4.9'} / 5.0</span>
                      <span className="text-muted small">({prod.ratingCount || 142} lượt đánh giá)</span>
                    </div>
                  </div>
                  <button className="btn btn-outline-success rounded-pill px-4 fw-bold">
                    <i className="bi bi-pencil-square me-1"></i> Viết đánh giá
                  </button>
                </div>

                <div className="review-list d-flex flex-column gap-3">
                  {(prod.reviews && prod.reviews.length > 0 ? prod.reviews : [
                    { user: 'Trần Văn Hoàng', rating: 5, comment: 'Máy nguyên seal, bảo hành chuẩn Apple Care. Mua đợt flash sale giá cực tốt, giao hàng trong 2 tiếng.', date: '04/08/2026', verified: true },
                    { user: 'Lê Thu Thảo', rating: 5, comment: 'Màu sắc rất đẹp, chụp hình góc rộng siêu nét. Nhân viên tư vấn nhiệt tình, đóng gói 3 lớp bóng khí rất kỹ.', date: '28/07/2026', verified: true }
                  ]).map((rev, idx) => (
                    <div className="review-item p-3 rounded-3 bg-light border" key={idx}>
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 bg-success text-white rounded-circle fw-bold d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                            {rev.user.charAt(0)}
                          </div>
                          <div>
                            <div className="fw-bold text-dark small">{rev.user}</div>
                            {rev.verified && (
                              <span className="badge bg-success-subtle text-success border border-success-subtle" style={{ fontSize: '10px' }}>
                                <i className="bi bi-check-circle-fill me-1"></i> Đã mua hàng tại VLSC
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="text-muted small">{rev.date}</span>
                      </div>
                      <div className="text-warning small mb-1.5">
                        {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                          <i key={i} className="bi bi-star-fill me-1"></i>
                        ))}
                      </div>
                      <p className="text-secondary small mb-0">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Related Products Section (Sản phẩm liên quan) */}
          {this.state.relatedProducts.length > 0 && (
            <section className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="section-title mb-0">
                  <i className="bi bi-link-45deg text-success"></i> SẢN PHẨM LIÊN QUAN
                </h3>
              </div>
              <div className="product-grid">
                {this.state.relatedProducts.map(rel => (
                  <div key={rel._id} className="product-card">
                    <div className="product-img-wrapper">
                      <Link to={'/product/' + rel._id}>
                        <img
                          src={rel.images && rel.images.length > 0 ? rel.images[0] : (rel.image && rel.image.startsWith('http') ? rel.image : "data:image/jpg;base64," + rel.image)}
                          alt={rel.name}
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    <div className="product-info">
                      <h6 className="product-name" title={rel.name}>{rel.name}</h6>
                      <p className="price-text">{formatVND(rel.price)}</p>
                      <Link to={'/product/' + rel._id} className="btn-view-product">
                        <i className="bi bi-eye-fill"></i> Xem chi tiết
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Recently Viewed Products Section (Đã xem gần đây) */}
          {this.state.recentlyViewed.length > 0 && (
            <section className="mb-5">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h3 className="section-title mb-0">
                  <i className="bi bi-clock-history text-success"></i> SẢN PHẨM BẠN ĐÃ XEM GẦN ĐÂY
                </h3>
              </div>
              <div className="product-grid">
                {this.state.recentlyViewed.map(item => (
                  <div key={item._id} className="product-card">
                    <div className="product-img-wrapper">
                      <Link to={'/product/' + item._id}>
                        <img
                          src={item.image && item.image.startsWith('http') ? item.image : "data:image/jpg;base64," + item.image}
                          alt={item.name}
                          loading="lazy"
                        />
                      </Link>
                    </div>
                    <div className="product-info">
                      <h6 className="product-name" title={item.name}>{item.name}</h6>
                      <p className="price-text">{formatVND(item.price)}</p>
                      <Link to={'/product/' + item._id} className="btn-view-product">
                        <i className="bi bi-eye-fill"></i> Xem lại
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Sticky Mobile Action Bar (Tối ưu chuyển đổi di động) */}
          <div className="sticky-mobile-action-bar d-lg-none position-fixed bottom-0 start-0 w-100 p-2.5 bg-white border-top shadow-lg z-3">
            <div className="container d-flex align-items-center justify-content-between gap-2">
              <div>
                <div className="text-muted small" style={{ fontSize: '11px' }}>Giá ưu đãi:</div>
                <div className="fw-extrabold text-success fs-6">{formatVND(prod.price)}</div>
              </div>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-success btn-sm rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1"
                  onClick={(e) => this.handleAddToCart(prod, e)}
                >
                  <i className="bi bi-cart-plus"></i> Thêm giỏ
                </button>
                <button
                  className="btn btn-success btn-sm rounded-pill px-3 py-2 fw-bold"
                  onClick={(e) => this.handleBuyNow(prod, e)}
                >
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="text-center py-5">
        <div className="spinner-border text-success" role="status">
          <span className="visually-hidden">Đang tải thông tin chi tiết...</span>
        </div>
      </div>
    );
  }
}

export default withRouter(ProductDetail);
