import React, { Component } from 'react';
import { NavLink, Link } from 'react-router-dom';
import MyContext from '../contexts/MyContext';

class Menu extends Component {
  static contextType = MyContext;
  render() {
    return (
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <span>🛒</span> SHOPPING <span>ADMIN</span>
        </div>
        <ul className="sidebar-menu">
          <li className="sidebar-item">
            <NavLink to='/admin/home' className={({ isActive }) => isActive ? 'active' : ''}>
              🏠 Home
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to='/admin/category' className={({ isActive }) => isActive ? 'active' : ''}>
              📂 Categories
            </NavLink>
          </li>
          <li className="sidebar-item">
            <NavLink to='/admin/product' className={({ isActive }) => isActive ? 'active' : ''}>
              📦 Products
            </NavLink>
          </li>
          <li className="sidebar-item">
            <Link to='#'>
              📋 Orders
            </Link>
          </li>
          <li className="sidebar-item">
            <Link to='#'>
              👥 Customers
            </Link>
          </li>
        </ul>
      </aside>
    );
  }
}
export default Menu;
