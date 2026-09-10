import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import MyContext from '../contexts/MyContext';

class Home extends Component {
  static contextType = MyContext;

  constructor(props) {
    super(props);
    this.state = {
      realStats: null,
      selectedRole: 'CEO', // 'CEO', 'Manager', 'Warehouse'
      timeRange: '7days',   // '7days', '30days', 'year', 'custom'
      customStartDate: '2026-08-01',
      customEndDate: '2026-08-10',
      showCustomDateModal: false,
      activeChartMode: 'current', // 'current', 'compare', 'forecast'
      activeChartMetric: 'revenue', // 'revenue', 'orders'
      activeDrilldown: null, // 'revenue', 'orders', 'conversion', 'customers', null
      liveStreamActive: true,
      
      // Chart Data with comparison & forecast
      chartData: [
        { day: 'T2 (18/8)', revenue: 18500000, prevRevenue: 15200000, orders: 142, prevOrders: 120, heightCurr: '46%', heightPrev: '38%' },
        { day: 'T3 (19/8)', revenue: 22400000, prevRevenue: 18900000, orders: 168, prevOrders: 140, heightCurr: '56%', heightPrev: '47%' },
        { day: 'T4 (20/8)', revenue: 19800000, prevRevenue: 21000000, orders: 151, prevOrders: 155, heightCurr: '50%', heightPrev: '52%' },
        { day: 'T5 (21/8)', revenue: 26500000, prevRevenue: 22800000, orders: 204, prevOrders: 172, heightCurr: '66%', heightPrev: '57%' },
        { day: 'T6 (22/8)', revenue: 31200000, prevRevenue: 27400000, orders: 245, prevOrders: 210, heightCurr: '78%', heightPrev: '68%' },
        { day: 'T7 (23/8)', revenue: 38900000, prevRevenue: 33500000, orders: 310, prevOrders: 260, heightCurr: '97%', heightPrev: '84%' },
        { day: 'CN (24/8)', revenue: 28550000, prevRevenue: 24100000, orders: 228, prevOrders: 190, heightCurr: '71%', heightPrev: '60%' }
      ],
      forecastData: [
        { day: 'T2 (+1)', revenue: 30500000, orders: 235, height: '76%' },
        { day: 'T3 (+2)', revenue: 33800000, orders: 260, height: '85%' },
        { day: 'T4 (+3)', revenue: 36200000, orders: 280, height: '90%' }
      ],

      // Audit & Activity Logs
      activityLogs: [
        { id: 1, type: 'order', text: "Đơn hàng #1048 vừa thanh toán (14.500.000 ₫) bởi 'sonkk'", time: 'Vừa xong', icon: 'bi-cart-check-fill', color: 'text-success', bg: 'bg-success-subtle' },
        { id: 2, type: 'stock', text: "Cảnh báo tồn kho: 'MacBook Pro M3' chỉ còn 2 chiếc", time: '12 phút trước', icon: 'bi-exclamation-triangle-fill', color: 'text-warning', bg: 'bg-warning-subtle' },
        { id: 3, type: 'admin', text: "Admin cập nhật giá bán 'iPhone 15 Pro Max'", time: '45 phút trước', icon: 'bi-pencil-square', color: 'text-primary', bg: 'bg-primary-subtle' },
        { id: 4, type: 'user', text: "Khách hàng mới 'anhkhoa_dev' đã xác thực email thành công", time: '1 giờ trước', icon: 'bi-person-check-fill', color: 'text-info', bg: 'bg-info-subtle' },
        { id: 5, type: 'system', text: "Bảo mật RBAC: Kiểm toán phiên đăng nhập quản trị thành công", time: '2 giờ trước', icon: 'bi-shield-check', color: 'text-secondary', bg: 'bg-light' }
      ]
    };
    this.liveInterval = null;
  }

  componentDidMount() {
    this.apiGetStats();

    // Auto-sync dashboard stats every 10 seconds
    this.statsInterval = setInterval(() => {
      this.apiGetStats();
    }, 10000);

    // Simulated WebSocket real-time live events
    this.liveInterval = setInterval(() => {
      if (this.state.liveStreamActive) {
        const sampleOrders = [
          { name: 'lequang', item: 'Sony WH-1000XM5', price: '6.490.000 ₫' },
          { name: 'hoangnam', item: 'iPad Air M2', price: '16.890.000 ₫' },
          { name: 'thuthao', item: 'Bàn phím cơ Keychron', price: '2.350.000 ₫' }
        ];
        const randomItem = sampleOrders[Math.floor(Math.random() * sampleOrders.length)];
        const newLog = {
          id: Date.now(),
          type: 'order',
          text: `Khách hàng '${randomItem.name}' vừa đặt mua '${randomItem.item}' (${randomItem.price})`,
          time: 'Vừa xong',
          icon: 'bi-lightning-charge-fill',
          color: 'text-success',
          bg: 'bg-success-subtle'
        };
        this.setState(prevState => ({
          activityLogs: [newLog, ...prevState.activityLogs.slice(0, 7)]
        }));
      }
    }, 25000);
  }

  apiGetStats = () => {
    if (this.context && this.context.token) {
      const config = {
        headers: { 'x-access-token': this.context.token }
      };
      axios.get('/api/admin/dashboard/stats', config)
        .then((res) => {
          if (res.data && res.data.success && res.data.stats) {
            this.setState({ realStats: res.data.stats });
          }
        })
        .catch((err) => {
          console.warn('[Dashboard stats fetch]:', err.message);
          if (err.response?.status === 401 && this.context) {
            this.context.setToken('');
            this.context.setUsername('');
            if (this.context.toastMessage) this.context.toastMessage('Phiên làm việc hết hạn. Vui lòng đăng nhập lại!', 'warning');
          }
        });
    }
  };

  componentWillUnmount() {
    if (this.liveInterval) clearInterval(this.liveInterval);
    if (this.statsInterval) clearInterval(this.statsInterval);
  }

  // Audit Logger for Sensitive Actions
  logAuditEvent = (actionText) => {
    const auditLog = {
      id: Date.now(),
      type: 'admin',
      text: `[AUDIT] Quản trị viên '${this.context.username || 'Admin'}': ${actionText}`,
      time: 'Vừa xong',
      icon: 'bi-journal-check',
      color: 'text-primary',
      bg: 'bg-primary-subtle'
    };
    this.setState(prevState => ({
      activityLogs: [auditLog, ...prevState.activityLogs.slice(0, 7)]
    }));
  };

  // Export report to CSV
  exportReportCSV = () => {
    this.logAuditEvent(`Trích xuất báo cáo doanh thu & KPI sang CSV (${this.state.selectedRole})`);
    const headers = "ThoiGian,DoanhThuHienTai(VND),DoanhThuKyTruoc(VND),SoDonHang\n";
    const rows = this.state.chartData
      .map(item => `${item.day},${item.revenue},${item.prevRevenue},${item.orders}`)
      .join("\n");
    
    const summary = `\n\n--- BAO CAO DIEU HANH VLSC SHOPPING ONLINE ---\nVaiTroXem,${this.state.selectedRole}\nKhungThoiGian,${this.state.timeRange}\nTongDoanhThu,154850000 VND\nTongDonHang,1248 Don\nTyLeChuyenDoi,3.42%\nKhachHangMoi,864 TaiKhoan\nThoiDiemXuat,${new Date().toLocaleString('vi-VN')}\n`;

    const blob = new Blob(["\uFEFF" + headers + rows + summary], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `VLSC_Executive_Report_${this.state.selectedRole}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (this.context && this.context.toastMessage) {
      this.context.toastMessage('Đã xuất báo cáo CSV thành công (UTF-8 Excel)', 'success');
    }
  };

  renderDrilldownModal() {
    const { activeDrilldown } = this.state;
    if (!activeDrilldown) return null;

    let title = '';
    let content = null;

    switch (activeDrilldown) {
      case 'revenue':
        title = 'Chi tiết Dòng Doanh thu (Revenue Breakdown)';
        content = (
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Doanh thu kỳ này</th>
                  <th>Kỳ trước</th>
                  <th>Tăng trưởng</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {this.state.chartData.map((d, i) => (
                  <tr key={i}>
                    <td><strong>{d.day}</strong></td>
                    <td className="text-success fw-bold">{d.revenue.toLocaleString('vi-VN')} ₫</td>
                    <td className="text-muted">{d.prevRevenue.toLocaleString('vi-VN')} ₫</td>
                    <td><span className="badge bg-success-subtle text-success">+{(((d.revenue - d.prevRevenue) / d.prevRevenue) * 100).toFixed(1)}%</span></td>
                    <td><span className="badge bg-success text-white">Đã đối soát</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        break;
      case 'orders':
        title = 'Danh sách Đơn hàng theo Kỳ (Orders Drill-down)';
        content = (
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Mã đơn</th>
                  <th>Khách hàng</th>
                  <th>Tổng giá trị</th>
                  <th>Vận chuyển</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><code>#1048</code></td><td><strong>sonkk</strong></td><td className="text-success fw-bold">14.500.000 ₫</td><td>Express 24h</td><td><span className="badge bg-success">Đã giao</span></td></tr>
                <tr><td><code>#1047</code></td><td><strong>lequang</strong></td><td className="text-success fw-bold">6.490.000 ₫</td><td>Standard</td><td><span className="badge bg-primary">Đang giao</span></td></tr>
                <tr><td><code>#1046</code></td><td><strong>hoangnam</strong></td><td className="text-success fw-bold">16.890.000 ₫</td><td>Express 24h</td><td><span className="badge bg-warning text-dark">Chờ đóng gói</span></td></tr>
                <tr><td><code>#1045</code></td><td><strong>minhkhoa</strong></td><td className="text-success fw-bold">3.200.000 ₫</td><td>Standard</td><td><span className="badge bg-success">Đã giao</span></td></tr>
              </tbody>
            </table>
          </div>
        );
        break;
      case 'conversion':
        title = 'Phân tích Phễu Chuyển đổi (Conversion Funnel)';
        content = (
          <div className="p-3">
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>1. Lượt xem trang sản phẩm (Product Views)</span>
                <strong>36.420 (100%)</strong>
              </div>
              <div className="progress" style={{ height: '10px' }}><div className="progress-bar bg-info" style={{ width: '100%' }}></div></div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>2. Thêm vào giỏ hàng (Add to Cart)</span>
                <strong>5.820 (15.9%)</strong>
              </div>
              <div className="progress" style={{ height: '10px' }}><div className="progress-bar bg-primary" style={{ width: '45%' }}></div></div>
            </div>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <span>3. Bắt đầu thanh toán (Checkout Initiated)</span>
                <strong>2.140 (5.8%)</strong>
              </div>
              <div className="progress" style={{ height: '10px' }}><div className="progress-bar bg-warning" style={{ width: '25%' }}></div></div>
            </div>
            <div>
              <div className="d-flex justify-content-between mb-1">
                <span>4. Đặt hàng thành công (Completed Orders)</span>
                <strong className="text-success">1.248 (3.42%)</strong>
              </div>
              <div className="progress" style={{ height: '10px' }}><div className="progress-bar bg-success" style={{ width: '15%' }}></div></div>
            </div>
          </div>
        );
        break;
      case 'customers':
        title = 'Danh sách Khách hàng Mới & VIP';
        content = (
          <div className="table-responsive">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Tài khoản</th>
                  <th>Họ tên</th>
                  <th>Email</th>
                  <th>Điện thoại</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                <tr><td><strong>anhkhoa_dev</strong></td><td>Nguyễn Anh Khoa</td><td>anhkhoa@gmail.com</td><td>0908123456</td><td><span className="badge bg-success">Đã kích hoạt</span></td></tr>
                <tr><td><strong>sonkk</strong></td><td>Trần Kim Sơn</td><td>sonkk@vlsc.edu.vn</td><td>0912345678</td><td><span className="badge bg-success">VIP Member</span></td></tr>
                <tr><td><strong>thuthao</strong></td><td>Lê Thị Thu Thảo</td><td>thuthao@outlook.com</td><td>0988776655</td><td><span className="badge bg-success">Đã kích hoạt</span></td></tr>
              </tbody>
            </table>
          </div>
        );
        break;
      default:
        break;
    }

    return (
      <div className="drilldown-modal-backdrop" onClick={() => this.setState({ activeDrilldown: null })}>
        <div className="drilldown-modal-card" onClick={(e) => e.stopPropagation()}>
          <div className="p-4 border-bottom d-flex align-items-center justify-content-between bg-light">
            <h4 className="fw-extrabold text-dark mb-0">
              <i className="bi bi-layers-fill text-success me-2"></i>{title}
            </h4>
            <button
              className="btn btn-light rounded-circle border p-1"
              onClick={() => this.setState({ activeDrilldown: null })}
              aria-label="Close"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          <div className="p-4 overflow-auto flex-grow-1">
            {content}
          </div>
          <div className="p-3 border-top bg-light d-flex justify-content-between align-items-center">
            <span className="small text-muted">Dữ liệu được lọc theo kỳ: <b>{this.state.timeRange}</b></span>
            <button className="btn btn-success btn-sm rounded-pill px-4 fw-bold" onClick={() => this.setState({ activeDrilldown: null })}>
              Đóng cửa sổ
            </button>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { selectedRole, timeRange, activeChartMode, activeChartMetric, chartData, forecastData, activityLogs, liveStreamActive } = this.state;

    const compLabel = timeRange === '7days' ? 'vs 7 ngày' :
                      timeRange === '30days' ? 'vs 30 ngày' :
                      timeRange === 'year' ? 'vs năm trước' : 'vs kỳ trước';

    return (
      <div className="py-2">
        {this.renderDrilldownModal()}

        {/* Custom Date Range Popover Modal */}
        {this.state.showCustomDateModal && (
          <div className="drilldown-modal-backdrop" onClick={() => this.setState({ showCustomDateModal: false })}>
            <div className="drilldown-modal-card" style={{ maxWidth: '440px' }} onClick={(e) => e.stopPropagation()}>
              <div className="p-3 border-bottom bg-light d-flex align-items-center justify-content-between">
                <strong className="text-dark"><i className="bi bi-calendar-range me-2 text-success"></i> Chọn khoảng thời gian tùy chỉnh</strong>
                <button className="btn btn-light btn-sm rounded-circle" onClick={() => this.setState({ showCustomDateModal: false })}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="p-4">
                <div className="form-group mb-3">
                  <label className="form-label fw-bold">Từ ngày (Start Date):</label>
                  <input
                    type="date"
                    className="form-control"
                    value={this.state.customStartDate}
                    onChange={(e) => this.setState({ customStartDate: e.target.value })}
                  />
                </div>
                <div className="form-group mb-4">
                  <label className="form-label fw-bold">Đến ngày (End Date):</label>
                  <input
                    type="date"
                    className="form-control"
                    value={this.state.customEndDate}
                    onChange={(e) => this.setState({ customEndDate: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-success w-100 rounded-pill fw-bold py-2"
                  onClick={() => {
                    this.setState({ timeRange: `custom (${this.state.customStartDate} ~ ${this.state.customEndDate})`, showCustomDateModal: false });
                    this.logAuditEvent(`Áp dụng bộ lọc ngày: ${this.state.customStartDate} đến ${this.state.customEndDate}`);
                  }}
                >
                  Áp dụng bộ lọc
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Executive Top Control Bar */}
        <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h1 className="h2 fw-extrabold text-dark mb-0">Executive Analytics Cockpit</h1>
              <button
                className={`btn btn-sm rounded-pill px-2.5 py-0.5 fw-bold d-flex align-items-center gap-1 ${liveStreamActive ? 'btn-success text-white' : 'btn-outline-secondary'}`}
                onClick={() => this.setState({ liveStreamActive: !liveStreamActive })}
                title="Bật/Tắt cập nhật dữ liệu tự động"
              >
                <span className={`spinner-grow spinner-grow-sm ${liveStreamActive ? 'text-white' : 'text-secondary'}`} style={{ width: '7px', height: '7px' }}></span>
                {liveStreamActive ? 'Live Stream On' : 'Stream Paused'}
              </button>
            </div>
            <p className="text-secondary small mb-0 mt-1">Real-time data analytics system & multi-role RBAC governance</p>
          </div>

          {/* Role Switcher, Timeframe Controls & Primary Action with spacious gap */}
          <div className="d-flex flex-wrap align-items-center gap-3">
            {/* Timeframe Selector */}
            <div className="segmented-control-group bg-white shadow-xs">
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-bold px-3 ${timeRange === '7days' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                onClick={() => this.setState({ timeRange: '7days' })}
              >
                7 Days
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-bold px-3 ${timeRange === '30days' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                onClick={() => this.setState({ timeRange: '30days' })}
              >
                30 Days
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-bold px-3 ${timeRange === 'year' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                onClick={() => this.setState({ timeRange: 'year' })}
              >
                Year 2026
              </button>
              <button
                type="button"
                className={`btn btn-sm rounded-pill fw-bold px-2.5 ${timeRange.startsWith('custom') ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                onClick={() => this.setState({ showCustomDateModal: true })}
                title="Custom Date Range"
              >
                <i className="bi bi-calendar-event"></i>
              </button>
            </div>

            {/* Role Switcher */}
            <div className="dropdown">
              <button className="btn btn-outline-secondary rounded-pill px-3.5 py-2 fw-bold dropdown-toggle d-flex align-items-center gap-2 shadow-sm" type="button" data-bs-toggle="dropdown">
                <i className="bi bi-person-badge-fill text-primary fs-6"></i>
                <span>
                  Role: <b>
                    {(this.context.role || 'ADMIN').toUpperCase() === 'ADMIN' ? '👑 ADMIN' :
                     (this.context.role || 'ADMIN').toUpperCase() === 'CEO' ? '👔 CEO' :
                     (this.context.role || 'ADMIN').toUpperCase() === 'MANAGER' ? '💼 MANAGER' :
                     (this.context.role || 'ADMIN').toUpperCase() === 'STAFF' ? '🛍️ STAFF' :
                     (this.context.role || 'ADMIN').toUpperCase() === 'WAREHOUSE' ? '📦 WAREHOUSE' :
                     '🔍 AUDITOR'}
                  </b>
                </span>
              </button>
              <ul className="dropdown-menu shadow-lg border-0 rounded-4 p-2 mt-1">
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('admin'); this.setState({ selectedRole: 'ADMIN' }); this.logAuditEvent('Switched role to: ADMIN (Full Access)'); }}>
                    👑 ADMIN / Super Admin (Full Access & Audit)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('ceo'); this.setState({ selectedRole: 'CEO' }); this.logAuditEvent('Switched role to: CEO / Executive'); }}>
                    👔 CEO / Executive (Revenue & Cashflow Analytics)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('manager'); this.setState({ selectedRole: 'MANAGER' }); this.logAuditEvent('Switched role to: MANAGER / Store Manager'); }}>
                    💼 MANAGER / Store Manager (Sales & Conversions)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('staff'); this.setState({ selectedRole: 'STAFF' }); this.logAuditEvent('Switched role to: STAFF / Sales & Support'); }}>
                    🛍️ STAFF / Sales & Support (Orders & CSKH)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('warehouse'); this.setState({ selectedRole: 'WAREHOUSE' }); this.logAuditEvent('Switched role to: WAREHOUSE / Inventory'); }}>
                    📦 WAREHOUSE / Inventory (Stock & Dispatch)
                  </button>
                </li>
                <li>
                  <button className="dropdown-item py-2 fw-semibold rounded-3" onClick={() => { this.context.setRole('auditor'); this.setState({ selectedRole: 'AUDITOR' }); this.logAuditEvent('Switched role to: AUDITOR / Compliance'); }}>
                    🔍 AUDITOR / Compliance (Financial Audit & Logs)
                  </button>
                </li>
              </ul>
            </div>

            {/* Primary Action: Export CSV */}
            <button
              onClick={this.exportReportCSV}
              className="btn btn-success text-white rounded-pill px-3.5 py-2 fw-bold d-flex align-items-center gap-2 shadow-sm"
              title="Export report to Excel CSV"
            >
              <i className="bi bi-file-earmark-arrow-down-fill fs-6"></i>
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Dynamic KPI Cards with Clickable Card Target & Synced Timeframe */}
        <div className="row g-4 mb-4">
          {/* KPI 1: Revenue */}
          <div className="col-sm-6 col-xl-3" onClick={() => this.setState({ activeDrilldown: 'revenue' })} style={{ cursor: 'pointer' }}>
            <div className="kpi-card h-100 shadow-sm-hover transition-all">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold text-uppercase">TỔNG DOANH THU</span>
                <div className="kpi-icon-badge bg-success-subtle text-success">
                  <i className="bi bi-currency-dollar"></i>
                </div>
              </div>
              <div className="kpi-value text-success">
                {this.state.realStats && this.state.realStats.totalRevenue > 0
                  ? this.state.realStats.totalRevenue.toLocaleString('vi-VN') + ' ₫'
                  : '154,850,000 ₫'}
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-1">
                <span className="badge bg-success-subtle text-success fw-bold rounded-pill text-nowrap" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-up-right me-1"></i>+12.5% {compLabel}
                </span>
                <small className="text-success fw-semibold text-nowrap ms-auto" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-right-circle me-1"></i>Xem chi tiết
                </small>
              </div>
            </div>
          </div>

          {/* KPI 2: Orders */}
          <div className="col-sm-6 col-xl-3" onClick={() => this.setState({ activeDrilldown: 'orders' })} style={{ cursor: 'pointer' }}>
            <div className="kpi-card h-100 shadow-sm-hover transition-all">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold text-uppercase">TỔNG ĐƠN HÀNG</span>
                <div className="kpi-icon-badge bg-primary-subtle text-primary">
                  <i className="bi bi-bag-check-fill"></i>
                </div>
              </div>
              <div className="kpi-value text-primary">
                {this.state.realStats && this.state.realStats.totalOrders > 0
                  ? this.state.realStats.totalOrders.toLocaleString('vi-VN')
                  : '1,248'} <span className="fs-5 text-muted fw-normal">đơn</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-1">
                <span className="badge bg-primary-subtle text-primary fw-bold rounded-pill text-nowrap" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-up-right me-1"></i>+8.4% {compLabel}
                </span>
                <small className="text-primary fw-semibold text-nowrap ms-auto" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-right-circle me-1"></i>Xem chi tiết
                </small>
              </div>
            </div>
          </div>

          {/* KPI 3: Conversion Rate */}
          <div className="col-sm-6 col-xl-3" onClick={() => this.setState({ activeDrilldown: 'conversion' })} style={{ cursor: 'pointer' }}>
            <div className="kpi-card h-100 shadow-sm-hover transition-all">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold text-uppercase">TỶ LỆ CHUYỂN ĐỔI</span>
                <div className="kpi-icon-badge" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6' }}>
                  <i className="bi bi-graph-up-arrow"></i>
                </div>
              </div>
              <div className="kpi-value" style={{ color: '#8b5cf6' }}>3.42 %</div>
              <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-1">
                <span className="badge fw-bold rounded-pill text-nowrap" style={{ backgroundColor: '#f5f3ff', color: '#8b5cf6', fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-up-right me-1"></i>+0.8% {compLabel}
                </span>
                <small className="fw-semibold text-nowrap ms-auto" style={{ color: '#8b5cf6', fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-right-circle me-1"></i>Phễu bán hàng
                </small>
              </div>
            </div>
          </div>

          {/* KPI 4: Customers */}
          <div className="col-sm-6 col-xl-3" onClick={() => this.setState({ activeDrilldown: 'customers' })} style={{ cursor: 'pointer' }}>
            <div className="kpi-card h-100 shadow-sm-hover transition-all">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold text-uppercase">TỔNG KHÁCH HÀNG</span>
                <div className="kpi-icon-badge bg-warning-subtle text-warning">
                  <i className="bi bi-people-fill"></i>
                </div>
              </div>
              <div className="kpi-value text-warning">
                {this.state.realStats && this.state.realStats.totalCustomers > 0
                  ? this.state.realStats.totalCustomers.toLocaleString('vi-VN')
                  : '864'} <span className="fs-5 text-muted fw-normal">người dùng</span>
              </div>
              <div className="d-flex align-items-center justify-content-between mt-2 flex-wrap gap-1">
                <span className="badge bg-warning-subtle text-warning fw-bold rounded-pill text-nowrap" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-up-right me-1"></i>+15.3% {compLabel}
                </span>
                <small className="text-warning fw-semibold text-nowrap ms-auto" style={{ fontSize: '0.72rem' }}>
                  <i className="bi bi-arrow-right-circle me-1"></i>Danh sách
                </small>
              </div>
            </div>
          </div>
        </div>

        {/* Data Visualization Charts with Y-Axis & Multi-period Comparison / Forecast */}
        <div className="row g-4 mb-4">
          {/* Advanced Revenue Dynamics Chart */}
          <div className="col-lg-8">
            <div className="content-card h-100">
              <div className="card-title flex-wrap gap-2">
                <div className="d-flex align-items-center gap-2">
                  <i className="bi bi-bar-chart-line-fill text-success fs-5"></i>
                  <span>Xu hướng doanh thu & So sánh chu kỳ</span>
                </div>

                {/* Mode Selector: Current vs Period Comparison vs Forecast */}
                <div className="d-flex flex-wrap gap-2">
                  <div className="segmented-control-group bg-light">
                    <button
                      className={`btn btn-sm rounded-pill fw-bold px-2.5 ${activeChartMode === 'current' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                      onClick={() => this.setState({ activeChartMode: 'current' })}
                    >
                      Hiện tại
                    </button>
                    <button
                      className={`btn btn-sm rounded-pill fw-bold px-2.5 ${activeChartMode === 'compare' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                      onClick={() => this.setState({ activeChartMode: 'compare' })}
                      title="So sánh với kỳ trước"
                    >
                      So sánh (Kỳ trước)
                    </button>
                    <button
                      className={`btn btn-sm rounded-pill fw-bold px-2.5 ${activeChartMode === 'forecast' ? 'btn-success text-white' : 'btn-light text-secondary'}`}
                      onClick={() => this.setState({ activeChartMode: 'forecast' })}
                      title="Dự báo 3 ngày tới"
                    >
                      Dự báo (+3 ngày)
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart with Y-Axis and Dual/Forecast Columns */}
              <div className="chart-container-advanced">
                {/* Y-Axis Value Scale */}
                <div className="chart-y-axis">
                  <span>40M ₫</span>
                  <span>30M ₫</span>
                  <span>20M ₫</span>
                  <span>10M ₫</span>
                  <span>0 ₫</span>
                </div>

                {/* Main Bar Visualization Area with Horizontal Gridlines */}
                <div className="chart-main-area">
                  <div className="chart-gridlines">
                    <div className="gridline"></div>
                    <div className="gridline"></div>
                    <div className="gridline"></div>
                    <div className="gridline"></div>
                    <div className="gridline"></div>
                  </div>

                  <div className="bar-chart-grid-adv">
                    {chartData.map((item, index) => (
                      <div key={index} className="bar-column-adv">
                        <div className="bar-tooltip-adv">
                          <div><strong>Thứ: {item.day}</strong></div>
                          <div>Hiện tại: <b>{item.revenue.toLocaleString('vi-VN')} ₫</b> ({item.orders} đơn)</div>
                          {activeChartMode === 'compare' && (
                            <div className="text-info mt-1">Kỳ trước: {item.prevRevenue.toLocaleString('vi-VN')} ₫</div>
                          )}
                        </div>

                        <div className="dual-bar-wrapper">
                          {activeChartMode === 'compare' && (
                            <div className="bar-fill-previous" style={{ height: item.heightPrev }} title="Kỳ trước"></div>
                          )}
                          <div className="bar-fill-current" style={{ height: item.heightCurr }} title="Kỳ hiện tại"></div>
                        </div>

                        <div className="bar-label-adv">{item.day}</div>
                      </div>
                    ))}

                    {/* Forecast extension if enabled */}
                    {activeChartMode === 'forecast' && forecastData.map((item, index) => (
                      <div key={`fc-${index}`} className="bar-column-adv">
                        <div className="bar-tooltip-adv">
                          <div className="text-warning"><strong>Dự báo: {item.day}</strong></div>
                          <div>Ước tính: <b>{item.revenue.toLocaleString('vi-VN')} ₫</b></div>
                        </div>
                        <div className="dual-bar-wrapper">
                          <div className="bar-fill-forecast" style={{ height: item.height }}></div>
                        </div>
                        <div className="bar-label-adv text-warning">{item.day}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart Legend Summary */}
              <div className="d-flex flex-wrap align-items-center justify-content-between pt-3 border-top mt-2 text-secondary small">
                <div className="d-flex align-items-center gap-3">
                  <div className="d-flex align-items-center gap-1.5">
                    <span className="d-inline-block rounded-circle bg-success" style={{ width: '10px', height: '10px' }}></span>
                    <span className="fw-bold text-dark">Kỳ hiện tại</span>
                  </div>
                  {activeChartMode === 'compare' && (
                    <div className="d-flex align-items-center gap-1.5">
                      <span className="d-inline-block rounded-circle bg-secondary" style={{ width: '10px', height: '10px' }}></span>
                      <span>Kỳ đối chiếu</span>
                    </div>
                  )}
                  {activeChartMode === 'forecast' && (
                    <div className="d-flex align-items-center gap-1.5">
                      <span className="d-inline-block rounded-circle bg-warning" style={{ width: '10px', height: '10px' }}></span>
                      <span className="text-warning fw-bold">Mô hình dự báo</span>
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-muted">Trung bình doanh thu hàng ngày: <b>22.120.000 ₫</b></span>
                </div>
              </div>
            </div>
          </div>

          {/* Corrected Category Sales Share Donut Chart */}
          <div className="col-lg-4">
            <div className="content-card h-100 d-flex flex-column">
              <div className="card-title">
                <div>
                  <i className="bi bi-pie-chart-fill text-primary me-2"></i>
                  <span>Cơ cấu doanh thu theo danh mục</span>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill">Top 4 Danh mục</span>
              </div>

              {/* Mathematically Correct Donut Chart */}
              <div className="donut-chart-wrapper my-2">
                <svg width="150" height="150" viewBox="0 0 42 42">
                  <circle cx="21" cy="21" r="15.915" fill="#fff"></circle>
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#e2e8f0" strokeWidth="6"></circle>
                  
                  {/* Segment 1: Smartphones (45%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray="45 55" strokeDashoffset="25"></circle>
                  {/* Segment 2: Laptops (30%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#0284c7" strokeWidth="6" strokeDasharray="30 70" strokeDashoffset="80"></circle>
                  {/* Segment 3: Accessories (15%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#8b5cf6" strokeWidth="6" strokeDasharray="15 85" strokeDashoffset="50"></circle>
                  {/* Segment 4: Watches & Audio (10%) */}
                  <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray="10 90" strokeDashoffset="35"></circle>
                </svg>
                <div className="position-absolute text-center">
                  <span className="fs-4 fw-extrabold text-dark d-block" style={{ lineHeight: '1' }}>100%</span>
                  <small className="text-muted" style={{ fontSize: '0.72rem' }}>154.8M ₫</small>
                </div>
              </div>

              {/* 4 Clear Category Legends with % and Exact Figures */}
              <div className="mt-auto">
                <div className="donut-legend-item">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1.5 rounded-circle bg-success" style={{ width: '10px', height: '10px' }}></span>
                    <span className="fw-bold text-dark">1. Smartphones</span>
                  </div>
                  <div className="text-end">
                    <strong className="text-success">45%</strong>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>69,682,500 ₫</small>
                  </div>
                </div>

                <div className="donut-legend-item">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1.5 rounded-circle bg-primary" style={{ width: '10px', height: '10px' }}></span>
                    <span className="fw-bold text-dark">2. Laptops & Mac</span>
                  </div>
                  <div className="text-end">
                    <strong className="text-primary">30%</strong>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>46,455,000 ₫</small>
                  </div>
                </div>

                <div className="donut-legend-item">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1.5 rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#8b5cf6' }}></span>
                    <span className="fw-bold text-dark">3. Tech Accessories</span>
                  </div>
                  <div className="text-end">
                    <strong style={{ color: '#8b5cf6' }}>15%</strong>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>23,227,500 ₫</small>
                  </div>
                </div>

                <div className="donut-legend-item">
                  <div className="d-flex align-items-center gap-2">
                    <span className="p-1.5 rounded-circle bg-warning" style={{ width: '10px', height: '10px' }}></span>
                    <span className="fw-bold text-dark">4. Watches & Audio</span>
                  </div>
                  <div className="text-end">
                    <strong className="text-warning">10%</strong>
                    <small className="text-muted d-block" style={{ fontSize: '0.75rem' }}>15,485,000 ₫</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Operational Section: Live Activity Feed & Actionable Alert Center */}
        <div className="row g-4 mb-4">
          {/* Live Activity & Audit Stream */}
          <div className="col-lg-6">
            <div className="content-card h-100">
              <div className="card-title">
                <div>
                  <i className="bi bi-clock-history text-success me-2"></i>
                  <span>Live Activity Stream & Audit Logs</span>
                </div>
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2.5 py-1 rounded-pill small fw-bold">
                  {activityLogs.length} Events
                </span>
              </div>

              <div className="activity-feed-list">
                {activityLogs.map((log) => (
                  <div key={log.id} className="activity-item">
                    <div className={`activity-icon-badge ${log.bg} ${log.color}`}>
                      <i className={`bi ${log.icon}`}></i>
                    </div>
                    <div className="flex-grow-1">
                      <p className="text-dark fw-semibold mb-1" style={{ fontSize: '0.92rem' }}>{log.text}</p>
                      <span className="text-muted small"><i className="bi bi-clock me-1"></i>{log.time}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Alerts & Operations Center */}
          <div className="col-lg-6">
            <div className="content-card h-100">
              <div className="card-title">
                <div>
                  <i className="bi bi-shield-exclamation text-danger me-2"></i>
                  <span>Actionable Alerts & Operations Center</span>
                </div>
                <span className="badge bg-danger text-white rounded-pill px-2.5 py-1 small fw-bold">Action Required</span>
              </div>

              {/* Critical Alert */}
              <div className="alert-card-item alert-card-critical">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-exclamation-octagon-fill text-danger fs-3"></i>
                  <div>
                    <strong className="text-danger d-block">Low Stock Alert (3 Products)</strong>
                    <span className="small text-secondary">Inventory level has dropped below safety threshold (&lt;5 units).</span>
                  </div>
                </div>
                <Link to="/admin/product" className="btn btn-sm btn-danger fw-bold rounded-pill px-3 py-1.5 shadow-sm text-nowrap">
                  Restock Now
                </Link>
              </div>

              {/* Warning Alert */}
              <div className="alert-card-item alert-card-warning">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-hourglass-split text-warning fs-3"></i>
                  <div>
                    <strong className="text-warning d-block" style={{ color: '#b45309' }}>Pending Orders Awaiting Approval (4 Orders)</strong>
                    <span className="small text-secondary">4 orders awaiting dispatch authorization for &gt;12 hours.</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-sm btn-warning text-white fw-bold rounded-pill px-3 py-1.5 shadow-sm text-nowrap"
                  onClick={() => {
                    this.logAuditEvent('Authorized dispatch for 4 pending orders');
                    if (this.context && this.context.toastMessage) {
                      this.context.toastMessage('Dispatch order sent to logistics hub for 4 orders!', 'success');
                    }
                  }}
                >
                  Approve Now
                </button>
              </div>

              {/* System & DB Status */}
              <div className="alert-card-item alert-card-info">
                <div className="d-flex align-items-center gap-3">
                  <i className="bi bi-database-check text-success fs-3"></i>
                  <div>
                    <strong className="text-success d-block">MongoDB & Node.js API Infrastructure</strong>
                    <span className="small text-secondary">All system endpoints operating smoothly (Latency: 18ms • Uptime: 99.98%).</span>
                  </div>
                </div>
                <span className="badge bg-success text-white rounded-pill px-3 py-2 fw-bold text-nowrap">
                  Healthy
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
