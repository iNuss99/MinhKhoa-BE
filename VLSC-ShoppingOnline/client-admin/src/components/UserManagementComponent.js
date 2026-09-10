import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import axios from 'axios';

class UserManagement extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      users: [],
      loading: true,
      showAddModal: false,
      username: '',
      password: '',
      name: '',
      role: 'STAFF',
      submitting: false
    };
  }

  componentDidMount() {
    this.fetchUsers();
  }

  fetchUsers = () => {
    if (!this.context || !this.context.token) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/users', config)
      .then(res => {
        if (res.data && res.data.success) {
          this.setState({ users: res.data.users || [], loading: false });
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(() => this.setState({ loading: false }));
  };

  handleCreateUser = (e) => {
    e.preventDefault();
    this.setState({ submitting: true });
    const config = { headers: { 'x-access-token': this.context.token } };
    const payload = {
      username: this.state.username,
      password: this.state.password,
      name: this.state.name,
      role: this.state.role
    };

    axios.post('/api/admin/users', payload, config)
      .then(res => {
        this.setState({ submitting: false });
        if (res.data && res.data.success) {
          if (this.context.toastMessage) this.context.toastMessage('Tạo tài khoản nhân sự mới thành công!', 'success');
          this.setState({ showAddModal: false, username: '', password: '', name: '', role: 'STAFF' });
          this.fetchUsers();
        } else {
          if (this.context.toastMessage) this.context.toastMessage(res.data.message || 'Lỗi khi tạo tài khoản', 'danger');
        }
      })
      .catch(err => {
        this.setState({ submitting: false });
        if (this.context.toastMessage) this.context.toastMessage('Lỗi kết nối máy chủ', 'danger');
      });
  };

  handleChangeRole = (userId, newRole) => {
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.put(`/api/admin/users/role/${userId}`, { role: newRole }, config)
      .then(res => {
        if (res.data && res.data.success) {
          if (this.context.toastMessage) this.context.toastMessage(res.data.message, 'success');
          this.fetchUsers();
        } else {
          if (this.context.toastMessage) this.context.toastMessage(res.data.message || 'Lỗi đổi vai trò', 'danger');
        }
      })
      .catch(() => {
        if (this.context.toastMessage) this.context.toastMessage('Lỗi đổi vai trò', 'danger');
      });
  };

  renderRoleBadge = (role) => {
    const r = (role || 'STAFF').toUpperCase();
    const map = {
      'ADMIN': { bg: 'bg-danger-subtle text-danger border-danger-subtle', icon: 'bi-shield-fill-check', text: '👑 ADMIN' },
      'CEO': { bg: 'bg-primary-subtle text-primary border-primary-subtle', icon: 'bi-suit-club-fill', text: '👔 CEO' },
      'MANAGER': { bg: 'bg-warning-subtle text-warning border-warning-subtle', icon: 'bi-briefcase-fill', text: '💼 MANAGER' },
      'STAFF': { bg: 'bg-success-subtle text-success border-success-subtle', icon: 'bi-bag-check-fill', text: '🛍️ STAFF' },
      'WAREHOUSE': { bg: 'bg-info-subtle text-info border-info-subtle', icon: 'bi-box-seam-fill', text: '📦 WAREHOUSE' },
      'AUDITOR': { bg: 'bg-secondary-subtle text-secondary border-secondary-subtle', icon: 'bi-journal-check', text: '🔍 AUDITOR' }
    };
    const item = map[r] || map['STAFF'];
    return (
      <span className={`badge ${item.bg} border px-2.5 py-1 rounded-pill fw-bold`} style={{ fontSize: '0.75rem' }}>
        <i className={`bi ${item.icon} me-1`}></i> {item.text}
      </span>
    );
  };

  render() {
    const { users, loading, showAddModal, username, password, name, role, submitting } = this.state;

    return (
      <div className="py-4">
        {/* Page Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 fw-extrabold text-dark mb-1">
              <i className="bi bi-person-gear text-primary me-2"></i> QUẢN LÝ TÀI KHOẢN & PHÂN QUYỀN NỘI BỘ
            </h1>
            <p className="text-secondary mb-0 small">Phân cấp vai trò RBAC và quản lý quyền truy cập hệ thống của nhân viên</p>
          </div>
          <button
            className="btn btn-success rounded-pill px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2"
            onClick={() => this.setState({ showAddModal: true })}
          >
            <i className="bi bi-person-plus-fill"></i> Thêm tài khoản mới
          </button>
        </div>

        {/* User Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-secondary fw-semibold small">Tên tài khoản</th>
                  <th className="py-3 text-secondary fw-semibold small">Họ và tên</th>
                  <th className="py-3 text-secondary fw-semibold small text-center">Vai trò RBAC</th>
                  <th className="py-3 text-secondary fw-semibold small text-center">Phiên Token</th>
                  <th className="pe-4 py-3 text-secondary fw-semibold small text-center">Đổi Vai Trò</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5">
                      <div className="spinner-border text-primary" role="status"></div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-5 text-secondary">
                      Chưa có tài khoản nội bộ nào.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u._id} className="border-bottom">
                      <td className="ps-4 py-3">
                        <div className="d-flex align-items-center gap-2">
                          <div className="p-2 bg-primary text-white rounded-circle fw-bold d-inline-flex align-items-center justify-content-center" style={{ width: '36px', height: '36px', fontSize: '13px' }}>
                            {(u.username || 'U').charAt(0).toUpperCase()}
                          </div>
                          <span className="fw-bold text-dark font-monospace">{u.username}</span>
                        </div>
                      </td>

                      <td className="py-3 fw-semibold text-dark">
                        {u.name || u.username}
                      </td>

                      <td className="py-3 text-center">
                        {this.renderRoleBadge(u.role)}
                      </td>

                      <td className="py-3 text-center">
                        <span className="badge bg-light text-secondary border font-monospace px-2.5 py-1 rounded-pill small">
                          v{u.tokenVersion || 0}
                        </span>
                      </td>

                      <td className="pe-4 py-3 text-center">
                        <select
                          className="form-select form-select-sm rounded-pill fw-bold border-secondary"
                          style={{ width: 'auto', display: 'inline-block', fontSize: '0.8rem' }}
                          value={(u.role || 'STAFF').toUpperCase()}
                          onChange={(e) => this.handleChangeRole(u._id, e.target.value)}
                        >
                          <option value="ADMIN">👑 ADMIN</option>
                          <option value="CEO">👔 CEO</option>
                          <option value="MANAGER">💼 MANAGER</option>
                          <option value="STAFF">🛍️ STAFF</option>
                          <option value="WAREHOUSE">📦 WAREHOUSE</option>
                          <option value="AUDITOR">🔍 AUDITOR</option>
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal: Add User */}
        {showAddModal && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060 }}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header bg-primary text-white p-3.5">
                  <h5 className="modal-title fw-bold d-flex align-items-center gap-2">
                    <i className="bi bi-person-plus-fill"></i> THÊM TÀI KHOẢN NHÂN SỰ NỘI BỘ
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => this.setState({ showAddModal: false })}></button>
                </div>

                <form onSubmit={this.handleCreateUser}>
                  <div className="modal-body p-4">
                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Tên đăng nhập *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Ví dụ: staff_khoa"
                        value={username}
                        onChange={(e) => this.setState({ username: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Mật khẩu *</label>
                      <input
                        type="password"
                        className="form-control rounded-3"
                        placeholder="Nhập mật khẩu"
                        value={password}
                        onChange={(e) => this.setState({ password: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Họ và tên *</label>
                      <input
                        type="text"
                        className="form-control rounded-3"
                        placeholder="Ví dụ: Nguyễn Văn Khoa"
                        value={name}
                        onChange={(e) => this.setState({ name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-bold text-secondary">Vai trò RBAC *</label>
                      <select
                        className="form-select rounded-3 fw-bold"
                        value={role}
                        onChange={(e) => this.setState({ role: e.target.value })}
                      >
                        <option value="ADMIN">👑 ADMIN (Toàn quyền)</option>
                        <option value="CEO">👔 CEO (Giám đốc)</option>
                        <option value="MANAGER">💼 MANAGER (Quản lý cửa hàng)</option>
                        <option value="STAFF">🛍️ STAFF (Bán hàng & CSKH)</option>
                        <option value="WAREHOUSE">📦 WAREHOUSE (Thủ kho)</option>
                        <option value="AUDITOR">🔍 AUDITOR (Kiểm toán chỉ đọc)</option>
                      </select>
                    </div>
                  </div>

                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-light rounded-pill px-4 border" onClick={() => this.setState({ showAddModal: false })}>Hủy</button>
                    <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={submitting}>
                      {submitting ? 'Đang tạo...' : '💾 TẠO TÀI KHOẢN'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
}

export default UserManagement;
