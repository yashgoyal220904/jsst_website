import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Star, ShoppingCart, FileText, ArrowLeft, Scale, Award, ShieldCheck, Check, Info, Percent, MapPin, Truck, RefreshCw } from 'lucide-react';

export default function Detail() {
  const {
    products,
    selectedProductId,
    cart,
    quoteItems,
    compareItems,
    addToCart,
    addToQuote,
    toggleCompare,
    navigateTo,
    bankOffers
  } = useShop();

  const product = products.find(p => p.id === selectedProductId);

  // States for promo elements
  const [activeBankOffer, setActiveBankOffer] = useState(null);
  
  // Exchange states
  const [exchangeBrand, setExchangeBrand] = useState('');
  const [exchangeCondition, setExchangeCondition] = useState('');

  // Delivery check state
  const [pincode, setPincode] = useState('');
  const [deliveryStatus, setDeliveryStatus] = useState(null);

  if (!product) {
    return (
      <div className="container" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <h2>Product Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>The requested mobile phone details could not be loaded.</p>
        <button className="btn btn-primary" onClick={() => navigateTo('catalog')}>
          Go to Catalog
        </button>
      </div>
    );
  }

  const isCompared = compareItems.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.product.id === product.id);
  const isInQuote = quoteItems.some(item => item.product.id === product.id);
  
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  // Dynamic bank offer configurations from SQLite
  const bankOffersList = bankOffers.map(offer => {
    let computedValue = 0;
    if (offer.type === 'flat') {
      computedValue = offer.value;
    } else if (offer.type === 'percent') {
      computedValue = Math.min(Math.round(product.price * (offer.value / 100)), offer.maxDiscount || Infinity);
    }
    return {
      id: offer.id,
      bank: offer.bank,
      desc: offer.desc,
      value: computedValue
    };
  });

  // Calculate bank offer deduction
  const selectedOffer = bankOffersList.find(o => o.id === activeBankOffer);
  const bankDeduction = selectedOffer ? selectedOffer.value : 0;

  // Calculate simulated exchange value
  const getExchangeValue = () => {
    if (!exchangeBrand || !exchangeCondition) return 0;
    let baseVal = 2000;
    if (exchangeBrand === 'Apple') baseVal = 14000;
    else if (exchangeBrand === 'Samsung') baseVal = 9500;
    else if (exchangeBrand === 'OnePlus') baseVal = 7000;
    else if (exchangeBrand === 'Xiaomi') baseVal = 4500;

    let multiplier = 1.0;
    if (exchangeCondition === 'Excellent') multiplier = 1.25;
    else if (exchangeCondition === 'Good') multiplier = 0.95;
    else if (exchangeCondition === 'Fair') multiplier = 0.55;

    // Cap exchange value to 40% of phone price
    return Math.min(Math.round(baseVal * multiplier), Math.round(product.price * 0.40));
  };

  const exchangeVal = getExchangeValue();
  const effectivePrice = Math.max(product.price - bankDeduction - exchangeVal, 1000);

  const handleAddToCart = () => {
    addToCart(product.id, 1);
    navigateTo('cart');
  };

  const handleAddToQuote = () => {
    addToQuote(product.id, 5);
    navigateTo('wholesale');
  };

  const handlePincodeCheck = (e) => {
    e.preventDefault();
    if (pincode.length !== 6 || isNaN(pincode)) {
      setDeliveryStatus({ success: false, msg: 'Invalid pincode format.' });
      return;
    }
    // Delhi NCR simulation
    if (pincode.startsWith('11')) {
      setDeliveryStatus({
        success: true,
        msg: '🚚 Super Fast Express Delivery available! Get it by tomorrow evening!'
      });
    } else {
      setDeliveryStatus({
        success: true,
        msg: '📦 Insured shipping available. Delivery in 3-5 working days.'
      });
    }
  };

  // Monthly installment calculator
  const emiRates = [
    { months: 3, interest: 0 },
    { months: 6, interest: 0 },
    { months: 9, interest: 0 },
    { months: 12, interest: 0 }
  ];

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '64px', paddingTop: '24px' }}>
      
      {/* Back Button */}
      <button 
        className="btn btn-secondary" 
        onClick={() => navigateTo('catalog')}
        style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
      >
        <ArrowLeft size={16} /> Back to Mobiles Catalog
      </button>

      {/* Main Grid */}
      <div className="detail-layout">
        
        {/* Left Column: Visual Render */}
        <div className="detail-gallery">
          <div className="detail-main-visual" style={{ background: product.imageColor }}>
            <div className="detail-phone-mockup">
              <div className="card-phone-screen" style={{ background: 'rgba(0,0,0,0.85)', padding: '24px' }}>
                <span style={{ fontSize: '2.5rem', marginBottom: '8px' }}>📱</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, letterSpacing: '0.05em' }}>{product.brand}</div>
                <div style={{ fontSize: '0.8rem', opacity: 0.5, marginTop: '8px' }}>
                  {product.specs.processor}
                </div>
              </div>
            </div>
          </div>
          
          {/* Compare trigger button */}
          <button 
            className={`btn ${isCompared ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => toggleCompare(product)}
            style={{ width: '100%', borderColor: isCompared ? 'var(--accent-primary)' : 'var(--border-color)' }}
          >
            <Scale size={16} />
            <span>{isCompared ? "Compared (Remove)" : "Add to Specification Comparison"}</span>
          </button>
        </div>

        {/* Right Column: Specs details & Actions */}
        <div className="detail-info">
          <span className="product-brand" style={{ fontSize: '0.85rem' }}>{product.brand}</span>
          <h1 style={{ fontSize: '2.4rem', fontWeight: 800, margin: '8px 0 16px 0', lineHeight: '1.2' }}>{product.name}</h1>

          {/* Rating */}
          <div className="rating-container" style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="rating-star"
                  style={{
                    fill: i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none',
                    color: 'var(--accent-gold)'
                  }}
                />
              ))}
            </div>
            <strong style={{ fontSize: '1rem', color: 'var(--text-primary)' }}>{product.rating}</strong>
            <span style={{ color: 'var(--text-secondary)' }}>({product.reviewsCount} verified reviews)</span>
          </div>

          {/* Pricing Box with Bank Offers */}
          <div className="glass-panel" style={{ padding: '24px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '2.2rem', fontWeight: 850, fontFamily: 'var(--font-display)', color: 'var(--text-primary)' }}>
                ₹{effectivePrice.toLocaleString('en-IN')}
              </span>
              {(product.mrp > product.price || bankDeduction > 0 || exchangeVal > 0) && (
                <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                  ₹{product.mrp.toLocaleString('en-IN')}
                </span>
              )}
              {discount > 0 && bankDeduction === 0 && exchangeVal === 0 && (
                <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  Save {discount}%
                </span>
              )}
              {(bankDeduction > 0 || exchangeVal > 0) && (
                <span className="badge badge-gold" style={{ fontSize: '0.8rem', padding: '4px 10px' }}>
                  Effective Deal Price
                </span>
              )}
            </div>

            {/* Clickable Bank Cashback list */}
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 650, marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <Percent size={14} style={{ color: 'var(--accent-primary)' }} /> Select Payment Cashback Offer:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                {bankOffersList.map(offer => (
                  <button
                    key={offer.id}
                    onClick={() => setActiveBankOffer(prev => prev === offer.id ? null : offer.id)}
                    style={{
                      background: activeBankOffer === offer.id ? 'rgba(99, 102, 241, 0.15)' : 'var(--bg-tertiary)',
                      border: activeBankOffer === offer.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: activeBankOffer === offer.id ? 'white' : 'var(--text-secondary)',
                      transition: 'all var(--transition-fast)'
                    }}
                  >
                    <strong style={{ display: 'block', color: activeBankOffer === offer.id ? 'var(--accent-primary)' : 'var(--text-primary)' }}>{offer.bank}</strong>
                    <span>{offer.desc}</span>
                  </button>
                ))}
              </div>
              {activeBankOffer && (
                <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Check size={12} /> Applied {activeBankOffer} bank cashback. Deducted ₹{bankDeduction.toLocaleString('en-IN')}!
                </div>
              )}
            </div>
          </div>

          {/* Delivery Availability Checker */}
          <div className="glass-panel" style={{ padding: '16px 20px', marginBottom: '32px', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 700, marginBottom: '10px' }}>
              <MapPin size={16} style={{ color: 'var(--accent-primary)' }} /> Check Uttam Nagar East & Regional Delivery
            </div>
            <form onSubmit={handlePincodeCheck} style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Enter 6-digit Pincode (e.g. 110005)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                style={{ flexGrow: 1, padding: '8px 12px', fontSize: '0.8rem' }}
              />
              <button type="submit" className="btn btn-secondary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Check
              </button>
            </form>
            {deliveryStatus && (
              <div style={{ fontSize: '0.75rem', marginTop: '8px', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>{deliveryStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Core Spec Icons Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginBottom: '32px' }}>
            <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Processor</div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>{product.specs.processor.split(' ')[0]}</strong>
            </div>
            <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Memory</div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>{product.specs.ram} RAM</strong>
            </div>
            <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Storage</div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>{product.specs.storage}</strong>
            </div>
            <div className="glass-panel" style={{ padding: '12px', textAlign: 'center', fontSize: '0.8rem' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '4px' }}>Battery</div>
              <strong style={{ display: 'block', fontSize: '0.85rem' }}>{product.specs.battery.split(' ')[0]} mAh</strong>
            </div>
          </div>

          {/* Actions Cards Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '32px' }}>
            
            {/* Retail Option Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '6px' }}>Retail Checkout</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
                  Buy directly with free insured home delivery. Simulated card or UPI checkouts.
                </p>
              </div>
              
              <button 
                className="btn btn-primary" 
                onClick={handleAddToCart}
                style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem', background: isInCart ? 'var(--accent-success)' : 'var(--accent-primary)' }}
              >
                <ShoppingCart size={16} />
                <span>{isInCart ? 'In Shopping Cart' : 'Buy Online Now'}</span>
              </button>
            </div>

            {/* Wholesale Option Card */}
            <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', border: '1px solid rgba(251, 191, 36, 0.2)' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--accent-gold)' }}>Wholesale Quotes</h3>
                  <span className="badge badge-gold" style={{ fontSize: '0.65rem' }}>Min. 5 Qty</span>
                </div>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: '1.4' }}>
                  Request bulk dealership prices. Automate up to 20% discount tiers and print PDF invoices.
                </p>
              </div>

              <button 
                className="btn btn-gold" 
                onClick={handleAddToQuote}
                style={{ width: '100%', padding: '10px 16px', fontSize: '0.85rem' }}
              >
                <FileText size={16} />
                <span>{isInQuote ? 'In Quotation List' : 'Add to Bulk Quote'}</span>
              </button>
            </div>

          </div>

          {/* Highlights Bullets */}
          <div style={{ marginBottom: '32px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '12px' }}>Key Selling Points</h3>
            <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {product.features.map((feat, idx) => (
                <li key={idx} style={{ lineHeight: '1.5' }}>
                  <strong style={{ color: 'var(--text-primary)' }}>{feat}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

      </div>

      {/* Interactive Widgets: Exchange and EMI Installments */}
      <div className="detail-widgets-grid">
        
        {/* Widget 1: Mobile Exchange-in Calculator */}
        <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
            <RefreshCw size={20} /> Mobile Exchange Value Estimator
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            Trade in your old smartphone at Jai Shree Shyam Traders! Select your brand and device condition below to compute an instant exchange valuation.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                SELECT OLD PHONE BRAND
              </label>
              <select
                value={exchangeBrand}
                onChange={(e) => setExchangeBrand(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
              >
                <option value="">-- Choose Brand --</option>
                <option value="Apple">Apple iPhone</option>
                <option value="Samsung">Samsung Galaxy</option>
                <option value="OnePlus">OnePlus Device</option>
                <option value="Xiaomi">Xiaomi / Redmi</option>
                <option value="Other">Other Smartphone</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 600 }}>
                SELECT DEVICE CONDITION
              </label>
              <select
                value={exchangeCondition}
                onChange={(e) => setExchangeCondition(e.target.value)}
                style={{ width: '100%', fontSize: '0.85rem', padding: '10px' }}
                disabled={!exchangeBrand}
              >
                <option value="">-- Choose Condition --</option>
                <option value="Excellent">Excellent (No scratches, fully working)</option>
                <option value="Good">Good (Minor wear, fully functional)</option>
                <option value="Fair">Fair (Scratches or dents, working screen)</option>
              </select>
            </div>
          </div>

          {exchangeVal > 0 && (
            <div style={{
              marginTop: '24px',
              padding: '16px',
              borderRadius: '8px',
              background: 'rgba(16, 185, 129, 0.06)',
              border: '1px dashed var(--accent-success)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Estimated Buyback Value:</div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--accent-success)', margin: '4px 0' }}>
                ₹{exchangeVal.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                *Subject to physical device verification at our Milap Nagar counter.
              </div>
            </div>
          )}
        </div>

        {/* Widget 2: No-Cost EMI Breakdowns */}
        <div className="glass-panel" style={{ padding: '32px', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Percent size={20} style={{ color: 'var(--accent-primary)' }} /> No-Cost EMI Installment Schedules
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: '1.5' }}>
            Buy now, pay later! Dynamic EMI breakdown computed for this device at 0% interest with top banking partners:
          </p>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-muted)' }}>
                <th style={{ textAlign: 'left', padding: '10px 0', fontSize: '0.75rem' }}>TENURE</th>
                <th style={{ textAlign: 'center', padding: '10px 0', fontSize: '0.75rem' }}>INTEREST</th>
                <th style={{ textAlign: 'right', padding: '10px 0', fontSize: '0.75rem' }}>MONTHLY Payout</th>
              </tr>
            </thead>
            <tbody>
              {emiRates.map((rate, i) => {
                const monthly = Math.round(product.price / rate.months);
                return (
                  <tr key={i} style={{ borderBottom: i === emiRates.length - 1 ? 'none' : '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 0', fontWeight: 600 }}>{rate.months} Months EMI</td>
                    <td style={{ padding: '12px 0', textAlign: 'center', color: 'var(--accent-success)', fontWeight: 600 }}>0% (No-Cost)</td>
                    <td style={{ padding: '12px 0', textAlign: 'right', fontWeight: 700, color: 'white' }}>
                      ₹{monthly.toLocaleString('en-IN')}/mo
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            <Info size={12} />
            <span>Available on Credit Cards of HDFC, ICICI, SBI, and Axis Bank.</span>
          </div>
        </div>

      </div>

      {/* Complete Specification Table Section */}
      <section className="glass-panel animate-fade-in" style={{ padding: '32px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          Complete Technical Specifications
        </h2>
        
        <table className="specs-table" style={{ margin: 0 }}>
          <tbody>
            <tr>
              <td className="spec-name">Model Name</td>
              <td className="spec-val">{product.name}</td>
            </tr>
            <tr>
              <td className="spec-name">Brand Manufacturer</td>
              <td className="spec-val">{product.brand}</td>
            </tr>
            <tr>
              <td className="spec-name">Display specifications</td>
              <td className="spec-val">{product.specs.display}</td>
            </tr>
            <tr>
              <td className="spec-name">Processor (SoC)</td>
              <td className="spec-val">{product.specs.processor}</td>
            </tr>
            <tr>
              <td className="spec-name">System RAM Memory</td>
              <td className="spec-val">{product.specs.ram}</td>
            </tr>
            <tr>
              <td className="spec-name">Internal Flash Storage</td>
              <td className="spec-val">{product.specs.storage}</td>
            </tr>
            <tr>
              <td className="spec-name">Rear Camera Cluster</td>
              <td className="spec-val">{product.specs.backCamera}</td>
            </tr>
            <tr>
              <td className="spec-name">Front Selfie Camera</td>
              <td className="spec-val">{product.specs.frontCamera}</td>
            </tr>
            <tr>
              <td className="spec-name">Battery Power & Charging</td>
              <td className="spec-val">{product.specs.battery}</td>
            </tr>
            <tr>
              <td className="spec-name">Operating System</td>
              <td className="spec-val">{product.specs.os}</td>
            </tr>
            <tr>
              <td className="spec-name">Cellular Network Modes</td>
              <td className="spec-val">{product.specs.network}</td>
            </tr>
            <tr>
              <td className="spec-name">Device Weight</td>
              <td className="spec-val">{product.specs.weight}</td>
            </tr>
          </tbody>
        </table>
      </section>

    </div>
  );
}
