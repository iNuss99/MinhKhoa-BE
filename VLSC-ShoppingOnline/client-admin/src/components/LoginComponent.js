import axios from 'axios';
import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';

class Login extends Component {
  static contextType = MyContext;
  constructor(props) {
    super(props);
    this.state = {
      txtUsername: '',
      txtPassword: ''
    };
  }

  render() {
    if (this.context.token === '') {
      return (
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <div style={{
                width: '68px',
                height: '68px',
                borderRadius: '50%',
                backgroundColor: 'rgba(16, 185, 129, 0.12)',
                color: 'var(--primary)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
                border: '1px solid rgba(16, 185, 129, 0.25)'
              }}>
                <i className="bi bi-shield-lock-fill" style={{ fontSize: '2rem' }}></i>
              </div>
              <h2>CỔNG QUẢN TRỊ VLSC ADMIN</h2>
              <p>Đăng nhập hệ thống quản lý & tổng quan cửa hàng</p>
            </div>
            
            <form onSubmit={(e) => this.btnLoginClick(e)}>
              <div className="form-group">
                <label>Tên đăng nhập quản trị</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nhập tên đăng nhập"
                    value={this.state.txtUsername}
                    onChange={(e) => { this.setState({ txtUsername: e.target.value }) }}
                    required
                  />
                </div>
              </div>

              <div className="form-group" style={{ marginTop: '14px' }}>
                <label>Mật khẩu</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    className="form-control"
                    placeholder="Nhập mật khẩu"
                    value={this.state.txtPassword}
                    onChange={(e) => { this.setState({ txtPassword: e.target.value }) }}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary" style={{ marginTop: '24px' }}>
                <i className="bi bi-box-arrow-in-right me-2"></i> ĐĂNG NHẬP QUẢN TRỊ
              </button>
            </form>
          </div>
        </div>
      );
    }
    return <div />;
  }

  // event-handlers
  btnLoginClick(e) {
    e.preventDefault();
    const username = this.state.txtUsername;
    const password = this.state.txtPassword;
    if (username && password) {
      const account = { username: username, password: password };
      this.apiLogin(account);
    } else {
      this.context.toastMessage('Vui lòng nhập tên đăng nhập và mật khẩu', 'warning');
    }
  }

  // apis
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
        this.context.setRole(result.user?.role || 'admin');
        this.context.toastMessage(`Đăng nhập thành công! Vai trò: ${(result.user?.role || 'admin').toUpperCase()}`, 'success');
      } else {
        this.context.toastMessage(result.message || 'Login failed!', 'danger');
      }
    }).catch((err) => {
      this.context.toastMessage('Server connection error: ' + (err.response?.data?.message || err.message), 'danger');
    });
  }
}

export default Login;
