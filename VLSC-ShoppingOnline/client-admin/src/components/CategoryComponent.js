import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import CategoryDetail from './CategoryDetailComponent';

class Category extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      itemSelected: null
    };
  }

  render() {
    const cates = this.state.categories.map((item) => {
      const isSelected = this.state.itemSelected?._id === item._id;
      return (
        <tr key={item._id} className={isSelected ? 'datatable selected' : 'datatable'} onClick={() => this.trItemClick(item)}>
          <td><span className="code-id-tag">{item._id}</span></td>
          <td><strong className="text-dark fs-6">{item.name}</strong></td>
          <td className="text-end">
            <span className="badge bg-light text-secondary border">
              {isSelected ? 'Đang chọn' : 'Bấm để chọn'}
            </span>
          </td>
        </tr>
      );
    });

    return (
      <div className="view-container">
        <div className="content-card">
          <div className="card-title">
            <span><i className="bi bi-grid-fill text-success me-2"></i> Danh mục sản phẩm</span>
            <span className="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill fw-bold">
              {this.state.categories.length} Danh mục
            </span>
          </div>
          
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th style={{ width: '40%' }}>Mã danh mục</th>
                  <th style={{ width: '40%' }}>Tên danh mục</th>
                  <th style={{ width: '20%', textAlign: 'right' }}>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {cates.length > 0 ? cates : (
                  <tr>
                    <td colSpan="3" className="text-center py-4 text-muted fw-semibold">
                      <i className="bi bi-inbox fs-3 d-block mb-2 text-secondary"></i>
                      Chưa có danh mục nào. Hãy tạo danh mục mới!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <CategoryDetail item={this.state.itemSelected} updateCategories={this.updateCategories} />
      </div>
    );
  }

  updateCategories = (categories) => {
    if (Array.isArray(categories)) {
      this.setState({ categories: categories, itemSelected: null });
    }
  }

  componentDidMount() {
    this.apiGetCategories();
  }

  // event-handlers
  trItemClick(item) {
    this.setState({ itemSelected: item });
  }

  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      if (Array.isArray(result)) {
        this.setState({ categories: result });
      }
    }).catch((err) => {
      console.error('Error fetching categories:', err.message);
    });
  }
}

export default Category;
