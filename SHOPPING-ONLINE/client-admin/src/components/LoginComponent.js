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
              <h2>SHOPPING ONLINE</h2>
              <p>Admin Management System</p>
            </div>
            <form onSubmit={(e) => this.btnLoginClick(e)}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Enter username"
                  value={this.state.txtUsername}
                  onChange={(e) => { this.setState({ txtUsername: e.target.value }) }}
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  className="form-control"
                  placeholder="Enter password"
                  value={this.state.txtPassword}
                  onChange={(e) => { this.setState({ txtPassword: e.target.value }) }}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ marginTop: '10px' }}>
                LOGIN
              </button>
            </form>
          </div>
        </div>
      );
    }
    return (<div />);
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
      alert('Please input username and password');
    }
  }
  // apis
  apiLogin(account) {
    axios.post('/api/admin/login', account).then((res) => {
      const result = res.data;
      if (result.success === true) {
        this.context.setToken(result.token);
        this.context.setUsername(account.username);
      } else {
        alert(result.message);
      }
    }).catch((err) => {
      alert('Server connection error: ' + err.message);
    });
  }
}
export default Login;
