import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import { NavLink } from 'react-router-dom';

class Menu extends Component {
  static contextType = MyContext;

  render() {
    const role = (this.context.role || 'ADMIN').toUpperCase();

    // RBAC Permission Checks according to Specs Matrix
    const canSeeDashboard = ['ADMIN', 'CEO', 'MANAGER', 'AUDITOR'].includes(role);
    const canSeeCategory = ['ADMIN', 'CEO', 'AUDITOR'].includes(role);
    const canSeeProduct = ['ADMIN', 'CEO', 'MANAGER', 'WAREHOUSE', 'AUDITOR'].includes(role);
    const canSeeOrder = ['ADMIN', 'CEO', 'MANAGER', 'STAFF', 'WAREHOUSE', 'AUDITOR'].includes(role);
    const canSeeCustomer = ['ADMIN', 'CEO', 'MANAGER', 'STAFF', 'AUDITOR'].includes(role);
    const canSeeUserMgmt = ['ADMIN', 'CEO'].includes(role);
    const canSeeAuditLogs = ['ADMIN', 'CEO', 'AUDITOR'].includes(role);

    return (
      <aside className="admin-sidebar">
        <NavLink className="sidebar-brand" to="/admin/home">
          <span className="p-2 bg-success text-white rounded-3 d-inline-flex align-items-center justify-content-center shadow-sm">
            <i className="bi bi-shield-lock-fill fs-4"></i>
          </span>
          <span>VLSC Admin</span>
        </NavLink>

        <ul className="sidebar-nav">
          {canSeeDashboard && (
            <li>
              <NavLink to="/admin/home" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-speedometer2 fs-5"></i>
                <span>Tổng quan</span>
              </NavLink>
            </li>
          )}

          {canSeeCategory && (
            <li>
              <NavLink to="/admin/category" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-grid-fill fs-5"></i>
                <span>Danh mục</span>
              </NavLink>
            </li>
          )}

          {canSeeProduct && (
            <li>
              <NavLink to="/admin/product" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-box-seam-fill fs-5"></i>
                <span>Sản phẩm</span>
              </NavLink>
            </li>
          )}

          {canSeeOrder && (
            <li>
              <NavLink to="/admin/order" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-receipt-cutoff fs-5 text-warning"></i>
                <div className="d-flex align-items-center justify-content-between flex-grow-1">
                  <span>Quản lý đơn hàng</span>
                  <span className="badge bg-warning text-dark px-2 py-0.5 rounded-pill fw-bold shadow-xs" style={{ fontSize: '0.75rem' }}>
                    4
                  </span>
                </div>
              </NavLink>
            </li>
          )}

          {canSeeCustomer && (
            <li>
              <NavLink to="/admin/customer" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-people-fill fs-5 text-info"></i>
                <span>Khách hàng</span>
              </NavLink>
            </li>
          )}

          {canSeeUserMgmt && (
            <li>
              <NavLink to="/admin/users" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-person-gear fs-5 text-primary"></i>
                <span>Quản lý nhân sự</span>
              </NavLink>
            </li>
          )}

          {canSeeAuditLogs && (
            <li>
              <NavLink to="/admin/audit-logs" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
                <i className="bi bi-journal-text fs-5 text-danger"></i>
                <span>Nhật ký hệ thống</span>
              </NavLink>
            </li>
          )}
        </ul>
      </aside>
    );
  }
}

export default Menu;
