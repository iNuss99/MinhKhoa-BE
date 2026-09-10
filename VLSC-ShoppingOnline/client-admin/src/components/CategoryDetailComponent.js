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
        <div className="card-title">
          <span><i className="bi bi-pencil-square text-success me-2"></i> Chi tiết danh mục</span>
          {this.state.txtID ? (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small fw-bold">Đang chỉnh sửa</span>
          ) : (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small fw-bold">Thêm mới</span>
          )}
        </div>

        <form>
          <div className="form-group">
            <label>Mã danh mục</label>
            <input
              type="text"
              className="form-control"
              value={this.state.txtID}
              onChange={(e) => { this.setState({ txtID: e.target.value }) }}
              readOnly={true}
              placeholder="Tự động sinh khi tạo mới"
            />
          </div>

          <div className="form-group">
            <label>Tên danh mục</label>
            <input
              type="text"
              className="form-control"
              value={this.state.txtName}
              onChange={(e) => { this.setState({ txtName: e.target.value }) }}
              placeholder="Nhập tên danh mục (ví dụ: Điện thoại)"
              required
            />
          </div>

          <div className="btn-group-admin">
            <button type="submit" className="btn-admin btn-add" onClick={(e) => this.btnAddClick(e)}>
              <i className="bi bi-plus-lg"></i> THÊM MỚI
            </button>
            <button type="submit" className="btn-admin btn-update" onClick={(e) => this.btnUpdateClick(e)}>
              <i className="bi bi-pencil"></i> CẬP NHẬT
            </button>
            <button type="submit" className="btn-admin btn-delete" onClick={(e) => this.btnDeleteClick(e)}>
              <i className="bi bi-trash"></i> XÓA
            </button>
          </div>
        </form>
      </div>
    );
  }

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
      this.context.toastMessage('Vui lòng nhập tên danh mục', 'warning');
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
      this.context.toastMessage('Vui lòng chọn danh mục và nhập tên mới', 'warning');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Bạn có chắc chắn muốn xóa danh mục này không?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteCategory(id);
      } else {
        this.context.toastMessage('Vui lòng chọn danh mục cần xóa trước', 'warning');
      }
    }
  }

  // apis
  apiPostCategory(cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/categories', cate, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Đã thêm danh mục mới thành công!', 'success');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else {
        this.context.toastMessage('Thêm danh mục thất bại!', 'danger');
      }
    }).catch((err) => {
      this.context.toastMessage('Lỗi: ' + (err.response?.data?.error || err.message), 'danger');
    });
  }

  apiPutCategory(id, cate) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/categories/' + id, cate, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Đã cập nhật danh mục thành công!', 'success');
        this.apiGetCategories();
      } else {
        this.context.toastMessage('Cập nhật danh mục thất bại!', 'danger');
      }
    }).catch((err) => {
      this.context.toastMessage('Lỗi: ' + (err.response?.data?.error || err.message), 'danger');
    });
  }

  apiDeleteCategory(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/categories/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Đã xóa danh mục thành công!', 'success');
        this.setState({ txtID: '', txtName: '' });
        this.apiGetCategories();
      } else {
        this.context.toastMessage('Xóa danh mục thất bại!', 'danger');
      }
    }).catch((err) => {
      this.context.toastMessage('Lỗi: ' + (err.response?.data?.error || err.message), 'danger');
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
