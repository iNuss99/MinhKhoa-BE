import React, { Component } from 'react';
import { Routes, Route, Navigate, Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';
import Menu from './MenuComponent';
import Home from './HomeComponent';
import Category from './CategoryComponent';
import Product from './ProductComponent';

class Main extends Component {
  static contextType = MyContext; // using this.context to access global state
  render() {
    if (this.context.token !== '') {
      const username = this.context.username || 'Admin';
      const avatarInitial = username.charAt(0).toUpperCase();

      return (
        <div className="admin-layout">
          <Menu />
          <div className="admin-main-wrapper">
            <header className="admin-header">
              <div className="header-title">
                System Administration Dashboard
              </div>
              <div className="user-profile">
                <div className="user-info">
                  <div className="user-avatar">{avatarInitial}</div>
                  <span>{username}</span>
                </div>
                <Link to='/admin/home' className="btn-logout" onClick={() => this.lnkLogoutClick()}>
                  Logout
                </Link>
              </div>
            </header>
            <main className="admin-content">
              <Routes>
                <Route path='/admin' element={<Navigate replace to='/admin/home' />} />
                <Route path='/admin/home' element={<Home />} />
                <Route path='/admin/category' element={<Category />} />
                <Route path='/admin/product' element={<Product />} />
              </Routes>
            </main>
          </div>
        </div>
      );
    }
    return (<div />);
  }

  lnkLogoutClick() {
    this.context.setToken('');
    this.context.setUsername('');
  }
}
export default Main;
