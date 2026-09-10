import axios from 'axios';
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Myprofile extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: '',
      txtName: '',
      txtPhone: '',
      txtEmail: ''
    };
  }

  render() {
    if (this.context.token === '') return (<Navigate replace to='/login' />);

    return (
      <div className="auth-container">
        <div className="auth-card" style={{ maxWidth: '560px' }}>
          <div className="auth-header">
            <div className="auth-icon-circle">
              <i className="bi bi-person-gear"></i>
            </div>
            <h2 className="auth-title">Hồ Sơ Của Tôi</h2>
            <p className="auth-subtitle">Cập nhật thông tin tài khoản cá nhân của bạn</p>
          </div>

          <form onSubmit={(e) => this.btnUpdateClick(e)}>
            <div className="row g-3">
              <div className="col-md-6">
                <div className="form-group-custom">
                  <label className="form-label-custom">Tên đăng nhập</label>
                  <div className="input-with-icon">
                    <i className="bi bi-person input-icon"></i>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      value={this.state.txtUsername}
                      onChange={(e) => { this.setState({ txtUsername: e.target.value }) }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group-custom">
                  <label className="form-label-custom">Mật khẩu</label>
                  <div className="input-with-icon">
                    <i className="bi bi-lock input-icon"></i>
                    <input
                      type="password"
                      className="form-control form-control-custom"
                      value={this.state.txtPassword}
                      onChange={(e) => { this.setState({ txtPassword: e.target.value }) }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="col-12">
                <div className="form-group-custom">
                  <label className="form-label-custom">Họ và tên</label>
                  <div className="input-with-icon">
                    <i className="bi bi-card-text input-icon"></i>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      value={this.state.txtName}
                      onChange={(e) => { this.setState({ txtName: e.target.value }) }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group-custom">
                  <label className="form-label-custom">Số điện thoại</label>
                  <div className="input-with-icon">
                    <i className="bi bi-telephone input-icon"></i>
                    <input
                      type="tel"
                      className="form-control form-control-custom"
                      value={this.state.txtPhone}
                      onChange={(e) => { this.setState({ txtPhone: e.target.value }) }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="col-md-6">
                <div className="form-group-custom">
                  <label className="form-label-custom">Địa chỉ Email</label>
                  <div className="input-with-icon">
                    <i className="bi bi-envelope input-icon"></i>
                    <input
                      type="email"
                      className="form-control form-control-custom"
                      value={this.state.txtEmail}
                      onChange={(e) => { this.setState({ txtEmail: e.target.value }) }}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="col-12">
                <div className="form-group-custom">
                  <label className="form-label-custom">Địa chỉ nhận hàng mặc định</label>
                  <div className="input-with-icon">
                    <i className="bi bi-geo-alt input-icon"></i>
                    <input
                      type="text"
                      className="form-control form-control-custom"
                      placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
                      value={this.state.txtAddress || ''}
                      onChange={(e) => { this.setState({ txtAddress: e.target.value }) }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn-auth-submit mt-3">
              <i className="bi bi-floppy-fill me-2"></i> CẬP NHẬT HỒ SƠ
            </button>
          </form>
        </div>
      </div>
    );
  }

  componentDidMount() {
    let savedAddress = '';
    try {
      savedAddress = localStorage.getItem('vlsc_last_delivery_address') || '';
    } catch (e) {}

    if (this.context.customer) {
      this.setState({
        txtUsername: this.context.customer.username || '',
        txtPassword: this.context.customer.password || '',
        txtName: this.context.customer.name || '',
        txtPhone: this.context.customer.phone || '',
        txtEmail: this.context.customer.email || '',
        txtAddress: this.context.customer.address || savedAddress || ''
      });
    }
  }

  // event-handlers
  btnUpdateClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    const name = this.state.txtName;
    const phone = this.state.txtPhone;
    const email = this.state.txtEmail;
    const address = this.state.txtAddress;
    if (username && password && name && phone && email) {
      const customer = { username, password, name, phone, email, address };
      this.apiPutCustomer(this.context.customer._id, customer);
    } else {
      alert('Vui lòng điền đầy đủ các thông tin trước khi cập nhật');
    }
  }

  // apis
  apiPutCustomer(id, customer) {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put('/api/customer/customers/' + id, customer, config).then((res) => {
      const result = res.data;
      if (result) {
        const updatedCust = result.customer || result;
        try {
          if (customer.address) localStorage.setItem('vlsc_last_delivery_address', customer.address);
          if (customer.phone) localStorage.setItem('vlsc_last_delivery_phone', customer.phone);
          if (customer.name) localStorage.setItem('vlsc_last_recipient_name', customer.name);
        } catch (e) {}

        if (this.context.showToast) {
          this.context.showToast('Cập nhật hồ sơ thành công!', 'success');
        } else {
          alert('Cập nhật hồ sơ thành công!');
        }
        this.context.setCustomer(updatedCust);
      } else {
        alert('Cập nhật hồ sơ thất bại!');
      }
    }).catch((err) => {
      alert('Lỗi cập nhật: ' + (err.response?.data?.message || err.message));
    });
  }
}

export default Myprofile;
