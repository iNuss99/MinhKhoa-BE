import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import { formatVND, formatPriceDiscount } from '../utils/formatCurrency';
import { SHOP_CONFIG } from '../utils/shopConfig';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newprods: [],
      hotprods: [],
      categories: [],
      recentlyViewed: [],
      wishlistItems: [],
      wishlistIds: [],
      currentSlide: 0,
      copiedCoupon: null,
      abVariant: 'A', // 'A' or 'B'
      loading: true
    };
    this.timer = null;
  }

  componentDidMount() {
    this.initABTesting();
    this.apiGetNewProducts();
    this.apiGetHotProducts();
    this.apiGetCategories();
    this.loadUserData();

    // Auto rotate hero carousel every 5s
    this.timer = setInterval(() => {
      this.setState(prevState => ({
        currentSlide: (prevState.currentSlide + 1) % 3
      }));
    }, 5000);

    window.addEventListener('storage', () => this.loadUserData());
  }

  componentWillUnmount() {
    if (this.timer) clearInterval(this.timer);
    window.removeEventListener('storage', () => this.loadUserData());
  }

  initABTesting() {
    let variant = sessionStorage.getItem('vlsc_cta_ab_variant');
    if (!variant) {
      variant = Math.random() > 0.5 ? 'B' : 'A';
      sessionStorage.setItem('vlsc_cta_ab_variant', variant);
    }
    this.setState({ abVariant: variant });
  }

  handleCtaClick() {
    const count = parseInt(sessionStorage.getItem(`vlsc_cta_click_${this.state.abVariant}`) || '0') + 1;
    sessionStorage.setItem(`vlsc_cta_click_${this.state.abVariant}`, count.toString());
  }

  loadUserData() {
    try {
      const wish = JSON.parse(localStorage.getItem('vlsc_wishlist') || '[]');
      const recent = JSON.parse(localStorage.getItem('vlsc_recently_viewed') || '[]');
      this.setState({
        wishlistItems: wish,
        wishlistIds: wish.map(p => p._id || p),
        recentlyViewed: recent
      });
    } catch (e) {}
  }

  toggleWishlist(product, e) {
    e.preventDefault();
    e.stopPropagation();
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
      this.setState({
        wishlistItems: saved,
        wishlistIds: saved.map(p => p._id || p)
      });
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  }

  copyCoupon(code) {
    navigator.clipboard.writeText(code);
    this.setState({ copiedCoupon: code });
    setTimeout(() => this.setState({ copiedCoupon: null }), 2500);
  }

  renderProductCard(item, badgeType = 'NEW') {
    const isWishlisted = this.state.wishlistIds.includes(item._id);
    const imgSource = (item.images && item.images.length > 0)
      ? item.images[0]
      : (item.image && item.image.startsWith('http') ? item.image : "data:image/jpg;base64," + item.image);

    return (
      <div key={item._id} className="product-card position-relative">
        <div className="product-img-wrapper">
          <span className={`badge-tag ${badgeType === 'HOT' ? 'badge-hot' : 'badge-new'}`}>
            {badgeType}
          </span>

          {/* Wishlist Button */}
          <button
            className={`btn-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
            title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
            onClick={(e) => this.toggleWishlist(item, e)}
          >
            <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
          </button>

          <Link to={'/product/' + item._id}>
            <img
              src={imgSource}
              alt={item.name}
              loading="lazy"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';
              }}
            />
          </Link>
        </div>

        <div className="product-info">
          <div className="d-flex align-items-center justify-content-between mb-1">
            <span className="product-brand-tag">{item.brand || (item.category ? item.category.name : 'Apple')}</span>
            <div className="product-rating-stars">
              <i className="bi bi-star-fill text-warning"></i>
              <span>{item.rating ? item.rating.toFixed(1) : '4.9'}</span>
              <span className="text-muted small ms-1">({item.soldCount || 120}+ đã bán)</span>
            </div>
          </div>

          <h6 className="product-name" title={item.name}>{item.name}</h6>

          <div className="d-flex align-items-baseline gap-2 mb-2">
            <span className="price-text">{formatVND(item.price)}</span>
            <span className="text-muted text-decoration-line-through small" style={{ fontSize: '12px' }}>
              {formatPriceDiscount(item.price, 12)}
            </span>
          </div>

          <Link to={'/product/' + item._id} className="btn-view-product">
            <i className="bi bi-eye-fill"></i> Xem chi tiết
          </Link>
        </div>
      </div>
    );
  }

  renderHeroSlides() {
    const slides = [
      {
        tag: 'Flagship 2026 • Apple Chính Hãng',
        tagIcon: 'bi-stars text-success',
        titlePrefix: 'iPhone 16 Pro Max',
        highlightText: 'Đỉnh Cao Titanium Mới',
        desc: 'Khung viền Titanium cấp hàng không vũ trụ siêu nhẹ. Sức mạnh đột phá từ Chip Apple A18 Pro và nút Camera Control thế hệ mới.',
        specs: [
          { icon: 'bi-cpu-fill', label: 'Chip A18 Pro 3nm' },
          { icon: 'bi-camera-fill', label: 'Camera Control 48MP' },
          { icon: 'bi-battery-charging', label: 'Pin 33 Giờ' },
          { icon: 'bi-percent', label: 'Trả Góp 0%' }
        ],
        primaryBtn: 'Khám Phá Ngay',
        primaryLink: '#new-products',
        secondaryBtnA: 'Xem Khuyến Mãi 🔥',
        secondaryBtnB: 'Săn Deal Giảm 4 Triệu ⚡',
        productImg: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
        productName: 'iPhone 16 Pro Max 256GB',
        productPrice: '28.990.000 ₫',
        badgeTop: {
          icon: 'bi-cpu-fill',
          iconBg: 'rgba(99, 102, 241, 0.1)',
          iconColor: '#6366f1',
          title: 'Chip A18 Pro',
          subtitle: 'Ray Tracing phần cứng'
        },
        badgeBottom: {
          icon: 'bi-shield-fill-check',
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10b981',
          title: 'Trợ Giá 4.000.000 ₫',
          subtitle: 'Thu cũ đổi mới lên đời'
        }
      },
      {
        tag: 'Chuyên Gia Đồ Họa & Lập Trình',
        tagIcon: 'bi-laptop text-primary',
        titlePrefix: 'MacBook Pro M3 Max',
        highlightText: 'Sức Mạnh Không Đối Thủ',
        desc: 'Hiệu năng đồ họa đỉnh cao với chip Apple Silicon M3 Max, màn hình Liquid Retina XDR 120Hz và pin 22 giờ liên tục.',
        specs: [
          { icon: 'bi-lightning-charge-fill', label: 'Apple M3 Max 16-Core' },
          { icon: 'bi-display', label: 'Liquid Retina XDR' },
          { icon: 'bi-battery-full', label: 'Pin 22 Giờ' },
          { icon: 'bi-gift-fill', label: 'Tặng Hub & Túi Da' }
        ],
        primaryBtn: 'Xem Bảng Giá Mac',
        primaryLink: '#hot-products',
        secondaryBtnA: 'Xem Khuyến Mãi 🔥',
        secondaryBtnB: 'Giảm Ngay 5 Triệu ⚡',
        productImg: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80',
        productName: 'MacBook Pro 16" M3 Max',
        productPrice: '39.990.000 ₫',
        badgeTop: {
          icon: 'bi-display',
          iconBg: 'rgba(14, 165, 233, 0.1)',
          iconColor: '#0ea5e9',
          title: 'Liquid Retina XDR',
          subtitle: 'Độ sáng đỉnh 1600 nits'
        },
        badgeBottom: {
          icon: 'bi-gift-fill',
          iconBg: 'rgba(245, 158, 11, 0.1)',
          iconColor: '#f59e0b',
          title: 'Combo VIP 2 Triệu',
          subtitle: 'Túi chống sốc da & Cáp C'
        }
      },
      {
        tag: 'Sáng Tạo & Giải Trí Đỉnh Cao',
        tagIcon: 'bi-magic text-danger',
        titlePrefix: 'iPad Pro M4 & AirPods Max',
        highlightText: 'Siêu Mỏng 5.1mm Đột Phá',
        desc: 'Màn hình Tandem OLED rực rỡ nhất thế giới kết hợp Apple Pencil Pro và âm thanh Spatial Audio không gian đỉnh cao.',
        specs: [
          { icon: 'bi-palette-fill', label: 'Tandem OLED Kép' },
          { icon: 'bi-pencil-fill', label: 'Apple Pencil Pro' },
          { icon: 'bi-headphones', label: 'Spatial Audio' },
          { icon: 'bi-percent', label: 'Ưu Đãi Học Sinh - SV' }
        ],
        primaryBtn: 'Khám Phá Hệ Sinh Thái',
        primaryLink: '#new-products',
        secondaryBtnA: 'Xem Khuyến Mãi 🔥',
        secondaryBtnB: 'Săn Deal Phụ Kiện ⚡',
        productImg: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800&auto=format&fit=crop&q=80',
        productName: 'iPad Pro 13" M4 Ultra-Thin',
        productPrice: '24.990.000 ₫',
        badgeTop: {
          icon: 'bi-palette-fill',
          iconBg: 'rgba(239, 68, 68, 0.1)',
          iconColor: '#ef4444',
          title: 'Tandem OLED Kép',
          subtitle: 'Chuẩn màu đồ họa P3'
        },
        badgeBottom: {
          icon: 'bi-headphones',
          iconBg: 'rgba(16, 185, 129, 0.1)',
          iconColor: '#10b981',
          title: 'Spatial Audio Dolby',
          subtitle: 'Chống ồn chủ động ANC'
        }
      }
    ];

    const slide = slides[this.state.currentSlide];
    const ctaText = this.state.abVariant === 'B' ? slide.secondaryBtnB : slide.secondaryBtnA;

    return (
      <div
        className="hero-banner position-relative overflow-hidden"
        onMouseEnter={() => { if (this.timer) clearInterval(this.timer); }}
        onMouseLeave={() => {
          if (this.timer) clearInterval(this.timer);
          this.timer = setInterval(() => {
            this.setState(prevState => ({ currentSlide: (prevState.currentSlide + 1) % 3 }));
          }, 5000);
        }}
      >
        {/* Prev / Next Floating Navigation Arrows */}
        <button
          className="hero-nav-arrow hero-nav-prev"
          onClick={() => this.setState({ currentSlide: (this.state.currentSlide - 1 + 3) % 3 })}
          aria-label="Previous Slide"
        >
          <i className="bi bi-chevron-left"></i>
        </button>
        <button
          className="hero-nav-arrow hero-nav-next"
          onClick={() => this.setState({ currentSlide: (this.state.currentSlide + 1) % 3 })}
          aria-label="Next Slide"
        >
          <i className="bi bi-chevron-right"></i>
        </button>

        <div className="row align-items-center g-4 position-relative z-2">
          {/* Left Column: Typography & CTAs */}
          <div className="col-lg-7 pe-lg-4">
            <div className="mb-3">
              <span className="hero-tag-badge">
                <i className={`bi ${slide.tagIcon} fs-6`}></i>
                <span>{slide.tag}</span>
              </span>
            </div>

            <h1 className="hero-heading mb-2.5">
              {slide.titlePrefix}
              <span className="hero-gradient-text">{slide.highlightText}</span>
            </h1>

            <p className="hero-description mb-3.5">
              {slide.desc}
            </p>

            {/* Spec Highlights Row */}
            <div className="hero-specs-row">
              {slide.specs.map((spec, sIdx) => (
                <span className="hero-spec-pill" key={sIdx}>
                  <i className={`bi ${spec.icon}`}></i> {spec.label}
                </span>
              ))}
            </div>

            <div className="d-flex flex-wrap gap-3">
              <a href={slide.primaryLink} className="btn-hero-primary">
                {slide.primaryBtn} <i className="bi bi-arrow-right-short fs-5"></i>
              </a>
              <a
                href="#hot-products"
                className="btn-hero-secondary"
                onClick={() => this.handleCtaClick()}
              >
                {ctaText}
              </a>
            </div>
          </div>

          {/* Right Column: Keynote Showcase Card + Floating Badges */}
          <div className="col-lg-5 d-none d-lg-block">
            <div className="hero-showcase-card">
              {/* Floating Badge Top */}
              <div className="hero-glass-badge hero-badge-top">
                <div className="hero-badge-icon" style={{ backgroundColor: slide.badgeTop.iconBg, color: slide.badgeTop.iconColor }}>
                  <i className={`bi ${slide.badgeTop.icon}`}></i>
                </div>
                <div className="text-start">
                  <div className="hero-badge-title">{slide.badgeTop.title}</div>
                  <div className="hero-badge-subtitle">{slide.badgeTop.subtitle}</div>
                </div>
              </div>

              {/* Central Product Image */}
              <img
                src={slide.productImg}
                alt={slide.productName}
                className="hero-3d-img"
              />

              {/* Floating Price Pill */}
              <div className="hero-price-pill">
                <span>{slide.productName}</span>
                <span className="hero-price-highlight">{slide.productPrice}</span>
              </div>

              {/* Floating Badge Bottom */}
              <div className="hero-glass-badge hero-badge-bottom">
                <div className="hero-badge-icon" style={{ backgroundColor: slide.badgeBottom.iconBg, color: slide.badgeBottom.iconColor }}>
                  <i className={`bi ${slide.badgeBottom.icon}`}></i>
                </div>
                <div className="text-start">
                  <div className="hero-badge-title">{slide.badgeBottom.title}</div>
                  <div className="hero-badge-subtitle">{slide.badgeBottom.subtitle}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Carousel Indicators */}
        <div className="carousel-dots-container d-flex align-items-center justify-content-center gap-2 mt-4 position-relative z-2">
          {[0, 1, 2].map((idx) => (
            <button
              key={idx}
              className={`carousel-dot-btn ${this.state.currentSlide === idx ? 'active' : ''}`}
              onClick={() => this.setState({ currentSlide: idx })}
              aria-label={`Chuyển đến Slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>
    );
  }

  render() {
    const newprods = this.state.newprods.map(item => this.renderProductCard(item, 'NEW'));
    const hotprods = this.state.hotprods.map(item => this.renderProductCard(item, 'HOT'));

    return (
      <div className="py-3">
        {/* Multi-Campaign Hero Carousel with A/B CTA */}
        {this.renderHeroSlides()}

        {/* Voucher Banner (Chương trình mã giảm giá cho khách hàng) */}
        <div className="voucher-banner-strip my-4 p-3 p-md-3.5">
          <div className="row g-3 align-items-center">
            <div className="col-lg-4 d-flex align-items-center gap-3">
              <div className="voucher-icon-box">
                <i className="bi bi-gift-fill"></i>
              </div>
              <div>
                <h6 className="fw-extrabold text-dark mb-1 d-flex align-items-center gap-1">
                  Ưu đãi thành viên mới
                  <span className="badge bg-success-subtle text-success rounded-pill px-2 py-0.5 ms-1" style={{ fontSize: '10px' }}>VIP</span>
                </h6>
                <p className="text-secondary small mb-0">Nhận ngay voucher độc quyền cho đơn hàng đầu tiên</p>
              </div>
            </div>

            <div className="col-lg-8">
              <div className="row g-2">
                {SHOP_CONFIG.coupons.map((c, i) => (
                  <div className="col-sm-6" key={i}>
                    <div className="voucher-ticket-card">
                      <div className="pe-2">
                        <div className="d-flex align-items-center gap-1.5 mb-1">
                          <span className="voucher-code-badge">{c.code}</span>
                          <strong className="text-dark ms-1" style={{ fontSize: '13px' }}>{c.discount}</strong>
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px', lineHeight: '1.3' }}>{c.desc}</div>
                      </div>
                      <button
                        className={`voucher-btn-save ${this.state.copiedCoupon === c.code ? 'copied' : ''}`}
                        onClick={() => this.copyCoupon(c.code)}
                      >
                        {this.state.copiedCoupon === c.code ? (
                          <span><i className="bi bi-check-lg me-1"></i>Đã lưu</span>
                        ) : (
                          <span><i className="bi bi-copy me-1"></i>Lưu mã</span>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Categories Fast Navigation */}
        <div className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-3">
            <h4 className="fw-extrabold text-dark mb-0 d-flex align-items-center gap-2">
              <span className="p-1.5 rounded-3 bg-success text-white d-inline-flex align-items-center justify-content-center" style={{ width: '28px', height: '28px', fontSize: '14px' }}>
                <i className="bi bi-grid-fill"></i>
              </span>
              DANH MỤC NỔI BẬT
            </h4>
            <Link to="/product/category/all" className="text-success text-decoration-none fw-bold small d-flex align-items-center gap-1">
              Xem tất cả <i className="bi bi-chevron-right"></i>
            </Link>
          </div>

          <div className="row row-cols-2 row-cols-sm-3 row-cols-md-5 g-3">
            {[
              { 
                name: 'iPhone', 
                icon: 'bi-phone', 
                desc: 'Chính hãng VN/A', 
                badge: 'Hot',
                gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                accent: '#8b5cf6',
                shadow: 'rgba(139, 92, 246, 0.28)'
              },
              { 
                name: 'MacBook', 
                icon: 'bi-laptop', 
                desc: 'M2 / M3 Apple Silicon', 
                badge: 'Pro',
                gradient: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 100%)',
                accent: '#0ea5e9',
                shadow: 'rgba(14, 165, 233, 0.28)'
              },
              { 
                name: 'iPad', 
                icon: 'bi-tablet', 
                desc: 'Học tập & Sáng tạo', 
                badge: 'New',
                gradient: 'linear-gradient(135deg, #ea580c 0%, #f59e0b 100%)',
                accent: '#f59e0b',
                shadow: 'rgba(245, 158, 11, 0.28)'
              },
              { 
                name: 'AirPods', 
                icon: 'bi-earbuds', 
                desc: 'Âm thanh đỉnh cao', 
                badge: 'Top Sale',
                gradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                accent: '#10b981',
                shadow: 'rgba(16, 185, 129, 0.28)'
              },
              { 
                name: 'Laptop', 
                icon: 'bi-display', 
                desc: 'Windows cao cấp', 
                badge: 'Chính hãng',
                gradient: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                accent: '#3b82f6',
                shadow: 'rgba(59, 130, 246, 0.28)'
              }
            ].map((cat, idx) => {
              const matchedCate = this.state.categories.find(c => c.name.toLowerCase() === cat.name.toLowerCase());
              const linkTarget = matchedCate ? `/product/category/${matchedCate._id}` : '/product/category/all';
              return (
                <div className="col" key={idx}>
                  <Link 
                    to={linkTarget} 
                    className="category-feature-card"
                    style={{
                      '--cat-gradient': cat.gradient,
                      '--cat-accent': cat.accent,
                      '--cat-shadow': cat.shadow
                    }}
                  >
                    {cat.badge && (
                      <span className="category-badge-chip">{cat.badge}</span>
                    )}
                    <div className="category-icon-wrapper">
                      <i className={`bi ${cat.icon}`}></i>
                    </div>
                    <span className="category-title">{cat.name}</span>
                    <span className="category-desc">{cat.desc}</span>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>

        {/* New Products Section */}
        <section id="new-products" className="mb-5">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h3 className="section-title mb-1">
                <i className="bi bi-sparkles text-success"></i> SẢN PHẨM MỚI VỀ
              </h3>
              <p className="text-secondary small mb-0">Cập nhật những thiết bị công nghệ đỉnh cao vừa cập bến VLSC</p>
            </div>
            <Link to="/product/category/all" className="btn btn-outline-success rounded-pill px-3 py-1.5 fw-bold small">
              Xem tất cả
            </Link>
          </div>
          {this.state.newprods.length > 0 ? (
            <div className="product-grid">
              {newprods}
            </div>
          ) : (
            <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
              <div className="spinner-border text-success mb-3" role="status"></div>
              <p className="text-muted fw-semibold mb-0">Đang tải sản phẩm mới...</p>
            </div>
          )}
        </section>

        {/* Hot Products Section */}
        {this.state.hotprods.length > 0 && (
          <section id="hot-products" className="mb-5">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h3 className="section-title mb-1">
                  <i className="bi bi-fire text-danger"></i> SẢN PHẨM BÁN CHẠY (HOT DEALS)
                </h3>
                <p className="text-secondary small mb-0">Được hàng nghìn khách hàng tin chọn với đánh giá 5 sao</p>
              </div>
              <Link to="/product/category/all" className="btn btn-outline-danger rounded-pill px-3 py-1.5 fw-bold small">
                Xem bảng xếp hạng
              </Link>
            </div>
            <div className="product-grid">
              {hotprods}
            </div>
          </section>
        )}

        {/* Wishlist Section if any */}
        {this.state.wishlistItems.length > 0 && (
          <section id="wishlist" className="mb-5 p-4 bg-white rounded-4 border shadow-sm">
            <div className="d-flex align-items-center justify-content-between mb-4">
              <div>
                <h3 className="section-title mb-1 text-danger">
                  <i className="bi bi-heart-fill text-danger me-2"></i> DANH SÁCH YÊU THÍCH CỦA BẠN
                </h3>
                <p className="text-secondary small mb-0">Các sản phẩm bạn đã lưu để theo dõi và mua sau</p>
              </div>
              <span className="badge bg-danger rounded-pill px-3 py-2 fw-bold">
                {this.state.wishlistItems.length} sản phẩm
              </span>
            </div>
            <div className="product-grid">
              {this.state.wishlistItems.map(item => this.renderProductCard(item, 'LIKE'))}
            </div>
          </section>
        )}

        {/* Recently Viewed Products Section */}
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
      </div>
    );
  }

  // apis
  apiGetNewProducts() {
    axios.get('/api/customer/products/new').then((res) => {
      this.setState({ newprods: Array.isArray(res.data) ? res.data : [] });
    }).catch(() => {});
  }

  apiGetHotProducts() {
    axios.get('/api/customer/products/hot').then((res) => {
      this.setState({ hotprods: Array.isArray(res.data) ? res.data : [] });
    }).catch(() => {});
  }

  apiGetCategories() {
    axios.get('/api/customer/categories').then((res) => {
      this.setState({ categories: Array.isArray(res.data) ? res.data : [] });
    }).catch(() => {});
  }
}

export default Home;
