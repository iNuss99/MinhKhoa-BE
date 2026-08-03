import React, { Component } from 'react';

class Home extends Component {
  render() {
    return (
      <div className="content-card" style={{ textAlign: 'center', padding: '48px 24px' }}>
        <h2 className="card-title" style={{ borderBottom: 'none', marginBottom: '8px', fontSize: '1.75rem' }}>
          Welcome to SHOPPING ONLINE Administration
        </h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>
          Manage categories, products, and store operations efficiently.
        </p>
        <div style={{ maxWidth: '600px', margin: '0 auto', overflow: 'hidden', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-md)' }}>
          <img
            src="https://theselfishmeme.co.uk/wp-content/uploads/2026/04/hinh-dai-dien-mat-cuoi-de-thuong-va-binh-yen-10.webp"
            alt="Admin Home"
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </div>
    );
  }
}
export default Home;
