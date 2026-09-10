import React, { Component } from 'react';
import MyContext from '../contexts/MyContext';
import axios from 'axios';

class AuditLogComponent extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      logs: [],
      loading: true,
      search: ''
    };
  }

  componentDidMount() {
    this.fetchAuditLogs();
  }

  fetchAuditLogs = () => {
    if (!this.context || !this.context.token) return;
    const config = { headers: { 'x-access-token': this.context.token } };
    axios.get('/api/admin/audit-logs', config)
      .then(res => {
        if (res.data && res.data.success) {
          this.setState({ logs: res.data.logs || [], loading: false });
        } else {
          this.setState({ loading: false });
        }
      })
      .catch(() => this.setState({ loading: false }));
  };

  formatDate = (iso) => {
    if (!iso) return 'N/A';
    try {
      const d = new Date(iso);
      return d.toLocaleString('vi-VN');
    } catch (e) {
      return iso;
    }
  };

  renderActionBadge = (action) => {
    const act = (action || '').toUpperCase();
    let bg = 'bg-secondary';
    if (act.includes('LOGIN')) bg = 'bg-info text-dark';
    if (act.includes('CREATE')) bg = 'bg-success';
    if (act.includes('UPDATE')) bg = 'bg-primary';
    if (act.includes('DELETE')) bg = 'bg-danger';
    if (act.includes('CHANGE_ROLE')) bg = 'bg-warning text-dark';

    return (
      <span className={`badge ${bg} px-2.5 py-1 rounded-pill font-monospace fw-bold`} style={{ fontSize: '0.72rem' }}>
        {action}
      </span>
    );
  };

  render() {
    const { logs, loading, search } = this.state;
    const filteredLogs = logs.filter(l =>
      (l.actorUsername || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.action || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.targetType || '').toLowerCase().includes(search.toLowerCase()) ||
      (l.details || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
      <div className="py-4">
        {/* Header */}
        <div className="d-flex align-items-center justify-content-between mb-4">
          <div>
            <h1 className="h3 fw-extrabold text-dark mb-1">
              <i className="bi bi-journal-text text-danger me-2"></i> AUDIT LOGS — NHẬT KÝ KIỂM TOÁN HỆ THỐNG
            </h1>
            <p className="text-secondary mb-0 small">Theo dõi toàn bộ các hành động nhạy cảm (Sửa QR, Đổi Role, Đổi giá, Đổi tồn kho, Xóa dữ liệu...)</p>
          </div>
          <button
            className="btn btn-outline-secondary rounded-pill px-3 py-2 fw-bold d-flex align-items-center gap-1.5 shadow-sm"
            onClick={this.fetchAuditLogs}
          >
            <i className="bi bi-arrow-clockwise"></i> Làm mới
          </button>
        </div>

        {/* Filter Input */}
        <div className="card border-0 shadow-sm rounded-4 p-3 mb-4 bg-white">
          <div className="input-group">
            <span className="input-group-text bg-light border-0"><i className="bi bi-search text-muted"></i></span>
            <input
              type="search"
              className="form-control bg-light border-0 rounded-end-pill py-2"
              placeholder="Tìm kiếm theo người thực hiện, hành động, đối tượng, IP..."
              value={search}
              onChange={(e) => this.setState({ search: e.target.value })}
            />
          </div>
        </div>

        {/* Table */}
        <div className="card border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table align-middle mb-0 small">
              <thead className="table-light">
                <tr>
                  <th className="ps-4 py-3 text-secondary fw-semibold">Thời gian</th>
                  <th className="py-3 text-secondary fw-semibold">Người thực hiện</th>
                  <th className="py-3 text-secondary fw-semibold text-center">Vai trò</th>
                  <th className="py-3 text-secondary fw-semibold text-center">Hành động</th>
                  <th className="py-3 text-secondary fw-semibold">Đối tượng</th>
                  <th className="pe-4 py-3 text-secondary fw-semibold">Địa chỉ IP</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5">
                      <div className="spinner-border text-danger" role="status"></div>
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-5 text-secondary">
                      Chưa có nhật ký kiểm toán nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((l, idx) => (
                    <tr key={l._id || idx} className="border-bottom">
                      <td className="ps-4 py-3 font-monospace text-secondary" style={{ fontSize: '0.8rem' }}>
                        {this.formatDate(l.createdAt)}
                      </td>
                      <td className="py-3 fw-bold text-dark">
                        {l.actorUsername}
                      </td>
                      <td className="py-3 text-center">
                        <span className="badge bg-light text-dark border font-monospace px-2 py-0.5 rounded-pill">
                          {l.actorRole}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {this.renderActionBadge(l.action)}
                      </td>
                      <td className="py-3 fw-semibold text-primary">
                        {l.targetType} {l.targetId ? `#${l.targetId.slice(-6)}` : ''}
                      </td>
                      <td className="pe-4 py-3 font-monospace text-muted" style={{ fontSize: '0.8rem' }}>
                        {l.ipAddress}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
}

export default AuditLogComponent;
