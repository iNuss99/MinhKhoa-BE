import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class ProductDetail extends Component {
  static contextType = MyContext; // using this.context to access global state
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
    const cates = this.state.categories.map((cate) => {
      if (this.props.item != null) {
        return (<option key={cate._id} value={cate._id} selected={cate._id === this.props.item.category._id}>{cate.name}</option>);
      } else {
        return (<option key={cate._id} value={cate._id}>{cate.name}</option>);
      }
    });
    return (
      <div className="content-card">
        <h2 className="card-title">Product Detail</h2>
        <form>
          <div className="form-group">
            <label>ID</label>
            <input type="text" className="form-control" value={this.state.txtID} onChange={(e) => { this.setState({ txtID: e.target.value }) }} readOnly={true} placeholder="Auto-generated" />
          </div>
          <div className="form-group">
            <label>Product Name</label>
            <input type="text" className="form-control" value={this.state.txtName} onChange={(e) => { this.setState({ txtName: e.target.value }) }} placeholder="Enter product name" />
          </div>
          <div className="form-group">
            <label>Price</label>
            <input type="number" className="form-control" value={this.state.txtPrice} onChange={(e) => { this.setState({ txtPrice: e.target.value }) }} placeholder="0" />
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={this.state.cmbCategory} onChange={(e) => { this.setState({ cmbCategory: e.target.value }) }}>
              <option value="">-- Select category --</option>
              {cates}
            </select>
          </div>
          <div className="form-group">
            <label>Product Image</label>
            <input type="file" className="form-control" name="fileImage" accept="image/jpeg, image/png, image/gif" onChange={(e) => this.previewImage(e)} />
          </div>
          
          <div className="img-preview-box">
            {this.state.imgProduct ? (
              <img src={this.state.imgProduct} alt="Preview" />
            ) : (
              <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Image preview area</span>
            )}
          </div>

          <div className="btn-group" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn btn-add" onClick={(e) => this.btnAddClick(e)}>ADD NEW</button>
            <button type="submit" className="btn btn-update" onClick={(e) => this.btnUpdateClick(e)}>UPDATE</button>
            <button type="submit" className="btn btn-delete" onClick={(e) => this.btnDeleteClick(e)}>DELETE</button>
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
          cmbCategory: this.props.item.category._id,
          imgProduct: 'data:image/jpg;base64,' + this.props.item.image
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
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPostProduct(prod);
    } else {
      alert('Please input name, price, category, and image');
    }
  }

  btnUpdateClick(e) {
    e.preventDefault();
    const id = this.state.txtID;
    const name = this.state.txtName;
    const price = parseInt(this.state.txtPrice);
    const category = this.state.cmbCategory;
    const image = this.state.imgProduct.replace(/^data:image\/[a-z]+;base64,/, ''); // remove "data:image/...;base64,"
    if (id && name && price && category && image) {
      const prod = { name: name, price: price, category: category, image: image };
      this.apiPutProduct(id, prod);
    } else {
      alert('Please select a product and input name, price, category, and image');
    }
  }

  btnDeleteClick(e) {
    e.preventDefault();
    if (window.confirm('Are you sure you want to delete this product?')) {
      const id = this.state.txtID;
      if (id) {
        this.apiDeleteProduct(id);
      } else {
        alert('Please select a product first');
      }
    }
  }

  // apis
  apiGetCategories() {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/categories', config).then((res) => {
      const result = res.data;
      this.setState({ categories: result });
    });
  }

  apiPostProduct(prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.post('/api/admin/products', prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Product added successfully!');
        this.apiGetProducts();
      } else {
        alert('Failed to add product!');
      }
    });
  }

  apiPutProduct(id, prod) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/admin/products/' + id, prod, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Product updated successfully!');
        this.apiGetProducts();
      } else {
        alert('Failed to update product!');
      }
    });
  }

  apiDeleteProduct(id) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.delete('/api/admin/products/' + id, config).then((res) => {
      const result = res.data;
      if (result) {
        alert('Product deleted successfully!');
        this.apiGetProducts();
      } else {
        alert('Failed to delete product!');
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
