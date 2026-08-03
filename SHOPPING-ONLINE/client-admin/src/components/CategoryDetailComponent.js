import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class CategoryDetail extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      txtID: '',
      txtName: ''
    };
  }
  render() {
    return (
      <div className="content-card">
        <h2 className="card-title">Category Detail</h2>
        <form>
          <div className="form-group">
            <label>ID</label>
            <input type="text" className="form-control" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} readOnly={true} placeholder="Auto-generated" />
          </div>
          <div className="form-group">
            <label>Category Name</label>
            <input type="text" className="form-control" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} placeholder="Enter category name" />
          </div>
          <div className="btn-group">
            <button type="submit" className="btn btn-add" onClick={(e) => this.btnAddClick(e)}>ADD NEW</button>
            <button type="submit" className="btn btn-update" onClick={(e) => this.btnUpdateClick(e)}>UPDATE</button>
            <button type="submit" className="btn btn-delete" onClick={(e) => this.btnDeleteClick(e)}>DELETE</button>
          </div>
        </form>
      </div>
    );
  }
  // FIX: Check null before accessing props.item
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({ txtID: this.props.item._id, txtName: this.props.item.name });
      } else {
        this.setState({ txtID: '', txtName: '' });
      }
    }
  }
  // event-handlers
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    if (name) {
      const cate = { name: name };
      this.apiPostCategory(cate);
    } else {
      alert('Please input category name');
    }
  }
  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    if (id && name) {
      const cate = { name: name };
      this.apiPutCategory(id, cate);
    } else {
      alert('Please select a category and input name');
    }
  }
  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this category?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        alert('Please select a category first');
      }
    }
  }
  // apis
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Category added successfully!');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else {
        alert('Failed to add category!');
      }
    }).catch((err) => {
      alert('Error: ' + (err.response?.data?.error || err.message));
    });
  }
  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Category updated successfully!');
        this.apiGetCategories();
      } else {
        alert('Failed to update category!');
      }
    }).catch((err) => {
      alert('Error: ' + (err.response?.data?.error || err.message));
    });
  }
  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Category deleted successfully!');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else {
        alert('Failed to delete category!');
      }
    }).catch((err) => {
      alert('Error: ' + (err.response?.data?.error || err.message));
    });
  }
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.props.updateCategories(result);
    }).catch((err) => {
      console.error('Error fetching categories:', err.message);
    });
  }
}
export default CategoryDetail;
