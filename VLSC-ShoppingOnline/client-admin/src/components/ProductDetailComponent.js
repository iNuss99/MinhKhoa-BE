import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      categories: [],
      txtID: '',
      txtName: '',
      txtPrice: 0,
      cmbCategory: '',
      imgProduct: '',
    };
  }

  render() {
    const categoryList = Array.isArray(this.state.categories) ? this.state.categories : [];
    const cates = categoryList.map((cate) => {
      const isSelected = this.props.item?.category && cate._id === this.props.item.category._id;
      return (
        <option key={cate._id} value={cate._id} selected={isSelected}>
          {cate.name}
        </option>
      );
    });

    return (
      <div className="content-card">
        <div className="card-title">
          <span><i className="bi bi-pencil-square text-success me-2"></i> Chi tiết sản phẩm</span>
          {this.state.txtID ? (
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1 small fw-bold">Đang chỉnh sửa</span>
          ) : (
            <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 small fw-bold">Thêm mới</span>
          )}
        </div>

        <form>
          <div className="form-group">
            <label>Mã sản phẩm</label>
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
            <label>Tên sản phẩm</label>
            <input
              type="text"
              className="form-control"
              value={this.state.txtName}
              onChange={(e) => { this.setState({ txtName: e.target.value }) }}
              placeholder="Nhập tên sản phẩm (ví dụ: MacBook Pro M3)"
              required
            />
          </div>

          <div className="row g-2">
            <div className="col-6">
              <div className="form-group">
                <label>Giá bán (VNĐ)</label>
                <input
                  type="number"
                  className="form-control"
                  value={this.state.txtPrice}
                  onChange={(e) => { this.setState({ txtPrice: e.target.value }) }}
                  placeholder="0"
                  required
                />
              </div>
            </div>
            <div className="col-6">
              <div className="form-group">
                <label>Danh mục</label>
                <select
                  className="form-control"
                  value={this.state.cmbCategory}
                  onChange={(e) => { this.setState({ cmbCategory: e.target.value }) }}
                >
                  <option value="">-- Chọn danh mục --</option>
                  {cates}
                </select>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label>Hình ảnh sản phẩm</label>
            <input
              type="file"
              className="form-control"
              name="fileImage"
              accept="image/jpeg, image/png, image/webp"
              onChange={(e) => this.previewImage(e)}
            />
          </div>
          
          <div className="img-preview-box">
            {this.state.imgProduct ? (
              <img src={this.state.imgProduct} alt="Preview" />
            ) : (
              <div className="text-center text-muted small">
                <i className="bi bi-image fs-3 d-block text-secondary mb-1"></i>
                <span>Khu vực xem trước ảnh</span>
              </div>
            )}
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
  
  componentDidMount() {
    this.apiGetCategories();
  }
  
  componentDidUpdate(prevProps) {
    if (this.props.item !== prevProps.item) {
      if (this.props.item) {
        this.setState({
          txtID: this.props.item._id,
          txtName: this.props.item.name,
          txtPrice: this.props.item.price,
          cmbCategory: this.props.item.category ? this.props.item.category._id : '',
          imgProduct: this.props.item.images && this.props.item.images.length > 0 
            ? this.props.item.images[0] 
            : (this.props.item.image && this.props.item.image.startsWith('http') ? this.props.item.image : 'data:image/jpg;base64,' + this.props.item.image)
        });
      } else {
        this.setState({
          txtID: '',
          txtName: '',
          txtPrice: 0,
          cmbCategory: '',
          imgProduct: ''
        });
      }
    }
  }
  
  // event-handlers
  previewImage(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        this.setState({ imgProduct: evt.target.result });
      }
      reader.readAsDataURL(file);
    }
  }
  
  btnAddClick(e) {
    e.preventDefault();
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory || (this.state.categories[0] ? this.state.categories[0]._id : '');
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');
    if (name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPostProduct(prod);
    } else {
      this.context.toastMessage('Please input name, price, category, and upload an image', 'warning');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, '');
    if (id && name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPutProduct(id, prod);
    } else {
      this.context.toastMessage('Please select a product and fill all fields', 'warning');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this product?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        this.context.toastMessage('Please select a product first', 'warning');
      }
    }
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

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Product added successfully!', 'success');
        this.apiGetProducts();
      } else {
        this.context.toastMessage('Failed to add product!', 'danger');
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Product updated successfully!', 'success');
        this.apiGetProducts();
      } else {
        this.context.toastMessage('Failed to update product!', 'danger');
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        this.context.toastMessage('Product deleted successfully!', 'success');
        this.apiGetProducts();
      } else {
        this.context.toastMessage('Failed to delete product!', 'danger');
      }
    });
  }

  apiGetProducts() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/products?page=' + this.props.curPage, config).then((res) => {
      if (res.data.products && res.data.products.length !== 0) {
        this.props.updateProducts(res.data.products, res.data.noPages);
      } else {
        axios.get('/api/admin/products?page=' + Math.max(1, this.props.curPage - 1), config).then((res) => {
          const result = res.data;
          this.props.updateProducts(result.products, result.noPages);
        });
      }
    });
  }
}

export default ProductDetail;
