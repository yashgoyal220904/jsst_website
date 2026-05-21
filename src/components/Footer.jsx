import React from 'react';
import { useShop } from '../context/ShopContext';
import { ShieldCheck, Truck, RotateCcw, Award } from 'lucide-react';

export default function Footer() {
  const { navigateTo } = useShop();

  return (
    <footer className="no-print" style={{ backgroundColor: 'var(--bg-secondary)', borderTop: '1px solid var(--border-color)', marginTop: '64px', padding: '48px 0 24px 0' }}>
      <div className="container">
        {/* Trust Badges */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '24px', paddingBottom: '32px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Award size={28} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>100% Genuine Products</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Directly sourced from official brands</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Truck size={28} style={{ color: 'var(--accent-primary)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Super Fast Shipping</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Free shipping across India on retail</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <RotateCcw size={28} style={{ color: 'var(--accent-gold)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Wholesale Price Tiers</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Better margins for bulk buyers</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ShieldCheck size={28} style={{ color: 'var(--accent-success)' }} />
            <div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600 }}>Secure Payments</h4>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Simulated secure UPI & card checkouts</p>
            </div>
          </div>
        </div>

        {/* Footer Details Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '32px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '1.2rem', marginBottom: '16px', fontWeight: 'bold' }}>
              JAI SHREE SHYAM <span className="gold-gradient-text">TRADERS</span>
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '12px' }}>
              Your trusted partner for bulk mobile distributions and premium retail mobile phones. Visit our offline showroom or shop online.
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              © 2026 Jai Shree Shyam Traders. All rights reserved.
            </p>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quick Links</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('catalog')}>Browse Mobiles</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('account')}>My Account Portal</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('account')}>Track My Orders</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('wholesale')}>Wholesale Desk</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>B2B & Wholesale</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('wholesale')}>Request Quotation</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('wholesale')}>Wholesale Volume Discounts</span>
              <span style={{ cursor: 'pointer' }} onClick={() => navigateTo('wholesale')}>Bulk Dealer Network</span>
              <span>GST Registration & Invoices</span>
              <span style={{ cursor: 'pointer', color: 'var(--accent-gold)', fontWeight: 550 }} onClick={() => navigateTo('admin')}>Staff Stock Manager</span>
            </div>
          </div>

          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Store Showroom</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '8px' }}>
              F22 Milap Nagar, Uttam Nagar East,<br />
              New Delhi, Delhi - 110059
            </p>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Helpline: +91 72062 61583<br />
              Email: jaishreeshyamtrader40@gmail.com
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Jai Shree Shyam Traders is a registered reseller. All mobile logos, images and specifications are trademarked properties of their respective owners (Apple, Samsung, OnePlus, etc.).
        </div>
      </div>
    </footer>
  );
}
