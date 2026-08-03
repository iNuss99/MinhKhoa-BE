import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import ProductDetail from './ProductDetailComponent';

class Product extends Component {
  static contextType = MyContext; // using this.context to access global state
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
    const prods = this.state.products.map((item) => {
      const isSelected = this.state.itemSelected?._id === item._id;
      return (
        <tr key={item._id} className={isSelected ? 'datatable selected' : 'datatable'} onClick={() => this.trItemClick(item)}>
          <td><code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item._id}</code></td>
          <td><strong>{item.name}</strong></td>
          <td style={{ color: 'var(--primary)', fontWeight: '600', whiteSpace: 'nowrap' }}>${item.price?.toLocaleString('en-US')}</td>
          <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{new Date(item.cdate).toLocaleDateString()}</td>
          <td><span style={{ padding: '4px 8px', borderRadius: '12px', background: '#f1f5f9', fontSize: '0.8rem' }}>{item.category.name}</span></td>
          <td>
            <img src={"data:image/jpg;base64," + item.image} width="48" height="48" style={{ borderRadius: '8px', objectFit: 'cover', border: '1px solid var(--border)' }} alt={item.name} />
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
          <h2 className="card-title">Product List</h2>
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Price</th>
                  <th>Created Date</th>
                  <th>Category</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                {prods.length > 0 ? prods : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No products found</td>
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
  
  updateProducts = (products, noPages) => { // arrow-function
    this.setState({ products: products, noPages: noPages, itemSelected: null });
  }
  
  // apis
  apiGetProducts(page) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + page, config).then((res) => {
      const result = res.data;
      this.setState({ products: result.products, noPages: result.noPages, curPage: result.curPage });
    });
  }
}
export default Product;
