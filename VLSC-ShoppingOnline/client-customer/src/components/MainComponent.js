import React, { Component } from 'react';
import Menu from './MenuComponent';
import Inform from './InformComponent';
import Home from './HomeComponent';
import Product from './ProductComponent';
import ProductDetail from './ProductDetailComponent';
import AuthPortal from './AuthPortalComponent';
import Myprofile from './MyprofileComponent';
import Mycart from './MycartComponent';
import Myorders from './MyordersComponent';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import { SHOP_CONFIG } from '../utils/shopConfig';

class Main extends Component {
  render() {
    const pathname = this.props.location?.pathname || '';
    const isAuthRoute = pathname === '/login' || pathname === '/signup' || pathname === '/active' || pathname === '/auth';

    if (isAuthRoute) {
      return (
        <div className="auth-standalone-layout">
          <Routes>
            <Route path='/login' element={<AuthPortal />} />
            <Route path='/signup' element={<AuthPortal />} />
            <Route path='/active' element={<AuthPortal />} />
            <Route path='/auth' element={<AuthPortal />} />
          </Routes>
        </div>
      );
    }

    return (
      <div className="d-flex flex-column min-vh-100 bg-light">
        <Inform />
        <Menu />
        
        <main className="container flex-grow-1 mb-5">
          <Routes>
            <Route path='/' element={<Navigate replace to='/home' />} />
            <Route path='/home' element={<Home />} />
            <Route path='/product/category/:cid' element={<Product />} />
            <Route path='/product/search/:keyword' element={<Product />} />
            <Route path='/product/:id' element={<ProductDetail />} />
            <Route path='/login' element={<AuthPortal />} />
            <Route path='/signup' element={<AuthPortal />} />
            <Route path='/active' element={<AuthPortal />} />
            <Route path='/auth' element={<AuthPortal />} />
            <Route path='/myprofile' element={<Myprofile />} />
            <Route path='/mycart' element={<Mycart />} />
            <Route path='/myorders' element={<Myorders />} />
          </Routes>
        </main>
        
        {/* Modern Multi-Column Footer with Legal & MOIT Badges */}
        <footer className="modern-footer">
          <div className="container">
            <div className="row g-4 mb-4">
              {/* Col 1: Brand & Enterprise Information */}
              <div className="col-lg-4 col-md-6">
                <div className="d-flex align-items-center gap-2 mb-3">
                  <span className="p-2 bg-success text-white rounded-3 d-inline-flex align-items-center justify-content-center">
                    <i className="bi bi-shop fs-4"></i>
                  </span>
                  <span className="fs-4 fw-extrabold text-white">{SHOP_CONFIG.brandName}</span>
                </div>
                <p className="text-secondary small mb-3">
                  Hệ thống phân phối chính hãng các sản phẩm công nghệ, điện tử, laptop và phụ kiện cao cấp hàng đầu Việt Nam. Bảo hành chính hãng 12-24 tháng.
                </p>
                <div className="d-flex gap-3 text-secondary fs-5 mb-3">
                  <a href={SHOP_CONFIG.socials.facebook} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="Facebook"><i className="bi bi-facebook"></i></a>
                  <a href={SHOP_CONFIG.socials.instagram} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="Instagram"><i className="bi bi-instagram"></i></a>
                  <a href={SHOP_CONFIG.socials.youtube} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="YouTube"><i className="bi bi-youtube"></i></a>
                  <a href={SHOP_CONFIG.socials.tiktok} target="_blank" rel="noreferrer" className="text-secondary text-decoration-none" aria-label="TikTok"><i className="bi bi-tiktok"></i></a>
                </div>
                {/* Bộ Công Thương Badge */}
                <div className="d-flex align-items-center gap-2 mt-2">
                  <div className="badge-moit d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-3 border border-secondary border-opacity-25 bg-dark">
                    <i className="bi bi-shield-fill-check text-warning fs-5"></i>
                    <div className="text-start">
                      <div className="text-white fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ĐÃ THÔNG BÁO</div>
                      <div className="text-secondary" style={{ fontSize: '9px' }}>BỘ CÔNG THƯƠNG</div>
                    </div>
                  </div>
                  <div className="badge-moit d-inline-flex align-items-center gap-2 px-3 py-1.5 rounded-3 border border-secondary border-opacity-25 bg-dark">
                    <i className="bi bi-patch-check-fill text-success fs-5"></i>
                    <div className="text-start">
                      <div className="text-white fw-bold" style={{ fontSize: '11px', letterSpacing: '0.5px' }}>ĐÃ ĐĂNG KÝ</div>
                      <div className="text-secondary" style={{ fontSize: '9px' }}>BỘ CÔNG THƯƠNG</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Col 2: Quick Links */}
              <div className="col-lg-2 col-md-6">
                <h6 className="footer-title">Về Chúng Tôi</h6>
                <ul className="footer-links">
                  <li><Link to="/home">Trang chủ</Link></li>
                  <li><Link to="/product/category/all">Tất cả sản phẩm</Link></li>
                  <li><Link to="/home#deals">Khuyến mãi HOT</Link></li>
                  <li><Link to="/login">Đăng nhập tài khoản</Link></li>
                  <li><Link to="/signup">Đăng ký thành viên</Link></li>
                </ul>
              </div>

              {/* Col 3: Customer Service & Policies */}
              <div className="col-lg-3 col-md-6">
                <h6 className="footer-title">Chính Sách & Hỗ Trợ</h6>
                <ul className="footer-links">
                  <li><Link to="#">Chính sách bảo hành 1 đổi 1</Link></li>
                  <li><Link to="#">Quy định giao hàng & đồng kiểm</Link></li>
                  <li><Link to="#">Chính sách bảo mật thông tin</Link></li>
                  <li><Link to="#">Điều khoản dịch vụ & thanh toán</Link></li>
                  <li><Link to="#">Hướng dẫn mua hàng trả góp 0%</Link></li>
                </ul>
              </div>

              {/* Col 4: Contact Information */}
              <div className="col-lg-3 col-md-6">
                <h6 className="footer-title">Thông Tin Liên Hệ</h6>
                <p className="text-secondary small mb-2">
                  <i className="bi bi-geo-alt-fill text-success me-2"></i> {SHOP_CONFIG.address}
                </p>
                <p className="text-secondary small mb-2">
                  <i className="bi bi-envelope-fill text-success me-2"></i> {SHOP_CONFIG.email}
                </p>
                <p className="text-secondary small mb-2">
                  <i className="bi bi-telephone-fill text-success me-2"></i> Tổng đài: <strong className="text-white">{SHOP_CONFIG.hotline}</strong> (Miễn phí)
                </p>
                <p className="text-secondary small mb-0">
                  <i className="bi bi-clock-fill text-success me-2"></i> Giờ mở cửa: {SHOP_CONFIG.workingHours}
                </p>
              </div>
            </div>

            {/* Legal Information Section */}
            <div className="footer-legal-box py-3 px-4 rounded-3 mb-4 bg-dark bg-opacity-50 border border-secondary border-opacity-25">
              <div className="row g-2 text-secondary small">
                <div className="col-lg-8">
                  <p className="mb-1 fw-bold text-light">{SHOP_CONFIG.companyName}</p>
                  <p className="mb-1">
                    <strong>Mã số doanh nghiệp (MST):</strong> {SHOP_CONFIG.taxCode} do {SHOP_CONFIG.licenseAuthority} cấp ngày {SHOP_CONFIG.registrationDate}.
                  </p>
                  <p className="mb-0">
                    <strong>Đại diện pháp luật:</strong> {SHOP_CONFIG.legalRepresentative} | <strong>Địa chỉ trụ sở:</strong> {SHOP_CONFIG.address}
                  </p>
                </div>
                <div className="col-lg-4 d-flex flex-column justify-content-center align-items-lg-end">
                  <span className="text-light fw-semibold mb-1">Phương thức thanh toán bảo mật</span>
                  <div className="d-flex align-items-center gap-2 fs-5 text-secondary">
                    <i className="bi bi-credit-card-2-front" title="Thẻ Visa/Mastercard"></i>
                    <i className="bi bi-qr-code" title="Chuyển khoản VNPAY-QR"></i>
                    <i className="bi bi-wallet2" title="Ví MoMo / ZaloPay"></i>
                    <i className="bi bi-cash-stack" title="Thanh toán khi nhận hàng (COD)"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="footer-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
              <span className="small text-secondary">&copy; {new Date().getFullYear()} {SHOP_CONFIG.brandName} - {SHOP_CONFIG.companyName}. Bản quyền thuộc về VLSC Shopping Online.</span>
              <div className="d-flex align-items-center gap-3 small text-secondary">
                <span>Hệ sinh thái TMĐT hiện đại & an toàn cho người Việt</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    );
  }
}

export default withRouter(Main);
