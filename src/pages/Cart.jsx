import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Trash2, Plus, Minus, ShoppingBag, CreditCard, MapPin, Tag } from 'lucide-react';
import CheckoutModal from '../components/CheckoutModal';

export default function Cart() {
  const {
    cart,
    updateCartQuantity,
    removeFromCart,
    navigateTo,
    appliedCoupon,
    applyCoupon,
    removeCoupon
  } = useShop();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  
  // Delivery Pincode Simulator
  const [pincode, setPincode] = useState('');
  const [pincodeStatus, setPincodeStatus] = useState(null);

  // Coupon promo input states
  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState(null);

  const cartSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.value : 0;
  const grandTotal = Math.max(cartSubtotal - couponDiscount, 0);

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(pincode)) {
      setPincodeStatus({ success: false, msg: 'Please enter a valid 6-digit Pincode.' });
      return;
    }
    // Simulate pincode lookup
    setPincodeStatus({
      success: true,
      msg: `Delivering to Uttam Nagar East / Delhi NCR Region. Free express shipping available. Expected Delivery: Tomorrow!`
    });
  };

  const handleCouponApply = (e) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    
    const res = applyCoupon(couponCodeInput, cartSubtotal);
    setCouponFeedback({
      success: res.success,
      msg: res.msg
    });
    
    if (res.success) {
      setCouponCodeInput('');
    }
  };

  const handleCouponRemove = () => {
    removeCoupon();
    setCouponFeedback(null);
    setCouponCodeInput('');
  };

  if (cart.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '24px' }}>
          <ShoppingBag size={48} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Your Cart is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
          Looks like you haven't added any mobiles to your retail cart yet. Explore the latest smartphones.
        </p>
        <button className="btn btn-primary" onClick={() => navigateTo('catalog')}>
          Explore Mobiles
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '64px', paddingTop: '24px' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '32px' }}>Shopping Cart ({cart.length} items)</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {cart.map(item => {
            const rowSubtotal = item.product.price * item.quantity;
            
            return (
              <div 
                key={item.product.id} 
                className="glass-panel" 
                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px', border: '1px solid var(--border-color)' }}
              >
                {/* Thumb Visual */}
                <div style={{ width: '48px', height: '64px', borderRadius: '4px', background: item.product.imageColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ fontSize: '1rem' }}>📱</span>
                </div>

                {/* Name & specs */}
                <div style={{ flexGrow: 1 }}>
                  <h3 
                    style={{ fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
                    onClick={() => navigateTo('detail', item.product.id)}
                  >
                    {item.product.name}
                  </h3>
                  <span className="product-brand" style={{ fontSize: '0.7rem' }}>{item.product.brand}</span>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Unit Price: ₹{item.product.price.toLocaleString('en-IN')}
                  </div>
                </div>

                {/* Quantity adjustments */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--bg-tertiary)', padding: '4px 8px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                    style={{ padding: '4px', color: 'var(--text-secondary)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span style={{ minWidth: '24px', textAlign: 'center', fontSize: '0.9rem', fontWeight: 600 }}>
                    {item.quantity}
                  </span>
                  <button 
                    onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                    style={{ padding: '4px', color: 'var(--text-secondary)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>

                {/* Subtotal & Delete */}
                <div style={{ textAlign: 'right', minWidth: '110px' }}>
                  <div style={{ fontSize: '1.05rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    ₹{rowSubtotal.toLocaleString('en-IN')}
                  </div>
                  <button 
                    onClick={() => removeFromCart(item.product.id)}
                    style={{ color: 'var(--accent-danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', marginTop: '6px', fontWeight: 550 }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Totals Summary Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Pincode checking box */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <MapPin size={16} style={{ color: 'var(--accent-primary)' }} />
              Check Delivery Eligibility
            </h3>
            
            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px', marginBottom: pincodeStatus ? '12px' : 0 }}>
              <input
                type="text"
                placeholder="Enter 6-digit Pincode"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.85rem' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
                Check
              </button>
            </form>
            
            {pincodeStatus && (
              <div style={{
                fontSize: '0.75rem',
                color: pincodeStatus.success ? 'var(--accent-success)' : 'var(--accent-danger)',
                background: pincodeStatus.success ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)',
                border: pincodeStatus.success ? '1px dashed var(--accent-success)' : '1px dashed var(--accent-danger)',
                padding: '10px',
                borderRadius: '4px'
              }}>
                {pincodeStatus.msg}
              </div>
            )}
          </div>

          {/* Pricing Panel */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
              Order Billing Summary
            </h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '12px' }}>
              <span>Retail Subtotal</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>₹{cartSubtotal.toLocaleString('en-IN')}</span>
            </div>

            {/* Coupon discount row */}
            {appliedCoupon && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--accent-success)', marginBottom: '12px' }}>
                <span>Coupon ({appliedCoupon.code})</span>
                <span style={{ fontWeight: 600 }}>- ₹{couponDiscount.toLocaleString('en-IN')}</span>
              </div>
            )}
            
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px' }}>
              <span>Shipping & Handling</span>
              <span style={{ color: 'var(--accent-success)', fontWeight: 600 }}>FREE</span>
            </div>

            {/* Coupon Code Input Block */}
            <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '16px 0', margin: '16px 0' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 650, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Tag size={14} style={{ color: 'var(--accent-primary)' }} /> Apply Retail Coupon Code:
              </div>
              
              {!appliedCoupon ? (
                <form onSubmit={handleCouponApply} style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Enter Coupon (SHREESHYAM)"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.8rem' }}
                  />
                  <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                    Apply
                  </button>
                </form>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(16,185,129,0.06)', border: '1px dashed var(--accent-success)', padding: '8px 12px', borderRadius: '6px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                    Applied: {appliedCoupon.code}
                  </span>
                  <button 
                    onClick={handleCouponRemove}
                    style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', fontWeight: 600 }}
                  >
                    Remove
                  </button>
                </div>
              )}

              {couponFeedback && (
                <div style={{
                  fontSize: '0.75rem',
                  marginTop: '8px',
                  color: couponFeedback.success ? 'var(--accent-success)' : 'var(--accent-danger)'
                }}>
                  {couponFeedback.msg}
                </div>
              )}

              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', lineHeight: '1.4' }}>
                *Available coupons: <strong>SHREESHYAM</strong> (₹2.5k off on ₹50k+), <strong>JSS10</strong> (10% off), <strong>FIRSTBUY</strong> (₹1k off on ₹10k+).
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <span style={{ fontWeight: 700 }}>Total Payable Amount</span>
              <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
                ₹{grandTotal.toLocaleString('en-IN')}
              </span>
            </div>

            <button 
              className="btn btn-primary" 
              onClick={() => setCheckoutOpen(true)}
              style={{ width: '100%', gap: '10px' }}
            >
              <CreditCard size={18} />
              Proceed to payment gateway
            </button>
          </div>
        </div>

      </div>

      {/* Checkout Gateway Modal */}
      <CheckoutModal isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)} />
    </div>
  );
}
