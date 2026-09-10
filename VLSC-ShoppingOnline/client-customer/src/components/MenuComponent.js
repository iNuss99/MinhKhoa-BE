import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import MyContext from '../contexts/MyContext';

class Menu extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtKeyword: '',
      wishlistCount: 0
    };
  }

  normalizeCategoryName(name) {
    if (!name) return '';
    const map = {
      'iphone': 'iPhone',
      'macbook': 'MacBook',
      'ipad': 'iPad',
      'airpods': 'AirPods',
      'laptop': 'Laptop'
    };
    return map[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
  }

  updateWishlistCount() {
    try {
      const saved = JSON.parse(localStorage.getItem('vlsc_wishlist') || '[]');
      this.setState({ wishlistCount: saved.length });
    } catch (e) {
      this.setState({ wishlistCount: 0 });
    }
  }

  render() {
    const categoriesList = Array.isArray(this.state.categories) ? this.state.categories : [];
    const cates = categoriesList.map((item) => {
      const formattedName = this.normalizeCategoryName(item.name);
      return (
        <li key={item._id} className="nav-item">
          <Link to={'/product/category/' + item._id} className="nav-link-custom d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill">
            <span>{formattedName}</span>
          </Link>
        </li>
      );
    });

    return (
      <header className="glass-header sticky-top">
        <div className="container">
          <nav className="navbar navbar-expand-lg navbar-light py-2.5">
            <div className="container-fluid px-0">
              {/* Brand Logo */}
              <Link className="navbar-brand-logo me-4 d-flex align-items-center gap-2 text-decoration-none" to="/">
                <span className="p-2 bg-success text-white rounded-3 d-inline-flex align-items-center justify-content-center shadow-sm">
                  <i className="bi bi-shop fs-4"></i>
                </span>
                <span className="fw-extrabold fs-4 text-dark">VLSC <span className="text-success">Shop</span></span>
              </Link>
              
              {/* Mobile Toggler */}
              <button 
                className="navbar-toggler border-0 shadow-none" 
                type="button" 
                data-bs-toggle="collapse" 
                data-bs-target="#navbarContent"
                aria-label="Toggle navigation"
              >
                <span className="navbar-toggler-icon"></span>
              </button>

              <div className="collapse navbar-collapse" id="navbarContent">
                {/* Search Bar In Middle */}
                <form className="d-flex mx-lg-auto my-3 my-lg-0 w-100" style={{ maxWidth: '440px' }} onSubmit={(e) => this.btnSearchClick(e)}>
                  <div className="search-input-group w-100 position-relative">
                    <input
                      type="search"
                      className="form-control rounded-pill ps-4 pe-5 py-2 border-2"
                      placeholder="Tìm kiếm điện thoại, laptop, phụ kiện chính hãng..."
                      value={this.state.txtKeyword}
                      onChange={(e) => { this.setState({ txtKeyword: e.target.value }) }}
                    />
                    <button className="btn-search position-absolute top-50 end-0 translate-middle-y me-1 rounded-circle btn btn-success text-white px-3 py-1.5" type="submit" aria-label="Tìm kiếm">
                      <i className="bi bi-search"></i>
                    </button>
                  </div>
                </form>

                {/* Right Action Icons & Primary Auth Area */}
                <div className="d-flex align-items-center gap-2 ms-lg-3 mt-3 mt-lg-0">
                  {/* Wishlist Link */}
                  <Link to="/home#wishlist" className="btn btn-outline-secondary border-0 rounded-pill px-3 py-2 fw-semibold position-relative d-inline-flex align-items-center gap-2" title="Sản phẩm yêu thích">
                    <i className="bi bi-heart-fill text-danger fs-5"></i>
                    <span className="d-none d-xl-inline small">Yêu thích</span>
                    {this.state.wishlistCount > 0 && (
                      <span className="badge bg-danger rounded-pill px-2 py-0.5" style={{ fontSize: '11px' }}>
                        {this.state.wishlistCount}
                      </span>
                    )}
                  </Link>

                  {this.context.token ? (
                    <div className="dropdown">
                      <button className="btn btn-outline-success rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2 dropdown-toggle" type="button" data-bs-toggle="dropdown">
                        <i className="bi bi-person-circle fs-5"></i>
                        <span>{this.context.customer ? this.context.customer.name : 'Tài khoản'}</span>
                        <i className="bi bi-chevron-down small ms-1"></i>
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-3 mt-2">
                        <li>
                          <Link className="dropdown-item py-2 fw-semibold" to="/myprofile">
                            <i className="bi bi-person me-2 text-success"></i> Hồ sơ của tôi
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 fw-semibold" to="/myorders">
                            <i className="bi bi-receipt me-2 text-primary"></i> Đơn hàng của tôi
                          </Link>
                        </li>
                        <li>
                          <Link className="dropdown-item py-2 fw-semibold" to="/home#wishlist">
                            <i className="bi bi-heart me-2 text-danger"></i> Danh sách yêu thích ({this.state.wishlistCount})
                          </Link>
                        </li>
                        <li><hr className="dropdown-divider" /></li>
                        <li>
                          <button className="dropdown-item py-2 fw-semibold text-danger" onClick={() => this.lnkLogoutClick()}>
                            <i className="bi bi-box-arrow-right me-2"></i> Đăng xuất
                          </button>
                        </li>
                      </ul>
                    </div>
                  ) : (
                    <div className="d-flex align-items-center gap-2">
                      <Link to="/login" className="btn btn-outline-success rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-2">
                        <i className="bi bi-box-arrow-in-right"></i>
                        <span>Đăng nhập</span>
                      </Link>
                      <Link to="/signup" className="btn btn-success rounded-pill px-3 py-2 fw-bold d-none d-sm-inline-flex shadow-sm">
                        Đăng ký
                      </Link>
                    </div>
                  )}

                  <Link to="/mycart" className="btn btn-success rounded-pill px-3 py-2 fw-bold position-relative d-flex align-items-center gap-2 shadow-sm" title="Giỏ hàng của bạn">
                    <i className="bi bi-cart3 fs-5"></i>
                    <span className="d-none d-md-inline">Giỏ hàng</span>
                    <span className="badge bg-danger rounded-pill px-2 py-0.5">
                      {this.context.mycart ? this.context.mycart.reduce((sum, item) => sum + item.quantity, 0) : 0}
                    </span>
                  </Link>
                </div>
              </div>
            </div>
          </nav>

          {/* Sub Navigation Bar for Categories (With Smooth Horizontal Scroll) */}
          <div className="category-subnav d-flex align-items-center gap-2 py-2 border-top overflow-auto">
            <Link to="/product/category/all" className="nav-link-custom fw-bold active d-flex align-items-center gap-2 px-3 py-1.5 rounded-pill text-nowrap">
              <i className="bi bi-grid-fill text-success"></i>
              <span>Tất cả danh mục</span>
            </Link>
            <ul className="d-flex align-items-center gap-1 list-unstyled mb-0 flex-nowrap text-nowrap">
              {cates}
            </ul>
          </div>
        </div>
      </header>
    );
  }

  componentDidMount() {
    this.apiGetCategories();
    this.updateWishlistCount();
    window.addEventListener('storage', () => this.updateWishlistCount());
  }

  componentWillUnmount() {
    window.removeEventListener('storage', () => this.updateWishlistCount());
  }

  // event-handlers
  btnSearchClick(e) {
    e.preventDefault();
    if (this.state.txtKeyword.trim()) {
      this.props.navigate('/product/search/' + this.state.txtKeyword.trim());
    }
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setCustomer(null);
    this.context.setMycart([]);
    this.props.navigate('/home');
  }

  // apis
  apiGetCategories() {
    axios.get('/api/customer/categories').then((res) => {
      const result = res.data;
      if (Array.isArray(result)) {
        this.setState({ categories: result });
      }
    }).catch(() => {});
  }
}

export default withRouter(Menu);
