import React, { Component } from 'react';
import MyContext from './MyContext';

class MyProvider extends Component {
  constructor(props) {
    super(props);

    let savedToken = '';
    let savedCustomer = null;
    let savedCart = [];

    try {
      savedToken = localStorage.getItem('vlsc_customer_token') || '';
      savedCustomer = JSON.parse(localStorage.getItem('vlsc_customer_user') || 'null');
      savedCart = JSON.parse(localStorage.getItem('vlsc_cart') || '[]');
    } catch (e) {
      console.warn('Error reading localStorage for customer auth/cart:', e);
    }

    this.state = {
      // global state variables
      token: savedToken,
      customer: savedCustomer,
      mycart: savedCart,
      toast: null,

      // functions
      setToken: this.setToken,
      setCustomer: this.setCustomer,
      setMycart: this.setMycart,
      addToCart: this.addToCart,
      updateCartItem: this.updateCartItem,
      removeFromCart: this.removeFromCart,
      clearCart: this.clearCart,
      showToast: this.showToast
    };
  }

  setToken = (value) => {
    this.setState({ token: value });
    if (value) {
      localStorage.setItem('vlsc_customer_token', value);
    } else {
      localStorage.removeItem('vlsc_customer_token');
    }
  };

  setCustomer = (value) => {
    this.setState({ customer: value });
    if (value) {
      localStorage.setItem('vlsc_customer_user', JSON.stringify(value));
    } else {
      localStorage.removeItem('vlsc_customer_user');
    }
  };

  setMycart = (cart) => {
    this.setState({ mycart: cart });
    localStorage.setItem('vlsc_cart', JSON.stringify(cart));
  };

  addToCart = (product, quantity = 1) => {
    const qty = Math.max(1, parseInt(quantity) || 1);
    let cart = [...this.state.mycart];
    const index = cart.findIndex(item => item.product._id === product._id);

    if (index >= 0) {
      cart[index].quantity += qty;
    } else {
      cart.push({ product: product, quantity: qty });
    }

    this.setState({ mycart: cart });
    localStorage.setItem('vlsc_cart', JSON.stringify(cart));
    this.showToast(`Đã thêm "${product.name}" vào giỏ hàng!`, 'success');
  };

  updateCartItem = (productId, quantity) => {
    const qty = parseInt(quantity);
    let cart = [...this.state.mycart];
    const index = cart.findIndex(item => item.product._id === productId);

    if (index >= 0) {
      if (qty <= 0) {
        cart.splice(index, 1);
      } else {
        cart[index].quantity = qty;
      }
      this.setState({ mycart: cart });
      localStorage.setItem('vlsc_cart', JSON.stringify(cart));
    }
  };

  removeFromCart = (productId) => {
    const cart = this.state.mycart.filter(item => item.product._id !== productId);
    this.setState({ mycart: cart });
    localStorage.setItem('vlsc_cart', JSON.stringify(cart));
    this.showToast('Đã xóa sản phẩm khỏi giỏ hàng', 'info');
  };

  clearCart = () => {
    this.setState({ mycart: [] });
    localStorage.removeItem('vlsc_cart');
  };

  showToast = (message, type = 'success') => {
    this.setState({ toast: { message, type, timestamp: Date.now() } });
    setTimeout(() => {
      this.setState({ toast: null });
    }, 3500);
  };

  render() {
    return (
      <MyContext.Provider value={this.state}>
        {this.props.children}
        {/* Global Floating Toast */}
        {this.state.toast && (
          <div className="position-fixed bottom-0 end-0 p-3 z-3" style={{ zIndex: 9999 }}>
            <div className={`toast show align-items-center text-white bg-${this.state.toast.type === 'info' ? 'primary' : this.state.toast.type === 'danger' ? 'danger' : 'success'} border-0 shadow-lg rounded-4 p-2`}>
              <div className="d-flex align-items-center">
                <div className="toast-body fw-bold small d-flex align-items-center gap-2">
                  <i className={`bi ${this.state.toast.type === 'danger' ? 'bi-exclamation-octagon-fill' : 'bi-check-circle-fill'} fs-5`}></i>
                  <span>{this.state.toast.message}</span>
                </div>
                <button
                  type="button"
                  className="btn-close btn-close-white me-2 m-auto"
                  onClick={() => this.setState({ toast: null })}
                ></button>
              </div>
            </div>
          </div>
        )}
      </MyContext.Provider>
    );
  }
}

export default MyProvider;
