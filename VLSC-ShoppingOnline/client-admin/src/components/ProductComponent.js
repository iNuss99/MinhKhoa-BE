import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      products: [],
      noPages: 0,
      curPage: 1,
      itemSelected: null
    };
  }

  render() {
    const productsList = Array.isArray(this.state.products) ? this.state.products : [];
    const prods = productsList.map((item) => {
      const isSelected = this.state.itemSelected?._id === item._id;
      return (
        <tr key={item._id} className={isSelected ? 'datatable selected' : 'datatable'} onClick={() => this.trItemClick(item)}>
          <td><span className="code-id-tag">{item._id}</span></td>
          <td>
            <div className="d-flex align-items-center gap-3">
              <img
                src={item.images && item.images.length > 0 ? item.images[0] : (item.image && item.image.startsWith('http') ? item.image : "data:image/jpg;base64," + item.image)}
                width="44"
                height="44"
                style={{ borderRadius: '8px', objectFit: 'contain', border: '1px solid var(--border)', background: '#f8fafc', padding: '2px' }}
                alt={item.name}
              />
              <strong className="text-dark fs-6">{item.name}</strong>
            </div>
          </td>
          <td style={{ color: 'var(--primary-hover)', fontWeight: '800', whiteSpace: 'nowrap' }}>
            {item.price ? item.price.toLocaleString('vi-VN') + ' ₫' : '0 ₫'}
          </td>
          <td>
            <span className="badge bg-light text-secondary border px-2 py-1 fw-semibold">
              {item.category ? item.category.name : 'Chung'}
            </span>
          </td>
          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            {new Date(item.cdate).toLocaleDateString('vi-VN')}
          </td>
        </tr>
      );
    });

    const pagination = Array.from({ length: this.state.noPages }, (_, index) => {
      const pageNum = index + 1;
      const isActive = pageNum === this.state.curPage;
      return (
        <button
          key={index}
          className={isActive ? 'page-item active' : 'page-item'}
          onClick={() => this.lnkPageClick(pageNum)}
        >
          {pageNum}
        </button>
      );
    });

    return (
      <div className="view-container">
        <div className="content-card">
          <div className="card-title">
            <span><i className="bi bi-box-seam-fill text-success me-2"></i> Kho sản phẩm hệ thống</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
              Trang {this.state.curPage} / {Math.max(1, this.state.noPages)}
            </span>
          </div>

          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Mã sản phẩm</th>
                  <th>Tên sản phẩm</th>
                  <th>Đơn giá</th>
                  <th>Danh mục</th>
                  <th>Ngày tạo</th>
                </tr>
              </thead>
              <tbody>
                {prods.length > 0 ? prods : (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted fw-semibold">
                      <i className="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                      Chưa có sản phẩm nào trong kho. Hãy thêm sản phẩm mới!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {this.state.noPages > 1 && (
            <div className="pagination">
              {pagination}
            </div>
          )}
        </div>

        <ProductDetail item={this.state.itemSelected} curPage={this.state.curPage} updateProducts={this.updateProducts} />
      </div>
    );
  }
  
  componentDidMount() {
    this.apiGetProducts(this.state.curPage);
  }
  
  // event-handlers
  lnkPageClick(index) {
    this.apiGetProducts(index);
  }
  
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }
  
  updateProducts = (products, noPages) => {
    this.setState({
      products: Array.isArray(products) ? products : [],
      noPages: noPages || 0,
      itemSelected: null
    });
  }
  
  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      if (result && Array.isArray(result.products)) {
        this.setState({ products: result.products, noPages: result.noPages || 0, curPage: result.curPage || 1 });
      }
    }).catch((err) => {
      console.error('Error fetching products:', err.message);
    });
  }
}

export default Product;
