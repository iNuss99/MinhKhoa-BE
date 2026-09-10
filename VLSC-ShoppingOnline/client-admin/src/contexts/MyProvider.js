import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);
    this.state = { // global state
      // variables
      token: localStorage.getItem('token') || '',
      username: localStorage.getItem('username') || '',
      role: localStorage.getItem('role') || 'admin',
      toast: { show: false, message: '', type: 'success' },
      // functions
      setToken: this.setToken,
      setUsername: this.setUsername,
      setRole: this.setRole,
      toastMessage: this.toastMessage
    };
  }
  setToken = (value) => {
    if (value) {
      localStorage.setItem('token', value);
    } else {
      localStorage.removeItem('token');
    }
    this.setState({ token: value });
  }
  setUsername = (value) => {
    if (value) {
      localStorage.setItem('username', value);
    } else {
      localStorage.removeItem('username');
    }
    this.setState({ username: value });
  }
  setRole = (value) => {
    if (value) {
      localStorage.setItem('role', value);
    } else {
      localStorage.removeItem('role');
    }
    this.setState({ role: value });
  }
  toastMessage = (message, type = 'success') => {
    this.setState({ toast: { show: true, message, type } });
    if (this.toastTimeout) clearTimeout(this.toastTimeout);
    this.toastTimeout = setTimeout(() => {
      this.setState({ toast: { show: false, message: '', type: 'success' } });
    }, 3200);
  }
  render() {
    const { toast } = this.state;
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
        {toast.show && (
          <div className={`custom-toast toast-${toast.type} shadow-lg rounded-4`}>
            <div className="d-flex align-items-center gap-2">
              <i className={`bi ${
                toast.type === 'success' ? 'bi-check-circle-fill text-success' :
                toast.type === 'danger' ? 'bi-x-circle-fill text-danger' :
                toast.type === 'warning' ? 'bi-exclamation-triangle-fill text-warning' :
                'bi-info-circle-fill text-info'
              } fs-4`}></i>
              <span className="fw-semibold text-dark">{toast.message}</span>
            </div>
          </div>
        )}
      </MyContext.Provider>
    );
  }
}
export default MyProvider;
