import axios from 'axios';
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import withRouter from '../utils/withRouter';
import { formatVND, formatPriceDiscount } from '../utils/formatCurrency';

class Product extends Component {
  constructor(props) {
    super(props);
    this.state = {
      rawProducts: [],
      filteredProducts: [],
      loading: true,
      categoryName: '',
      // Filter states
      selectedPriceRange: 'all',
      selectedBrand: 'all',
      selectedStorage: 'all',
      sortBy: 'newest',
      wishlistIds: []
    };
  }

  componentDidMount() {
    this.loadWishlist();
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    const params = this.props.params;
    if (params.cid !== prevProps.params.cid || params.keyword !== prevProps.params.keyword) {
      this.fetchData();
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
      this.setState({ wishlistIds: saved.map(p => p._id || p) });
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      console.error(err);
    }
  }

  fetchData() {
    const params = this.props.params;
    this.setState({ loading: true });

    if (params.cid) {
      this.apiGetProductsByCatID(params.cid);
    } else if (params.keyword) {
      this.apiGetProductsByKeyword(params.keyword);
    } else {
      this.apiGetAllProducts();
    }
  }

  apiGetAllProducts() {
    axios.get('/api/customer/products/category/all').then((res) => {
      this.processLoadedProducts(res.data, 'Tất cả sản phẩm');
    }).catch(() => {
      this.setState({ loading: false, rawProducts: [], filteredProducts: [] });
    });
  }

  apiGetProductsByCatID(cid) {
    axios.get('/api/customer/products/category/' + cid).then((res) => {
      let catName = 'Danh mục sản phẩm';
      if (res.data.length > 0 && res.data[0].category) {
        catName = res.data[0].category.name;
      } else if (cid === 'all') {
        catName = 'Tất cả sản phẩm';
      }
      this.processLoadedProducts(res.data, catName);
    }).catch(() => {
      this.setState({ loading: false, rawProducts: [], filteredProducts: [] });
    });
  }

  apiGetProductsByKeyword(keyword) {
    axios.get('/api/customer/products/search/' + keyword).then((res) => {
      this.processLoadedProducts(res.data, `Kết quả tìm kiếm: "${keyword}"`);
    }).catch(() => {
      this.setState({ loading: false, rawProducts: [], filteredProducts: [] });
    });
  }

  processLoadedProducts(products, title) {
    this.setState({
      rawProducts: Array.isArray(products) ? products : [],
      categoryName: title,
      loading: false
    }, () => {
      this.applyFiltersAndSort();
    });
  }

  applyFiltersAndSort() {
    let result = [...this.state.rawProducts];

    // Filter by Price
    if (this.state.selectedPriceRange !== 'all') {
      if (this.state.selectedPriceRange === 'under-10m') {
        result = result.filter(p => p.price < 10000000);
      } else if (this.state.selectedPriceRange === '10m-20m') {
        result = result.filter(p => p.price >= 10000000 && p.price <= 20000000);
      } else if (this.state.selectedPriceRange === '20m-30m') {
        result = result.filter(p => p.price > 20000000 && p.price <= 30000000);
      } else if (this.state.selectedPriceRange === 'over-30m') {
        result = result.filter(p => p.price > 30000000);
      }
    }

    // Filter by Brand
    if (this.state.selectedBrand !== 'all') {
      result = result.filter(p => {
        const brand = (p.brand || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const filter = this.state.selectedBrand.toLowerCase();
        return brand.includes(filter) || name.includes(filter);
      });
    }

    // Filter by Storage
    if (this.state.selectedStorage !== 'all') {
      result = result.filter(p => {
        const storage = (p.storage || '').toLowerCase();
        const name = (p.name || '').toLowerCase();
        const filter = this.state.selectedStorage.toLowerCase();
        return storage.includes(filter) || name.includes(filter);
      });
    }

    // Sorting
    if (this.state.sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (this.state.sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (this.state.sortBy === 'rating-desc') {
      result.sort((a, b) => (b.rating || 4.8) - (a.rating || 4.8));
    } else if (this.state.sortBy === 'sold-desc') {
      result.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    } else {
      // newest
      result.sort((a, b) => (b.cdate || 0) - (a.cdate || 0));
    }

    this.setState({ filteredProducts: result });
  }

  handlePriceFilterChange(range) {
    this.setState({ selectedPriceRange: range }, () => this.applyFiltersAndSort());
  }

  handleBrandFilterChange(brand) {
    this.setState({ selectedBrand: brand }, () => this.applyFiltersAndSort());
  }

  handleStorageFilterChange(storage) {
    this.setState({ selectedStorage: storage }, () => this.applyFiltersAndSort());
  }

  handleSortChange(sort) {
    this.setState({ sortBy: sort }, () => this.applyFiltersAndSort());
  }

  resetFilters() {
    this.setState({
      selectedPriceRange: 'all',
      selectedBrand: 'all',
      selectedStorage: 'all',
      sortBy: 'newest'
    }, () => this.applyFiltersAndSort());
  }

  renderProductImage(item) {
    const imgSource = (item.images && item.images.length > 0)
      ? item.images[0]
      : (item.image && item.image.startsWith('http') ? item.image : "data:image/jpg;base64," + item.image);

    return (
      <img
        src={imgSource}
        alt={item.name}
        loading="lazy"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src = 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=60';
        }}
      />
    );
  }

  render() {
    const isFiltered = this.state.selectedPriceRange !== 'all' || this.state.selectedBrand !== 'all' || this.state.selectedStorage !== 'all' || this.state.sortBy !== 'newest';

    const prods = this.state.filteredProducts.map((item) => {
      const isWishlisted = this.state.wishlistIds.includes(item._id);
      return (
        <div key={item._id} className="product-card position-relative">
          <div className="product-img-wrapper">
            <span className="badge-tag badge-genuine">
              <i className="bi bi-patch-check-fill me-1"></i> Chính hãng
            </span>

            {/* Wishlist Heart Button */}
            <button
              className={`btn-wishlist-toggle ${isWishlisted ? 'active' : ''}`}
              title={isWishlisted ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
              onClick={(e) => this.toggleWishlist(item, e)}
            >
              <i className={`bi ${isWishlisted ? 'bi-heart-fill text-danger' : 'bi-heart'}`}></i>
            </button>

            <Link to={'/product/' + item._id}>
              {this.renderProductImage(item)}
            </Link>
          </div>

          <div className="product-info">
            <div className="d-flex align-items-center justify-content-between mb-1">
              <span className="product-brand-tag">{item.brand || (item.category ? item.category.name : 'VLSC')}</span>
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
    });

    return (
      <div className="py-3">
        {/* Breadcrumbs Navigation */}
        <nav aria-label="breadcrumb" className="mb-3">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-secondary text-decoration-none fw-semibold">Trang chủ</Link></li>
            <li className="breadcrumb-item text-secondary fw-semibold">Sản phẩm</li>
            <li className="breadcrumb-item active text-dark fw-bold" aria-current="page">{this.state.categoryName || 'Danh mục'}</li>
          </ol>
        </nav>

        {/* Page Header */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
          <div>
            <h2 className="fw-extrabold text-dark mb-1 d-flex align-items-center gap-2">
              <i className="bi bi-grid-3x3-gap-fill text-success"></i>
              <span>{this.state.categoryName || 'Tất Cả Sản Phẩm'}</span>
            </h2>
            <p className="text-secondary small mb-0">Khám phá các thiết bị công nghệ chính hãng với giá tốt nhất và bảo hành 12 tháng.</p>
          </div>
          <div className="d-flex align-items-center gap-2">
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
              {this.state.filteredProducts.length} sản phẩm
            </span>
          </div>
        </div>

        {/* Multi-Filter & Sort Bar */}
        <div className="filter-panel-card p-3 mb-4 rounded-4 shadow-sm bg-white border">
          <div className="row g-3 align-items-center">
            {/* Filter by Price */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <i className="bi bi-cash-stack text-success me-1"></i> Mức giá:
              </label>
              <select
                className="form-select form-select-sm rounded-pill"
                value={this.state.selectedPriceRange}
                onChange={(e) => this.handlePriceFilterChange(e.target.value)}
              >
                <option value="all">Tất cả mức giá</option>
                <option value="under-10m">Dưới 10 triệu ₫</option>
                <option value="10m-20m">10 triệu - 20 triệu ₫</option>
                <option value="20m-30m">20 triệu - 30 triệu ₫</option>
                <option value="over-30m">Trên 30 triệu ₫</option>
              </select>
            </div>

            {/* Filter by Brand */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <i className="bi bi-tag-fill text-success me-1"></i> Thương hiệu:
              </label>
              <select
                className="form-select form-select-sm rounded-pill"
                value={this.state.selectedBrand}
                onChange={(e) => this.handleBrandFilterChange(e.target.value)}
              >
                <option value="all">Tất cả thương hiệu</option>
                <option value="Apple">Apple</option>
                <option value="Dell">Dell</option>
                <option value="Asus">Asus</option>
                <option value="HP">HP</option>
              </select>
            </div>

            {/* Filter by Storage */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <i className="bi bi-hdd-fill text-success me-1"></i> Dung lượng:
              </label>
              <select
                className="form-select form-select-sm rounded-pill"
                value={this.state.selectedStorage}
                onChange={(e) => this.handleStorageFilterChange(e.target.value)}
              >
                <option value="all">Tất cả dung lượng</option>
                <option value="64GB">64 GB</option>
                <option value="128GB">128 GB</option>
                <option value="256GB">256 GB</option>
                <option value="512GB">512 GB</option>
              </select>
            </div>

            {/* Sort Control */}
            <div className="col-lg-3 col-md-6">
              <label className="form-label small fw-bold text-dark mb-1">
                <i className="bi bi-arrow-down-up text-success me-1"></i> Sắp xếp theo:
              </label>
              <select
                className="form-select form-select-sm rounded-pill"
                value={this.state.sortBy}
                onChange={(e) => this.handleSortChange(e.target.value)}
              >
                <option value="newest">Mới nhất</option>
                <option value="price-asc">Giá: Thấp đến Cao</option>
                <option value="price-desc">Giá: Cao đến Thấp</option>
                <option value="rating-desc">Đánh giá cao nhất</option>
                <option value="sold-desc">Bán chạy nhất</option>
              </select>
            </div>
          </div>

          {isFiltered && (
            <div className="d-flex align-items-center justify-content-between pt-3 mt-3 border-top">
              <span className="small text-secondary">
                Đang áp dụng bộ lọc tùy chỉnh ({this.state.filteredProducts.length} kết quả)
              </span>
              <button
                className="btn btn-sm btn-outline-danger rounded-pill px-3 fw-semibold d-flex align-items-center gap-1"
                onClick={() => this.resetFilters()}
              >
                <i className="bi bi-x-circle"></i> Xóa bộ lọc
              </button>
            </div>
          )}
        </div>

        {/* Product Grid or Empty State */}
        {this.state.loading ? (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm">
            <div className="spinner-border text-success mb-3" role="status"></div>
            <p className="text-muted fw-semibold mb-0">Đang tải danh sách sản phẩm...</p>
          </div>
        ) : prods.length > 0 ? (
          <div className="product-grid">
            {prods}
          </div>
        ) : (
          <div className="text-center py-5 bg-white rounded-4 border shadow-sm my-4">
            <div className="p-4 d-inline-flex bg-light text-muted rounded-circle mb-3">
              <i className="bi bi-inbox fs-1"></i>
            </div>
            <h5 className="fw-bold text-dark mb-1">Không tìm thấy sản phẩm phù hợp</h5>
            <p className="text-muted fw-medium mb-3">Vui lòng thử điều chỉnh lại bộ lọc giá, thương hiệu hoặc từ khóa tìm kiếm.</p>
            <button onClick={() => this.resetFilters()} className="btn btn-outline-success rounded-pill px-4 fw-bold me-2">
              <i className="bi bi-arrow-clockwise me-1"></i> Đặt lại bộ lọc
            </button>
            <Link to="/" className="btn btn-success rounded-pill px-4 fw-bold">
              <i className="bi bi-house-door me-1"></i> Về trang chủ
            </Link>
          </div>
        )}
      </div>
    );
  }
}

export default withRouter(Product);
