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
      return (
        <tr key={item._id} className={this.state.itemSelected?._id === item._id ? 'datatable selected' : 'datatable'} onClick={() => this.trItemClick(item)}>
          <td><code style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item._id}</code></td>
          <td><strong>{item.name}</strong></td>
        </tr>
      );
    });
    return (
      <div className="view-container">
        <div className="content-card">
          <h2 className="card-title">Category List</h2>
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                </tr>
              </thead>
              <tbody>
                {cates.length > 0 ? cates : (
                  <tr>
                    <td colSpan="2" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No categories found</td>
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
    this.setState({ categories: categories, itemSelected: null });
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
