import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Plus, Minus, Trash2, FileText, Sparkles, Calculator, Briefcase } from 'lucide-react';
import QuotationSheet from '../components/QuotationSheet';

export default function Wholesale() {
  const {
    quoteItems,
    updateQuoteQuantity,
    removeFromQuote,
    submitWholesaleQuery,
    navigateTo
  } = useShop();

  // Print Mode State
  const [showPrintable, setShowPrintable] = useState(false);
  
  // Dealer Details State
  const [dealerForm, setDealerForm] = useState(() => ({
    companyName: '',
    gstNumber: '',
    contactName: '',
    phone: '',
    email: '',
    deliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 5 days from today
    comments: ''
  }));

  const getDiscountTier = (qty) => {
    if (qty >= 51) return 20;
    if (qty >= 26) return 15;
    if (qty >= 11) return 10;
    if (qty >= 5) return 5;
    return 0;
  };

  const getNextTierThreshold = (qty) => {
    if (qty < 5) return { next: 5, needed: 5 - qty, discount: 5 };
    if (qty < 11) return { next: 11, needed: 11 - qty, discount: 10 };
    if (qty < 26) return { next: 26, needed: 26 - qty, discount: 15 };
    if (qty < 51) return { next: 51, needed: 51 - qty, discount: 20 };
    return null; // Already at max discount
  };

  // Financial sums
  const totalVolume = quoteItems.reduce((acc, item) => acc + item.quantity, 0);
  const retailTotal = quoteItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  
  const discountTotal = quoteItems.reduce((acc, item) => {
    const disc = getDiscountTier(item.quantity);
    const discAmount = (item.product.price * (disc / 100)) * item.quantity;
    return acc + discAmount;
  }, 0);

  const taxableTotal = retailTotal - discountTotal;

  const handleDealerChange = (e) => {
    setDealerForm({ ...dealerForm, [e.target.name]: e.target.value });
  };

  const handleGenerateQuote = (e) => {
    e.preventDefault();
    if (!dealerForm.companyName || !dealerForm.contactName || !dealerForm.phone || !dealerForm.email) {
      alert("Please fill all required business fields.");
      return;
    }
    submitWholesaleQuery(dealerForm, quoteItems);
    setShowPrintable(true);
  };

  // If in printable proforma invoice state, render QuotationSheet instead
  if (showPrintable) {
    return (
      <QuotationSheet
        quoteData={dealerForm}
        quoteItems={quoteItems}
        onBack={() => setShowPrintable(false)}
      />
    );
  }

  if (quoteItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '24px' }}>
          <Briefcase size={48} style={{ color: 'var(--accent-gold)' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Your Quotation Basket is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '500px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
          Add smartphones to your B2B list from the catalog. Minimum volume to trigger wholesale dealer discounts is <strong>5 units per mobile model</strong>.
        </p>
        <button className="btn btn-gold" onClick={() => navigateTo('catalog')}>
          Explore Wholesale Mobiles
        </button>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '64px', paddingTop: '24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <span className="badge badge-gold" style={{ marginBottom: '8px' }}>Dealer B2B Dashboard</span>
        <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Wholesale Quotation Manager</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Review quantities and customize your dealer profile to build an official PDF quote.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.7fr 1.1fr', gap: '32px', alignItems: 'start' }}>
        
        {/* Left Side: Wholesale items list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {quoteItems.map(item => {
            const discTier = getDiscountTier(item.quantity);
            const netUnit = item.product.price * (1 - discTier / 100);
            const rowSubtotal = netUnit * item.quantity;
            const nextTier = getNextTierThreshold(item.quantity);

            return (
              <div 
                key={item.product.id} 
                className="glass-panel" 
                style={{ padding: '24px', border: '1px solid var(--border-color)', position: 'relative' }}
              >
                {/* Brand & Title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ width: '40px', height: '54px', borderRadius: '4px', background: item.product.imageColor, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: '0.9rem' }}>📱</span>
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{item.product.name}</h3>
                    <span className="product-brand" style={{ fontSize: '0.7rem' }}>{item.product.brand}</span>
                  </div>

                  <span className="badge badge-gold" style={{ marginLeft: 'auto', fontSize: '0.75rem' }}>
                    {discTier}% Wholesale Disc.
                  </span>
                </div>

                {/* Pricing values */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '12px 0', margin: '12px 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  <div>
                    Base Price: <strong style={{ color: 'var(--text-primary)' }}>₹{item.product.price.toLocaleString('en-IN')}</strong>
                  </div>
                  <div>
                    Net Unit Price: <strong style={{ color: 'var(--text-primary)' }}>₹{netUnit.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    Row Subtotal: <strong style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>₹{rowSubtotal.toLocaleString('en-IN')}</strong>
                  </div>
                </div>

                {/* Adjusting Quantity + Next Discount Threshold Advice */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  
                  {/* Quantity step */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Bulk Quantity:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-tertiary)', padding: '3px 8px', borderRadius: 'var(--border-radius-sm)', border: '1px solid var(--border-color)' }}>
                      <button 
                        onClick={() => updateQuoteQuantity(item.product.id, item.quantity - 1)}
                        style={{ padding: '4px', color: 'var(--text-secondary)' }}
                        title="Decrease quantity"
                      >
                        <Minus size={12} />
                      </button>
                      <span style={{ minWidth: '32px', textAlign: 'center', fontSize: '0.85rem', fontWeight: 700 }}>
                        {item.quantity}
                      </span>
                      <button 
                        onClick={() => updateQuoteQuantity(item.product.id, item.quantity + 1)}
                        style={{ padding: '4px', color: 'var(--text-secondary)' }}
                        title="Increase quantity"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Tier advice */}
                  {nextTier ? (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontStyle: 'italic' }}>
                      Add {nextTier.needed} more to get <strong>{nextTier.discount}% off</strong>!
                    </div>
                  ) : (
                    <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                      ✓ Max 20% Wholesale Discount Applied!
                    </div>
                  )}

                  {/* Delete Row button */}
                  <button 
                    onClick={() => removeFromQuote(item.product.id)}
                    style={{ color: 'var(--accent-danger)', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', fontWeight: 550 }}
                  >
                    <Trash2 size={12} /> Remove
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Side: Quote pricing summary & Dealer Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Discount Progress Bar representation */}
          <div className="glass-panel" style={{ padding: '24px', border: '1px solid var(--border-color)' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '8px' }}>Wholesale Discount Tiers</h3>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>Aggregate volumes across all items to track discounts.</p>
            
            <div className="discount-progress-bar">
              <div 
                className="discount-progress-fill" 
                style={{ width: `${Math.min(100, (totalVolume / 60) * 100)}%` }}
              ></div>
              
              {/* Markers */}
              <div className="discount-marker" style={{ left: '8.3%' }}>
                <div className="discount-marker-dot active"></div>
                <span>5 (5%)</span>
              </div>
              <div className="discount-marker" style={{ left: '18.3%' }}>
                <div className={`discount-marker-dot ${totalVolume >= 11 ? 'active' : ''}`}></div>
                <span>11 (10%)</span>
              </div>
              <div className="discount-marker" style={{ left: '43.3%' }}>
                <div className={`discount-marker-dot ${totalVolume >= 26 ? 'active' : ''}`}></div>
                <span>26 (15%)</span>
              </div>
              <div className="discount-marker" style={{ left: '85%' }}>
                <div className={`discount-marker-dot ${totalVolume >= 51 ? 'active' : ''}`}></div>
                <span>51 (20%)</span>
              </div>
            </div>

            {/* Calculations summaries */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.8rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Total Mobile Devices</span>
                <strong style={{ color: 'white' }}>{totalVolume} units</strong>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Standard Retail Value</span>
                <span>₹{retailTotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-success)' }}>
                <span>Wholesale Discounts (-)</span>
                <strong>-₹{discountTotal.toLocaleString('en-IN')}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-gold)' }}>
              <span>Dealer Net Price (Excl. Tax)</span>
              <span style={{ fontFamily: 'var(--font-display)' }}>₹{taxableTotal.toLocaleString('en-IN')}</span>
            </div>
          </div>

          {/* Business customer Form fields */}
          <form onSubmit={handleGenerateQuote} className="glass-panel animate-fade-in" style={{ padding: '24px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Briefcase size={16} style={{ color: 'var(--accent-gold)' }} />
              Dealer Information Profile
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Company / Shop Name *</label>
              <input
                type="text"
                name="companyName"
                required
                placeholder="e.g. Verma Mobile Galleria"
                value={dealerForm.companyName}
                onChange={handleDealerChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>GSTIN (GST Identification Number)</label>
              <input
                type="text"
                name="gstNumber"
                placeholder="15-character ID (Optional)"
                maxLength={15}
                value={dealerForm.gstNumber}
                onChange={handleDealerChange}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Contact Person *</label>
                <input
                  type="text"
                  name="contactName"
                  required
                  placeholder="e.g. Amit Verma"
                  value={dealerForm.contactName}
                  onChange={handleDealerChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9988776655"
                  value={dealerForm.phone}
                  onChange={handleDealerChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Corporate Email *</label>
              <input
                type="email"
                name="email"
                required
                placeholder="e.g. orders@vermamobiles.com"
                value={dealerForm.email}
                onChange={handleDealerChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Preferred Delivery Target Date</label>
              <input
                type="date"
                name="deliveryDate"
                value={dealerForm.deliveryDate}
                onChange={handleDealerChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Special Comments / Requests</label>
              <textarea
                name="comments"
                rows={2}
                placeholder="Specify delivery packaging requirements, logistics choice etc."
                value={dealerForm.comments}
                onChange={handleDealerChange}
                style={{ resize: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-gold" style={{ width: '100%', marginTop: '10px' }}>
              <Calculator size={18} />
              Generate Official Quotation
            </button>
          </form>
        </div>

      </div>
    </div>
  );
}
