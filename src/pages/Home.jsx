import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { ArrowRight, Star, Sparkles, FileText, Smartphone, Award, ShieldCheck, Heart, Percent, Clock, Truck, PhoneCall, Send } from 'lucide-react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const { products, navigateTo, addToCart, submitCallbackQuery, bankOffers, flashDeal } = useShop();
  
  // Hero slider active item index
  const [heroIdx, setHeroIdx] = useState(0);

  // Rotating ticker index
  const [tickerIdx, setTickerIdx] = useState(0);

  // Countdown timer for Flash Deal
  const [timeLeft, setTimeLeft] = useState({ hours: 4, minutes: 48, seconds: 12 });

  // Callback Request Form State
  const [callbackForm, setCallbackForm] = useState({
    name: '',
    phone: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [callbackSuccess, setCallbackSuccess] = useState('');

  const tickers = [
    "⚡ NO-COST EMI available on Apple iPhone 15 & Samsung S24 Series. Get up to 12 Months EMI!",
    "🔥 Bank Deal: 10% Instant Discount on HDFC & ICICI Bank Credit Cards. T&C Apply.",
    "🚚 Super Fast Same-Day Delivery across Delhi NCR for orders before 4 PM!",
    "💼 Wholesalers: Add 5+ mobiles to your bulk quote to unlock 5% to 20% discount tiers!"
  ];

  const heroMobiles = [
    {
      id: "iphone-15-pro-max",
      tagline: "Titanium. Strong. Light. Pro.",
      desc: "Experience the aerospace-grade titanium design, A17 Pro chip, customizable Action button, and the most powerful iPhone camera system ever.",
      highlight: "From ₹1,59,900 | Brand Warranty"
    },
    {
      id: "samsung-s24-ultra",
      tagline: "Galaxy AI is here.",
      desc: "Welcome to the era of mobile AI. With Galaxy S24 Ultra, unleash whole new levels of creativity, productivity and possibility starting with your phone.",
      highlight: "S-Pen Included | 200MP Leica Camera"
    },
    {
      id: "oneplus-12",
      tagline: "Smooth Beyond Belief.",
      desc: "Redefined flagship specs combining the Qualcomm Snapdragon 8 Gen 3, 100W SUPERVOOC charging, and 4th Gen Hasselblad Camera System.",
      highlight: "16GB RAM + 512GB Storage | ₹69,999"
    }
  ];

  // Auto scroll hero banner every 6 seconds
  useEffect(() => {
    const heroTimer = setInterval(() => {
      setHeroIdx(prev => (prev + 1) % heroMobiles.length);
    }, 6000);
    return () => clearInterval(heroTimer);
  }, []);

  // Auto scroll ticker every 4.5 seconds
  useEffect(() => {
    const tickerTimer = setInterval(() => {
      setTickerIdx(prev => (prev + 1) % tickers.length);
    }, 4500);
    return () => clearInterval(tickerTimer);
  }, []);

  // Decrement flash countdown timer
  useEffect(() => {
    const countdownTimer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 6, minutes: 0, seconds: 0 }; // Loop it back to 6h
        }
      });
    }, 1000);
    return () => clearInterval(countdownTimer);
  }, []);

  const activeHeroProduct = products.find(p => p.id === heroMobiles[heroIdx].id);

  const brands = [
    { name: 'Apple', logo: '🍎', desc: 'iPhones' },
    { name: 'Samsung', logo: '🪐', desc: 'Galaxy Series' },
    { name: 'OnePlus', logo: '🔴', desc: 'Never Settle' },
    { name: 'Xiaomi', logo: '🟠', desc: 'HyperOS Tech' },
    { name: 'Realme', logo: '🟡', desc: 'Periscope Zoom' },
    { name: 'Vivo', logo: '🔵', desc: 'Zeiss Optics' }
  ];

  // Get dynamic background gradient for the cards
  const getBankBg = (bankId) => {
    const id = bankId.toUpperCase();
    if (id.includes('HDFC')) return 'linear-gradient(135deg, #0f2b5c 0%, #1e40af 100%)';
    if (id.includes('ICICI')) return 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)';
    if (id.includes('SBI')) return 'linear-gradient(135deg, #0369a1 0%, #0284c7 100%)';
    if (id.includes('AXIS')) return 'linear-gradient(135deg, #4c1d95 0%, #6d28d9 100%)';
    return 'linear-gradient(135deg, #1e293b 0%, #334155 100%)'; // default premium dark
  };

  const trustBadges = [
    { icon: <Award size={22} style={{ color: 'var(--accent-primary)' }} />, title: 'Genuine Warranty', desc: '100% official brand warranty' },
    { icon: <ShieldCheck size={22} style={{ color: 'var(--accent-primary)' }} />, title: 'Insured Shipping', desc: 'Free secure doorstep transit' },
    { icon: <Smartphone size={22} style={{ color: 'var(--accent-primary)' }} />, title: 'Easy Returns', desc: '7-day replacement policy' },
    { icon: <Star size={22} style={{ color: 'var(--accent-primary)' }} />, title: 'Uttam Nagar Store', desc: 'Self-pickup & local support' }
  ];

  // Hot selling mobiles (grab 4 products)
  const hotSelling = products.slice(0, 4);

  // Flash Sale Mobile Details (Dynamic)
  const flashProduct = flashDeal ? (products.find(p => p.id === flashDeal.product_id) || products.find(p => p.id === "xiaomi-14") || products[2] || products[0]) : (products.find(p => p.id === "xiaomi-14") || products[2]);
  const flashSalePrice = flashProduct ? Math.max(0, flashProduct.price - (flashDeal?.discount || 3500)) : 0;

  const handleHeroAction = () => {
    navigateTo('detail', activeHeroProduct.id);
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '64px' }}>
      
      {/* 0. PROMO TICKER STRIP */}
      <div style={{
        background: 'linear-gradient(90deg, rgba(239, 68, 68, 0.15) 0%, rgba(249, 115, 22, 0.15) 100%)',
        border: '1px solid rgba(249, 115, 22, 0.2)',
        borderRadius: '8px',
        padding: '12px 20px',
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '0.85rem',
        fontWeight: 650,
        color: '#f97316',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <Sparkles size={16} className="animate-pulse" style={{ color: '#f97316' }} />
        <span style={{ transition: 'opacity 0.3s ease-in-out' }}>{tickers[tickerIdx]}</span>
      </div>

      {/* 1. HERO SLIDER */}
      {activeHeroProduct && (
        <section className="hero-slider" style={{ marginTop: '20px' }}>
          <div className="hero-content">
            <span className="badge badge-blue" style={{ marginBottom: '16px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <Sparkles size={12} /> Hot Flagship Showcase
            </span>
            
            <h1 style={{ fontSize: '3.2rem', fontWeight: 800, lineHeight: '1.1', marginBottom: '16px' }}>
              {activeHeroProduct.name}
            </h1>
            
            <h2 className="gradient-text" style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: '16px' }}>
              {heroMobiles[heroIdx].tagline}
            </h2>
            
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: '1.6', marginBottom: '24px', maxWidth: '580px' }}>
              {heroMobiles[heroIdx].desc}
            </p>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                {heroMobiles[heroIdx].highlight}
              </span>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-primary" onClick={handleHeroAction}>
                Explore Specs <ArrowRight size={18} />
              </button>
              
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  addToCart(activeHeroProduct.id, 1);
                  navigateTo('cart');
                }}
              >
                Buy Now
              </button>
            </div>

            {/* Slider Dots */}
            <div style={{ display: 'flex', gap: '10px', marginTop: '48px' }}>
              {heroMobiles.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIdx(i)}
                  style={{
                    width: '32px',
                    height: '6px',
                    borderRadius: '3px',
                    background: i === heroIdx ? 'var(--accent-primary)' : 'var(--border-color)',
                    transition: 'background var(--transition-fast)'
                  }}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>

          <div className="hero-visual">
            <div className="hero-phone-render" style={{ background: activeHeroProduct.imageColor }}>
              <div className="hero-phone-inner" style={{ background: 'rgba(11, 15, 25, 0.9)' }}>
                <div className="hero-phone-island"></div>
                
                <div style={{ marginTop: '40px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>{activeHeroProduct.brand}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{activeHeroProduct.category}</div>
                </div>

                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>RAM:</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{activeHeroProduct.specs.ram}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span>Storage:</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{activeHeroProduct.specs.storage}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Camera:</span>
                    <span style={{ color: 'white', fontWeight: 600 }}>{activeHeroProduct.specs.backCamera.split(' ')[0]} MP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. CUSTOMER TRUST PILLARS */}
      <section style={{ marginBottom: '64px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
          {trustBadges.map((badge, idx) => (
            <div key={idx} className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(99, 102, 241, 0.1)' }}>
                {badge.icon}
              </div>
              <div>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>{badge.title}</h4>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{badge.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. SHOP BY BRAND */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>🪐</span> Shop Mobile Brands
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '20px' }}>
          {brands.map(b => (
            <div
              key={b.name}
              className="glass-panel"
              onClick={() => navigateTo('catalog')}
              style={{
                padding: '24px',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'transform var(--transition-fast), border-color var(--transition-fast)',
                border: '1px solid var(--border-color)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.borderColor = 'var(--border-color)';
              }}
            >
              <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>{b.logo}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>{b.name}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 4. BANK & WALLET CARDS CASHBACKS */}
      <section style={{ marginBottom: '64px' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Percent size={24} style={{ color: 'var(--accent-primary)' }} /> Partner Bank Discount Offers
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {bankOffers.map((offer) => (
            <div 
              key={offer.id} 
              style={{
                background: getBankBg(offer.id),
                color: '#ffffff',
                padding: '24px',
                borderRadius: 'var(--border-radius-md)',
                boxShadow: 'var(--shadow-md)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                height: '160px',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <div style={{ opacity: 0.15, position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '6rem', fontWeight: 800, pointerEvents: 'none' }}>
                💳
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                  {offer.bank}
                </span>
                <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.2)', padding: '3px 8px', borderRadius: '4px', fontWeight: 600 }}>
                  Active Promo
                </span>
              </div>
              <div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '8px 0 2px 0' }}>
                  {offer.type === 'percent' ? `${offer.value}% Instant Off` : `Flat ₹${offer.value.toLocaleString('en-IN')} Off`}
                </h3>
                <p style={{ fontSize: '0.75rem', opacity: 0.8 }}>{offer.desc}</p>
              </div>
              <div style={{ fontSize: '0.7rem', borderTop: '1px solid rgba(255,255,255,0.15)', paddingTop: '8px', color: 'rgba(255,255,255,0.9)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Code: {offer.id}</span>
                {offer.maxDiscount && (
                  <span>Max: ₹{offer.maxDiscount.toLocaleString('en-IN')}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. WEEKLY FLASH SALE PANEL WITH COUNTDOWN */}
      <section className="glass-panel home-flash-grid" style={{
        background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        padding: '36px',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '64px'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <span className="badge badge-gold" style={{ background: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)' }}>
              ⚡ Limited Time Flash Offer
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={14} /> Ends In:
            </span>
            {/* Live Ticking Countdown Box */}
            <div style={{ display: 'flex', gap: '4px', fontFamily: 'monospace', fontSize: '0.9rem', fontWeight: 700 }}>
              <span style={{ background: '#1f2937', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>
                {String(timeLeft.hours).padStart(2, '0')}
              </span>
              <span>:</span>
              <span style={{ background: '#1f2937', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>
                {String(timeLeft.minutes).padStart(2, '0')}
              </span>
              <span>:</span>
              <span style={{ background: '#1f2937', padding: '2px 6px', borderRadius: '4px', color: 'white' }}>
                {String(timeLeft.seconds).padStart(2, '0')}
              </span>
            </div>
          </div>

          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '8px' }}>
            Deal Of the Week: {flashProduct.name}
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.5', marginBottom: '24px' }}>
            {flashDeal?.description || `Take an extra ₹${(flashDeal?.discount || 3500).toLocaleString('en-IN')} direct checkout discount on the acclaimed ${flashProduct.name}.`}
          </p>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '20px' }}>
            <span style={{ fontSize: '2rem', fontWeight: 850, color: 'white', fontFamily: 'var(--font-display)' }}>
              ₹{flashSalePrice.toLocaleString('en-IN')}
            </span>
            {flashProduct.price > flashSalePrice && (
              <span style={{ fontSize: '1.1rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>
                ₹{flashProduct.price.toLocaleString('en-IN')}
              </span>
            )}
            <span className="badge badge-green">Save ₹{(flashDeal?.discount || 3500).toLocaleString('en-IN')} Extra</span>
          </div>

          {/* Dynamic Claimed Indicator Progress Bar */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
              <span>Deal claimed: 87%</span>
              <span style={{ color: '#ef4444', fontWeight: 600 }}>Only 2 units remaining at this price!</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--bg-tertiary)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ width: '87%', height: '100%', background: 'linear-gradient(90deg, #f87171 0%, #ef4444 100%)', borderRadius: '4px' }}></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <button 
              className="btn btn-primary" 
              style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none' }}
              onClick={() => {
                // Apply the item to cart with standard price, cart page handles the coupon/promo code
                addToCart(flashProduct.id, 1);
                navigateTo('cart');
              }}
            >
              Grab Flash Deal Now
            </button>
            <button className="btn btn-secondary" onClick={() => navigateTo('detail', flashProduct.id)}>
              Read Reviews
            </button>
          </div>
        </div>

        {/* Visual Mock */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="hero-phone-render" style={{ background: flashProduct.imageColor, transform: 'rotate(5deg)' }}>
            <div className="hero-phone-inner" style={{ background: 'rgba(11, 15, 25, 0.92)' }}>
              <div className="hero-phone-island"></div>
              
              <div style={{ marginTop: '40px', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{flashProduct.brand}</div>
                <span className="badge badge-gold" style={{ fontSize: '0.6rem', padding: '2px 6px', marginTop: '6px' }}>
                  {flashProduct.specs.backCamera ? `${flashProduct.specs.backCamera.split(' ')[0]} MP Camera` : 'Premium Flagship'}
                </span>
              </div>

              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '16px', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Screen:</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{flashProduct.specs.display ? flashProduct.specs.display.split(',')[0] : 'Touchscreen'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span>Processor:</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{flashProduct.specs.processor || 'Octa-Core'}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Battery:</span>
                  <span style={{ color: 'white', fontWeight: 600 }}>{flashProduct.specs.battery ? flashProduct.specs.battery.split(' ')[0] : 'Dynamic'} mAh</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. WHOLESALE & B2B CALLOUT */}
      <section className="glass-panel" style={{
        background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.05) 0%, rgba(19, 26, 46, 0.8) 100%)',
        border: '1px solid rgba(251, 191, 36, 0.2)',
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        marginBottom: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '32px'
      }}>
        <div style={{ flex: '1 1 500px' }}>
          <span className="badge badge-gold" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            ★ Bulk Dealers & Shop Owners
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '12px' }}>
            Mobile Wholesale Distribution Channel
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '16px' }}>
            Need inventory for your physical mobile shop? Take instant proforma quotations from Jai Shree Shyam Traders. Add products to your Quotation basket, adjust volumes to trigger discounts from 5% to 20%, and download your printable official PDF quotation.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '0.85rem', fontWeight: 550 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} style={{ color: 'var(--accent-gold)' }} /> 5+ Mobiles Min. Order
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={16} style={{ color: 'var(--accent-gold)' }} /> GST Invoices Generated
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Award size={16} style={{ color: 'var(--accent-gold)' }} /> Free Insured Delivery
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button className="btn btn-gold" onClick={() => navigateTo('wholesale')}>
            <FileText size={18} /> Request Wholesale Quotation
          </button>
          <button className="btn btn-secondary" onClick={() => navigateTo('catalog')}>
            Explore Bulk Models
          </button>
        </div>
      </section>

      {/* 7. HOT SELLING MODELS */}
      <section>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800 }}>🔥 Hot Selling Mobiles</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>The most popular models purchased this week.</p>
          </div>
          <button className="btn btn-secondary" onClick={() => navigateTo('catalog')} style={{ fontSize: '0.85rem' }}>
            View All Mobiles
          </button>
        </div>

        <div className="product-grid">
          {hotSelling.map(product => (
            ProductCard && <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 8. QUICK CALLBACK & CONTACT INQUIRY SECTION */}
      <section className="glass-panel home-callback-grid" style={{
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        padding: '40px',
        borderRadius: 'var(--border-radius-lg)',
        marginTop: '64px'
      }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '12px', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
            <PhoneCall size={12} /> Live Showroom Support
          </span>
          <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '16px' }}>
            Have Questions? <br />Request a Callback
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '24px' }}>
            Need help selecting the right smartphone or pricing structure? Send us your callback request, and one of our dedicated customer service representatives from our Uttam Nagar East showroom will get back to you within 2 hours.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <div>📍 Showroom: F22 Milap Nagar, Uttam Nagar East, New Delhi</div>
            <div>📞 Business Helpline: +91 72062 61583</div>
            <div>✉️ Email Support: jaishreeshyamtrader40@gmail.com</div>
          </div>
        </div>

        <div>
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              if (!callbackForm.name || !callbackForm.phone || !callbackForm.message) {
                alert("Please fill in name, phone, and inquiry details.");
                return;
              }
              submitCallbackQuery(
                callbackForm.name,
                callbackForm.phone,
                callbackForm.email || 'N/A',
                callbackForm.subject,
                callbackForm.message
              );
              setCallbackSuccess('Success! Your callback request has been logged. Our staff will call you shortly.');
              setCallbackForm({ name: '', phone: '', email: '', subject: 'General Inquiry', message: '' });
              setTimeout(() => setCallbackSuccess(''), 5000);
            }}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
          >
            {callbackSuccess && (
              <div className="badge badge-green" style={{ padding: '12px 16px', fontSize: '0.85rem', textAlign: 'center', width: '100%' }}>
                {callbackSuccess}
              </div>
            )}
            
            <div className="grid-responsive-2col">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Kumar"
                  value={callbackForm.name}
                  onChange={(e) => setCallbackForm({ ...callbackForm, name: e.target.value })}
                />
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9812345678"
                  value={callbackForm.phone}
                  onChange={(e) => setCallbackForm({ ...callbackForm, phone: e.target.value })}
                />
              </div>
            </div>

            <div className="grid-responsive-2col">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="name@example.com (Optional)"
                  value={callbackForm.email}
                  onChange={(e) => setCallbackForm({ ...callbackForm, email: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Inquiry Subject *</label>
                <select
                  value={callbackForm.subject}
                  onChange={(e) => setCallbackForm({ ...callbackForm, subject: e.target.value })}
                  style={{ background: 'var(--bg-primary)' }}
                >
                  <option value="General Inquiry">General Inquiry</option>
                  <option value="Retail Purchase">Retail Purchase</option>
                  <option value="Bulk B2B Deal">Bulk B2B Deal</option>
                  <option value="EMI & Exchange">EMI & Exchange Options</option>
                  <option value="Order Tracking">Order tracking</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>How can we help you? *</label>
              <textarea
                rows={3}
                required
                placeholder="Let us know what models or details you are inquiring about..."
                value={callbackForm.message}
                onChange={(e) => setCallbackForm({ ...callbackForm, message: e.target.value })}
                style={{ resize: 'none' }}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <Send size={16} /> Submit Callback Request
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
