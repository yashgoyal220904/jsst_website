import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { Shield, Plus, RotateCcw, Trash2, Edit2, X, Search, Tag, MessageSquare, Inbox, Check, Calendar, Phone, Mail, Award, Trash } from 'lucide-react';

export default function Admin() {
  const { 
    products, 
    updateProductStock, 
    updateProductPrice, 
    updateProduct, 
    addProduct, 
    deleteProduct, 
    resetProducts,
    coupons,
    queries,
    addCoupon,
    deleteCoupon,
    resetCoupons,
    deleteQuery,
    resetQueries,
    bankOffers,
    addBankOffer,
    deleteBankOffer,
    resetBankOffers,
    updateBankOffer,
    flashDeal,
    updateFlashDeal,
    resetFlashDeal,
    orders,
    updateOrderStatus,
    deleteOrder
  } = useShop();

  const [authCode, setAuthCode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('jss_admin_auth') === 'true';
  });
  const [authError, setAuthError] = useState('');

  // Active Tab: 'stock', 'offers', 'queries', 'orders'
  const [activeTab, setActiveTab] = useState('stock');

  // Search & Filter (Stock tab)
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('All');

  // Modal control (Stock tab)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProductId, setEditingProductId] = useState(null);

  // Add Product Form State
  const initialFormState = {
    id: '',
    name: '',
    brand: '',
    category: 'Flagship',
    price: '',
    mrp: '',
    display: '',
    processor: '',
    ram: '',
    storage: '',
    backCamera: '',
    frontCamera: '',
    battery: '',
    os: '',
    featuresInput: '',
    imageColor: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
    inStock: true
  };
  const [form, setForm] = useState(initialFormState);

  // Add Coupon Form State
  const initialCouponState = {
    code: '',
    type: 'flat',
    value: '',
    minSubtotal: '',
    description: ''
  };
  const [couponForm, setCouponForm] = useState(initialCouponState);

  // Add Bank Offer Form State
  const initialBankOfferState = {
    id: '',
    bank: '',
    desc: '',
    type: 'flat',
    value: '',
    maxDiscount: ''
  };
  const [bankOfferForm, setBankOfferForm] = useState(initialBankOfferState);
  const [editingBankOfferId, setEditingBankOfferId] = useState(null);

  // Flash Deal Form State
  const [flashProductId, setFlashProductId] = useState('');
  const [flashDiscount, setFlashDiscount] = useState('');
  const [flashDescription, setFlashDescription] = useState('');

  React.useEffect(() => {
    if (flashDeal) {
      setFlashProductId(flashDeal.product_id || '');
      setFlashDiscount(flashDeal.discount || '');
      setFlashDescription(flashDeal.description || '');
    }
  }, [flashDeal]);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (authCode.trim() === 'Hemant@2oo2') {
      setIsAuthenticated(true);
      sessionStorage.setItem('jss_admin_auth', 'true');
      setAuthError('');
    } else {
      setAuthError('Incorrect access key. Access denied.');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('jss_admin_auth');
  };

  // Add/Edit Product Submit
  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!form.id || !form.name || !form.brand || !form.price || !form.mrp) {
      alert('Please fill out all required fields.');
      return;
    }

    const cleanId = form.id.trim().toLowerCase().replace(/\s+/g, '-');
    
    const productData = {
      id: cleanId,
      name: form.name.trim(),
      brand: form.brand.trim(),
      category: form.category,
      price: Number(form.price),
      mrp: Number(form.mrp),
      rating: 4.5,
      reviewsCount: Math.floor(10 + Math.random() * 200),
      imageColor: form.imageColor,
      specs: {
        display: form.display || '6.7-inch OLED, 120Hz',
        processor: form.processor || 'Octa-core Processor',
        ram: form.ram || '8 GB',
        storage: form.storage || '128 GB',
        backCamera: form.backCamera || '50 MP Triple OIS',
        frontCamera: form.frontCamera || '16 MP',
        battery: form.battery || '5000 mAh',
        os: form.os || 'Android 14',
        network: '5G Supported',
        weight: '190g'
      },
      features: form.featuresInput
        ? form.featuresInput.split(',').map(f => f.trim()).filter(Boolean)
        : ['Premium build quality', '5G support', 'Day-long battery life'],
      inStock: form.inStock
    };

    if (editingProductId) {
      updateProduct(editingProductId, productData);
      setEditingProductId(null);
    } else {
      // Check for duplicate ID
      if (products.some(p => p.id === cleanId)) {
        alert('A mobile model with this ID already exists. Please choose a unique name.');
        return;
      }
      addProduct(productData);
    }

    setForm(initialFormState);
    setIsAddModalOpen(false);
  };

  // Add Coupon Submit
  const handleCouponSubmit = (e) => {
    e.preventDefault();
    if (!couponForm.code || !couponForm.value) {
      alert('Please enter coupon code and discount value.');
      return;
    }

    const uppercaseCode = couponForm.code.trim().toUpperCase();
    if (coupons.some(c => c.code === uppercaseCode)) {
      alert('A coupon code with this name already exists.');
      return;
    }

    const newCoupon = {
      code: uppercaseCode,
      type: couponForm.type,
      value: Number(couponForm.value),
      minSubtotal: Number(couponForm.minSubtotal || 0),
      description: couponForm.description.trim() || `${couponForm.type === 'flat' ? '₹' + couponForm.value : couponForm.value + '%'} Off`
    };

    addCoupon(newCoupon);
    setCouponForm(initialCouponState);
  };

  // Add/Edit Bank Offer Submit
  const handleBankOfferSubmit = (e) => {
    e.preventDefault();
    if (!bankOfferForm.id || !bankOfferForm.bank || !bankOfferForm.value) {
      alert('Please enter Bank ID, Bank/Card Name, and discount value.');
      return;
    }

    const uppercaseId = bankOfferForm.id.trim().toUpperCase();

    const offerData = {
      bank: bankOfferForm.bank.trim(),
      desc: bankOfferForm.desc.trim() || `${bankOfferForm.type === 'flat' ? 'Flat ₹' + bankOfferForm.value : bankOfferForm.value + '%'} Off`,
      type: bankOfferForm.type,
      value: Number(bankOfferForm.value),
      maxDiscount: bankOfferForm.maxDiscount ? Number(bankOfferForm.maxDiscount) : null
    };

    if (editingBankOfferId) {
      updateBankOffer(editingBankOfferId, offerData);
      setEditingBankOfferId(null);
    } else {
      if (bankOffers.some(b => b.id === uppercaseId)) {
        alert('A bank card offer with this Bank ID already exists.');
        return;
      }
      addBankOffer({ id: uppercaseId, ...offerData });
    }

    setBankOfferForm(initialBankOfferState);
  };

  const handleFlashDealSubmit = (e) => {
    e.preventDefault();
    if (!flashProductId || !flashDiscount || !flashDescription) {
      alert('Please fill in all flash deal fields.');
      return;
    }
    updateFlashDeal(flashProductId, Number(flashDiscount), flashDescription);
    alert('Weekly Flash Deal updated successfully!');
  };

  // Edit Trigger
  const handleEditClick = (p) => {
    setEditingProductId(p.id);
    setForm({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category || 'Flagship',
      price: p.price,
      mrp: p.mrp || p.price,
      display: p.specs?.display || '',
      processor: p.specs?.processor || '',
      ram: p.specs?.ram || '',
      storage: p.specs?.storage || '',
      backCamera: p.specs?.backCamera || '',
      frontCamera: p.specs?.frontCamera || '',
      battery: p.specs?.battery || '',
      os: p.specs?.os || '',
      featuresInput: p.features ? p.features.join(', ') : '',
      imageColor: p.imageColor || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
      inStock: p.inStock
    });
    setIsAddModalOpen(true);
  };

  const handleBankOfferEditClick = (offer) => {
    setEditingBankOfferId(offer.id);
    setBankOfferForm({
      id: offer.id,
      bank: offer.bank,
      desc: offer.desc || '',
      type: offer.type || 'flat',
      value: offer.value || '',
      maxDiscount: offer.maxDiscount || ''
    });
  };

  // Delete Action
  const handleDeleteClick = (id, name) => {
    if (window.confirm(`Are you sure you want to delete ${name} from stock catalog?`)) {
      deleteProduct(id);
    }
  };

  // Reset Action
  const handleResetCatalog = () => {
    if (window.confirm('This will wipe out all custom stock changes and reset the catalog back to default factory mobiles. Proceed?')) {
      resetProducts();
    }
  };

  // Unique Brands list
  const brandsList = ['All', ...new Set(products.map(p => p.brand))];

  // Filtered List
  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                          p.brand.toLowerCase().includes(search.toLowerCase()) ||
                          p.id.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === 'All' || p.brand === brandFilter;
    return matchesSearch && matchesBrand;
  });

  if (!isAuthenticated) {
    return (
      <div className="container" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 0' }}>
        <div className="glass-panel animate-fade-in" style={{ padding: '40px', maxWidth: '420px', width: '90%', textAlign: 'center', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(99,102,241,0.1)', color: 'var(--accent-primary)', marginBottom: '16px' }}>
            <Shield size={32} />
          </div>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '8px', fontWeight: 700 }}>Staff Stock Manager</h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Access restricted to authorized personnel of Jai Shree Shyam Traders.
          </p>

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', textAlign: 'left' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Staff Access Key</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authCode}
                onChange={(e) => setAuthCode(e.target.value)}
                style={{ textAlign: 'center', fontSize: '1.1rem', letterSpacing: '0.1em' }}
                required
              />
            </div>

            {authError && (
              <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', fontWeight: 550 }}>
                ⚠️ {authError}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
              Verify & Enter Portal
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '40px 24px', minHeight: '80vh' }}>
      {/* Dashboard Top Header */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '20px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield style={{ color: 'var(--accent-gold)' }} size={24} />
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Staff Administration Center</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '4px' }}>
            Control center to manage stock inventory, configure dynamic promo coupons, and review customer quotation/callback queries.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-primary" onClick={handleLogout} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
            Exit Admin Area
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', marginBottom: '32px', paddingBottom: '1px' }}>
        <button
          onClick={() => setActiveTab('stock')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'stock' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'stock' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📱 Stock Manager
        </button>
        <button
          onClick={() => setActiveTab('offers')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'offers' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'offers' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Tag size={16} /> Offers & Coupons
        </button>
        <button
          onClick={() => setActiveTab('queries')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'queries' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'queries' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MessageSquare size={16} /> Customer Inquiries
          {queries.length > 0 && (
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              {queries.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 24px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid var(--accent-primary)' : '3px solid transparent',
            color: activeTab === 'orders' ? 'var(--accent-primary)' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            transition: 'all 0.2s',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          📦 Customer Orders
          {orders.length > 0 && (
            <span style={{ fontSize: '0.75rem', background: 'var(--accent-primary)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
              {orders.length}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB CONTENT 1: STOCK MANAGER --- */}
      {activeTab === 'stock' && (
        <div className="animate-fade-in">
          {/* Action buttons bar */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                className="btn btn-secondary" 
                onClick={() => {
                  setEditingProductId(null);
                  setForm(initialFormState);
                  setIsAddModalOpen(true);
                }}
              >
                <Plus size={18} /> Add Mobile Phone
              </button>
              
              <button className="btn btn-secondary" onClick={handleResetCatalog} title="Restore standard stock catalog" style={{ color: 'var(--accent-danger)' }}>
                <RotateCcw size={16} /> Reset standard catalog
              </button>
            </div>
            
            {/* Quick stock badges */}
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
              <div className="glass-panel" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                Total: <strong style={{ color: 'white' }}>{products.length}</strong>
              </div>
              <div className="glass-panel" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                In Stock: <strong style={{ color: 'var(--accent-success)' }}>{products.filter(p => p.inStock).length}</strong>
              </div>
              <div className="glass-panel" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                Out: <strong style={{ color: 'var(--accent-danger)' }}>{products.filter(p => !p.inStock).length}</strong>
              </div>
            </div>
          </div>

          {/* Search & Filters Controls */}
          <div className="glass-panel" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexGrow: 1, position: 'relative' }}>
              <Search size={18} style={{ color: 'var(--text-muted)', position: 'absolute', left: '12px' }} />
              <input
                type="text"
                placeholder="Search catalog by phone name, brand, or model id..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ width: '100%', paddingLeft: '40px', background: 'var(--bg-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Brand:</span>
              <select 
                value={brandFilter} 
                onChange={(e) => setBrandFilter(e.target.value)}
                style={{ padding: '8px 12px', minWidth: '120px', background: 'var(--bg-primary)' }}
              >
                {brandsList.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Live Table Stock List */}
          <div className="glass-panel" style={{ overflowX: 'auto', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '16px 24px' }}>Phone Details</th>
                  <th style={{ padding: '16px 24px' }}>Category</th>
                  <th style={{ padding: '16px 24px' }}>Wholesale Price (₹)</th>
                  <th style={{ padding: '16px 24px' }}>MRP List Price (₹)</th>
                  <th style={{ padding: '16px 24px', textAlign: 'center' }}>Stock Status</th>
                  <th style={{ padding: '16px 24px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No mobile models match your filters. Try search filters or add a new mobile model.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      {/* Phone Image preview and ID */}
                      <td style={{ padding: '16px 24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div 
                          style={{ 
                            width: '44px', 
                            height: '56px', 
                            background: p.imageColor || 'linear-gradient(135deg, #ccc 0%, #999 100%)', 
                            borderRadius: '6px', 
                            display: 'flex', 
                            alignItems: 'center', 
                            justifyContent: 'center', 
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          📱
                        </div>
                        <div>
                          <div style={{ fontWeight: 650, color: 'var(--text-primary)' }}>{p.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'monospace', marginTop: '2px' }}>
                            ID: {p.id} ({p.brand})
                          </div>
                        </div>
                      </td>

                      <td style={{ padding: '16px 24px', color: 'var(--text-secondary)' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '4px 8px', borderRadius: '4px', background: 'var(--bg-tertiary)' }}>
                          {p.category}
                        </span>
                      </td>

                      {/* Pricing Inputs */}
                      <td style={{ padding: '16px 24px' }}>
                        <input
                          type="number"
                          value={p.price}
                          onChange={(e) => updateProductPrice(p.id, Number(e.target.value))}
                          style={{ width: '110px', padding: '6px 10px', fontSize: '0.9rem', fontWeight: 'bold', background: 'var(--bg-primary)' }}
                        />
                      </td>

                      <td style={{ padding: '16px 24px' }}>
                        <input
                          type="number"
                          value={p.mrp || p.price}
                          onChange={(e) => updateProduct(p.id, { mrp: Number(e.target.value) })}
                          style={{ width: '110px', padding: '6px 10px', fontSize: '0.9rem', color: 'var(--text-secondary)', background: 'var(--bg-primary)' }}
                        />
                      </td>

                      {/* Stock Toggle Switch */}
                      <td style={{ padding: '16px 24px', textAlign: 'center' }}>
                        <button
                          onClick={() => updateProductStock(p.id, !p.inStock)}
                          style={{
                            padding: '6px 14px',
                            borderRadius: '20px',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            background: p.inStock ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)',
                            border: p.inStock ? '1px solid var(--accent-success)' : '1px solid var(--accent-danger)',
                            color: p.inStock ? 'var(--accent-success)' : 'var(--accent-danger)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: p.inStock ? 'var(--accent-success)' : 'var(--accent-danger)' }}></span>
                          {p.inStock ? 'In Stock' : 'Out of Stock'}
                        </button>
                      </td>

                      {/* Table Actions */}
                      <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleEditClick(p)} 
                            title="Edit specifications"
                            style={{ padding: '6px', background: 'var(--bg-tertiary)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'var(--text-secondary)' }}
                          >
                            <Edit2 size={14} />
                          </button>
                          <button 
                            className="btn-icon" 
                            onClick={() => handleDeleteClick(p.id, p.name)} 
                            title="Delete phone model"
                            style={{ padding: '6px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '6px', color: 'var(--accent-danger)' }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT 2: OFFERS & COUPONS --- */}
      {activeTab === 'offers' && (
        <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '48px' }}>
          
          {/* SECTION 1: PROMO COUPONS */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left panel: Active coupon list */}
              <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Active Promo Coupons</h2>
                  <button className="btn btn-secondary" onClick={() => { if (window.confirm('Reset all coupons to default?')) resetCoupons(); }} style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>
                    <RotateCcw size={14} /> Revert Defaults
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        <th style={{ padding: '12px 16px' }}>Code</th>
                        <th style={{ padding: '12px 16px' }}>Offer Type</th>
                        <th style={{ padding: '12px 16px' }}>Value</th>
                        <th style={{ padding: '12px 16px' }}>Min Order</th>
                        <th style={{ padding: '12px 16px' }}>Description</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No active coupon offers configured. Customers cannot apply discounts at checkout.
                          </td>
                        </tr>
                      ) : (
                        coupons.map(coupon => (
                          <tr key={coupon.code} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{coupon.code}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              <span className={`badge ${coupon.type === 'percent' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                                {coupon.type === 'percent' ? 'Percentage' : 'Flat Discount'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                              {coupon.type === 'percent' ? `${coupon.value}%` : `₹${coupon.value.toLocaleString('en-IN')}`}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              ₹{coupon.minSubtotal.toLocaleString('en-IN')}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{coupon.description}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <button
                                onClick={() => { if (window.confirm(`Delete coupon ${coupon.code}?`)) deleteCoupon(coupon.code); }}
                                style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                                title="Delete Offer"
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right panel: Add Coupon Form */}
              <form onSubmit={handleCouponSubmit} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '4px' }}>
                  Create New Promo Offer
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER25"
                    value={couponForm.code}
                    onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.replace(/\s+/g, '') })}
                    style={{ textTransform: 'uppercase' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Discount Type *</label>
                    <select
                      value={couponForm.type}
                      onChange={(e) => setCouponForm({ ...couponForm, type: e.target.value })}
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      <option value="flat">Flat Discount (₹)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Discount Value *</label>
                    <input
                      type="number"
                      required
                      placeholder={couponForm.type === 'flat' ? 'e.g. 1500' : 'e.g. 12'}
                      value={couponForm.value}
                      onChange={(e) => setCouponForm({ ...couponForm, value: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Minimum Subtotal required (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 15000 (0 for none)"
                    value={couponForm.minSubtotal}
                    onChange={(e) => setCouponForm({ ...couponForm, minSubtotal: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marketing Description</label>
                  <input
                    type="text"
                    placeholder="e.g. Flat ₹1,500 Off on orders above ₹15,000"
                    value={couponForm.description}
                    onChange={(e) => setCouponForm({ ...couponForm, description: e.target.value })}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Add Active Coupon
                </button>
              </form>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', height: '1px' }}></div>

          {/* SECTION 2: BANK CARD OFFERS */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left panel: Active bank offers list */}
              <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '20px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Partner Bank Card Offers</h2>
                  <button className="btn btn-secondary" onClick={() => { if (window.confirm('Reset all bank offers to default?')) resetBankOffers(); }} style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>
                    <RotateCcw size={14} /> Revert Defaults
                  </button>
                </div>

                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-color)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.7rem' }}>
                        <th style={{ padding: '12px 16px' }}>Bank ID</th>
                        <th style={{ padding: '12px 16px' }}>Card Name</th>
                        <th style={{ padding: '12px 16px' }}>Offer Type</th>
                        <th style={{ padding: '12px 16px' }}>Value</th>
                        <th style={{ padding: '12px 16px' }}>Max Discount</th>
                        <th style={{ padding: '12px 16px' }}>Description</th>
                        <th style={{ padding: '12px 16px', textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bankOffers.length === 0 ? (
                        <tr>
                          <td colSpan={7} style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)' }}>
                            No bank card offers configured. Customers cannot apply bank discount rates at checkout.
                          </td>
                        </tr>
                      ) : (
                        bankOffers.map(offer => (
                          <tr key={offer.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            <td style={{ padding: '12px 16px', fontWeight: 'bold', color: 'var(--accent-gold)' }}>{offer.id}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)', fontWeight: 600 }}>{offer.bank}</td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              <span className={`badge ${offer.type === 'percent' ? 'badge-blue' : 'badge-green'}`} style={{ fontSize: '0.7rem' }}>
                                {offer.type === 'percent' ? 'Percentage' : 'Flat Discount'}
                              </span>
                            </td>
                            <td style={{ padding: '12px 16px', fontWeight: 600 }}>
                              {offer.type === 'percent' ? `${offer.value}%` : `₹${offer.value.toLocaleString('en-IN')}`}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                              {offer.maxDiscount ? `₹${offer.maxDiscount.toLocaleString('en-IN')}` : 'No Limit'}
                            </td>
                            <td style={{ padding: '12px 16px', color: 'var(--text-muted)' }}>{offer.desc}</td>
                            <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                              <div style={{ display: 'inline-flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleBankOfferEditClick(offer)}
                                  style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
                                  title="Edit Offer"
                                >
                                  <Edit2 size={16} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => { if (window.confirm(`Delete bank offer ${offer.id}?`)) deleteBankOffer(offer.id); }}
                                  style={{ background: 'none', border: 'none', color: 'var(--accent-danger)', cursor: 'pointer' }}
                                  title="Delete Offer"
                                >
                                  <Trash2 size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Right panel: Add Bank Offer Form */}
              <form onSubmit={handleBankOfferSubmit} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '4px' }}>
                  {editingBankOfferId ? 'Edit Partner Bank Card Offer' : 'Create New Bank Card Offer'}
                </h2>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank ID (UPPERCASE) *</label>
                    <input
                      type="text"
                      required
                      readOnly={!!editingBankOfferId}
                      placeholder="e.g. AXIS"
                      value={bankOfferForm.id}
                      onChange={(e) => setBankOfferForm({ ...bankOfferForm, id: e.target.value.toUpperCase().replace(/\s+/g, '') })}
                      style={{ textTransform: 'uppercase', opacity: editingBankOfferId ? 0.6 : 1, cursor: editingBankOfferId ? 'not-allowed' : 'text' }}
                    />
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Bank/Card Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Axis Bank Credit Card"
                      value={bankOfferForm.bank}
                      onChange={(e) => setBankOfferForm({ ...bankOfferForm, bank: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Discount Type *</label>
                    <select
                      value={bankOfferForm.type}
                      onChange={(e) => setBankOfferForm({ ...bankOfferForm, type: e.target.value })}
                      style={{ background: 'var(--bg-primary)' }}
                    >
                      <option value="flat">Flat Discount (₹)</option>
                      <option value="percent">Percentage (%)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Discount Value *</label>
                    <input
                      type="number"
                      required
                      placeholder={bankOfferForm.type === 'flat' ? 'e.g. 2000' : 'e.g. 10'}
                      value={bankOfferForm.value}
                      onChange={(e) => setBankOfferForm({ ...bankOfferForm, value: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Maximum Discount Cap (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 2500 (blank/0 for flat limit)"
                    value={bankOfferForm.maxDiscount}
                    onChange={(e) => setBankOfferForm({ ...bankOfferForm, maxDiscount: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marketing Description</label>
                  <input
                    type="text"
                    placeholder="e.g. 10% Cashback up to ₹2,500"
                    value={bankOfferForm.desc}
                    onChange={(e) => setBankOfferForm({ ...bankOfferForm, desc: e.target.value })}
                  />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                  <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                    {editingBankOfferId ? 'Update Card Offer' : 'Add Active Card Offer'}
                  </button>
                  {editingBankOfferId && (
                    <button 
                      type="button" 
                      className="btn btn-secondary" 
                      onClick={() => {
                        setEditingBankOfferId(null);
                        setBankOfferForm(initialBankOfferState);
                      }}
                      style={{ flex: 1 }}
                    >
                      Cancel Edit
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border-color)', width: '100%', height: '1px' }}></div>

          {/* SECTION 3: WEEKLY FLASH DEAL */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '32px', alignItems: 'start' }}>
              {/* Left panel: Active weekly deal status info */}
              <div className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '4px' }}>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Weekly Flash Deal Info</h2>
                  <button type="button" className="btn btn-secondary" onClick={() => { if (window.confirm('Reset flash deal to default?')) resetFlashDeal(); }} style={{ fontSize: '0.8rem', color: 'var(--accent-danger)' }}>
                    <RotateCcw size={14} /> Revert Default
                  </button>
                </div>

                {flashDeal && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Active Product:</span>
                      <span style={{ fontWeight: 600 }}>
                        {products.find(p => p.id === flashDeal.product_id)?.name || flashDeal.product_id}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Flat Discount:</span>
                      <span style={{ fontWeight: 600, color: 'var(--accent-gold)' }}>
                        ₹{Number(flashDeal.discount).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.9rem' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>Promo Copy:</span>
                      <span style={{ color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.4 }}>
                        "{flashDeal.description}"
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Right panel: Update Weekly Flash Deal Form */}
              <form onSubmit={handleFlashDealSubmit} className="glass-panel" style={{ padding: '24px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '4px' }}>
                  Update Deal of the Week
                </h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Select Product *</label>
                  <select
                    value={flashProductId}
                    onChange={(e) => setFlashProductId(e.target.value)}
                    style={{ background: 'var(--bg-primary)' }}
                    required
                  >
                    <option value="" disabled>-- Select a smartphone --</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.brand}) - ₹{p.price.toLocaleString('en-IN')}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Flat Discount (₹) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 3500"
                    value={flashDiscount}
                    onChange={(e) => setFlashDiscount(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Custom Promotional Copy *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="e.g. Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging."
                    value={flashDescription}
                    onChange={(e) => setFlashDescription(e.target.value)}
                    style={{ resize: 'none' }}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                  Save Flash Deal
                </button>
              </form>
            </div>
          </div>

        </div>
      )}

      {/* --- TAB CONTENT 3: CUSTOMER INQUIRIES & QUOTES --- */}
      {activeTab === 'queries' && (
        <div className="animate-fade-in">
          {/* Header controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Incoming Customer Communications</h2>
            {queries.length > 0 && (
              <button 
                className="btn btn-secondary" 
                onClick={() => { if (window.confirm('Clear all logged inquiries?')) resetQueries(); }}
                style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', border: '1px solid rgba(239, 68, 68, 0.2)' }}
              >
                <Trash size={14} /> Clear Query Logs
              </button>
            )}
          </div>

          {queries.length === 0 ? (
            <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>Inbox is clean</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                No callback requests or B2B wholesale proforma quotes have been submitted by customers yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {queries.map(q => (
                <div 
                  key={q.id}
                  className="glass-panel"
                  style={{
                    padding: '24px',
                    background: 'var(--bg-secondary)',
                    border: q.type === 'wholesale' ? '1px solid var(--accent-gold)' : '1px solid var(--accent-primary)',
                    position: 'relative'
                  }}
                >
                  {/* Badge Row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className={`badge ${q.type === 'wholesale' ? 'badge-gold' : 'badge-blue'}`} style={{ fontSize: '0.75rem' }}>
                        {q.type === 'wholesale' ? '💼 Wholesale Proforma Quote' : '📞 Showroom Callback'}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar size={12} /> {new Date(q.date).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteQuery(q.id)}
                      className="btn btn-secondary"
                      style={{ 
                        padding: '6px 12px', 
                        fontSize: '0.75rem', 
                        color: 'var(--accent-success)', 
                        borderColor: 'rgba(16, 185, 129, 0.2)',
                        background: 'rgba(16, 185, 129, 0.05)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Check size={12} /> Mark Resolved / Delete
                    </button>
                  </div>

                  {/* Customer details info */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Contact</div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '2px' }}>{q.contactName}</div>
                      {q.companyName && <div style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>Company: {q.companyName}</div>}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Target</div>
                      <a href={`tel:${q.phone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.95rem', marginTop: '2px', textDecoration: 'underline' }}>
                        <Phone size={12} /> {q.phone}
                      </a>
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Target</div>
                      <a href={`mailto:${q.email}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px', textDecoration: 'underline' }}>
                        <Mail size={12} /> {q.email}
                      </a>
                    </div>

                    {q.gstNumber && (
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GSTIN Identifier</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 650, marginTop: '2px' }}>{q.gstNumber}</div>
                      </div>
                    )}
                  </div>

                  {/* Content details based on query type */}
                  {q.type === 'callback' ? (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '6px', color: 'white' }}>
                        Subject: {q.subject}
                      </div>
                      <div style={{ background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                        {q.message}
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', color: 'white' }}>
                        Requested Wholesale Invoice Items ({q.totalVolume} total devices):
                      </div>
                      
                      {/* Compact items list */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '6px', marginBottom: '12px' }}>
                        {q.items.map((item, idx) => (
                          <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', borderBottom: idx < q.items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', paddingBottom: idx < q.items.length - 1 ? '6px' : '0', paddingTop: idx > 0 ? '6px' : '0' }}>
                            <span>
                              📱 <strong style={{ color: 'white' }}>{item.name}</strong> x {item.quantity} units
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Unit: ₹{item.price.toLocaleString('en-IN')} ({item.discount}% tier discount)
                            </span>
                          </div>
                        ))}
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          Target Delivery: <strong style={{ color: 'white' }}>{q.deliveryDate}</strong>
                          {q.comments && <span style={{ marginLeft: '12px', fontStyle: 'italic', color: 'var(--text-muted)' }}>- "{q.comments}"</span>}
                        </div>
                        <div style={{ fontSize: '1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                          Net Wholesale Payable: ₹{q.netTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT 4: CUSTOMER ORDERS --- */}
      {activeTab === 'orders' && (
        <div className="animate-fade-in">
          {/* Header controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>Registered Shop Purchases</h2>
            <div style={{ display: 'flex', gap: '12px', fontSize: '0.8rem' }}>
              <div className="glass-panel" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                Total Orders: <strong style={{ color: 'white' }}>{orders.length}</strong>
              </div>
              <div className="glass-panel" style={{ padding: '8px 16px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '6px' }}>
                Net Sales: <strong style={{ color: 'var(--accent-gold)' }}>₹{orders.reduce((acc, curr) => acc + Number(curr.total || 0), 0).toLocaleString('en-IN')}</strong>
              </div>
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
              <Inbox size={48} style={{ color: 'var(--text-muted)', marginBottom: '16px' }} />
              <h3 style={{ fontSize: '1.1rem', marginBottom: '6px' }}>No orders placed</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '400px', margin: '0 auto' }}>
                No customer orders have been received by the storefront database yet.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {orders.map(order => {
                const status = order.status || 'Placed';
                const isDelivered = status.toLowerCase() === 'delivered';
                const statusColor = isDelivered 
                  ? 'var(--accent-success)' 
                  : (status.toLowerCase() === 'dispatched' ? '#6366f1' : (status.toLowerCase() === 'processing' ? '#3b82f6' : 'var(--accent-gold)'));

                return (
                  <div 
                    key={order.id}
                    className="glass-panel"
                    style={{
                      padding: '24px',
                      background: 'var(--bg-secondary)',
                      border: '1px solid var(--border-color)',
                      position: 'relative'
                    }}
                  >
                    {/* Header Row */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Order Reference</div>
                        <div style={{ fontWeight: 'bold', fontSize: '1.1rem', color: 'white', marginTop: '2px' }}>{order.id}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Calendar size={12} /> {order.date}
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        {/* Status Change Dropdown Selector */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left' }}>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Order Status Control</span>
                          <select
                            value={status}
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            style={{ 
                              padding: '6px 12px', 
                              fontSize: '0.85rem', 
                              fontWeight: 'bold',
                              borderRadius: '6px',
                              background: 'var(--bg-primary)',
                              color: statusColor,
                              border: `1px solid ${statusColor}`,
                              cursor: 'pointer'
                            }}
                          >
                            <option value="Placed" style={{ color: 'var(--accent-gold)' }}>Placed</option>
                            <option value="Processing" style={{ color: '#3b82f6' }}>Processing</option>
                            <option value="Dispatched" style={{ color: '#6366f1' }}>Dispatched</option>
                            <option value="Delivered" style={{ color: 'var(--accent-success)' }}>Delivered</option>
                          </select>
                        </div>

                        {/* Delete/Cancel Button */}
                        <button
                          onClick={async () => {
                            if (window.confirm(`Are you sure you want to delete order ${order.id} from the database?`)) {
                              const res = await deleteOrder(order.id);
                              if (res.success) {
                                alert('Order deleted successfully.');
                              } else {
                                alert(res.msg || 'Failed to delete order.');
                              }
                            }
                          }}
                          className="btn btn-secondary"
                          style={{ 
                            padding: '10px 14px', 
                            fontSize: '0.8rem', 
                            color: 'var(--accent-danger)', 
                            borderColor: 'rgba(239, 68, 68, 0.2)',
                            background: 'rgba(239, 68, 68, 0.05)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            alignSelf: 'flex-end',
                            height: '38px',
                            marginTop: '16px'
                          }}
                        >
                          <Trash2 size={14} /> Remove Order
                        </button>
                      </div>
                    </div>

                    {/* Customer Info Card Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '16px' }}>
                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Customer Billing Name</div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginTop: '2px', color: 'var(--text-primary)' }}>{order.customerName}</div>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Phone Number</div>
                        <a href={`tel:${order.customerPhone}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: 'var(--accent-primary)', fontSize: '0.95rem', marginTop: '2px', textDecoration: 'underline' }}>
                          <Phone size={12} /> {order.customerPhone || 'N/A'}
                        </a>
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Email Address</div>
                        {order.customerEmail ? (
                          <a href={`mailto:${order.customerEmail}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: '2px', textDecoration: 'underline' }}>
                            <Mail size={12} /> {order.customerEmail}
                          </a>
                        ) : (
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>Guest Check-out</div>
                        )}
                      </div>

                      <div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Shipping Destination</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px', lineHeight: 1.4 }}>
                          {order.customerAddress || 'N/A'} {order.customerPincode ? `- ${order.customerPincode}` : ''}
                        </div>
                      </div>
                    </div>

                    {/* Order Purchased Items Table */}
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '0.9rem', marginBottom: '8px', color: 'white' }}>
                        Purchased Items:
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', background: 'var(--bg-primary)', padding: '12px 16px', borderRadius: '6px' }}>
                        {order.items && order.items.map((item, idx) => (
                          <div 
                            key={idx} 
                            style={{ 
                              display: 'flex', 
                              justifyContent: 'space-between', 
                              alignItems: 'center', 
                              fontSize: '0.85rem', 
                              borderBottom: idx < order.items.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none', 
                              paddingBottom: idx < order.items.length - 1 ? '6px' : '0', 
                              paddingTop: idx > 0 ? '6px' : '0' 
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '4px',
                                background: item.product?.imageColor || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                display: 'inline-block'
                              }} />
                              <strong style={{ color: 'white' }}>{item.product?.name || 'Smart Phone'}</strong>
                              <span style={{ color: 'var(--text-muted)' }}>x {item.quantity}</span>
                            </span>
                            <span style={{ color: 'var(--text-secondary)' }}>
                              Unit: ₹{Number(item.product?.price || 0).toLocaleString('en-IN')} | Subtotal: ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Financial Summary */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px', background: 'rgba(255,255,255,0.01)', padding: '12px 16px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                      <div style={{ display: 'flex', gap: '20px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        <div>
                          Subtotal: <strong style={{ color: 'var(--text-primary)' }}>₹{Number(order.subtotal || 0).toLocaleString('en-IN')}</strong>
                        </div>
                        {Number(order.couponDiscount || 0) > 0 && (
                          <div style={{ color: 'var(--accent-success)' }}>
                            Coupon discount: <strong>-₹{Number(order.couponDiscount).toLocaleString('en-IN')}</strong>
                          </div>
                        )}
                        {Number(order.bankDiscount || 0) > 0 && (
                          <div style={{ color: 'var(--accent-success)' }}>
                            Bank discount: <strong>-₹{Number(order.bankDiscount).toLocaleString('en-IN')}</strong>
                          </div>
                        )}
                        <div>
                          Payment: <strong style={{ color: 'var(--text-primary)', textTransform: 'capitalize' }}>{order.paymentMethod || 'Online'}</strong>
                        </div>
                      </div>
                      <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: 'var(--accent-gold)' }}>
                        Net Paid Total: ₹{Number(order.total || 0).toLocaleString('en-IN')}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* --- ADD / EDIT STOCK MODAL --- */}
      {isAddModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content glass-panel animate-fade-in" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', color: 'var(--text-primary)', maxWidth: '640px', width: '95%', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                📱 {editingProductId ? 'Edit Mobile Specifications' : 'Add New Mobile Model'}
              </h2>
              <button className="btn-icon" onClick={() => setIsAddModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '70vh', overflowY: 'auto', paddingRight: '6px' }}>
              {/* Product ID and Name */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Unique ID * (Slug)</label>
                  <input
                    type="text"
                    name="id"
                    placeholder="e.g. google-pixel-9"
                    value={form.id}
                    onChange={(e) => setForm({ ...form, id: e.target.value })}
                    disabled={!!editingProductId}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Phone Model Name *</label>
                  <input
                    type="text"
                    name="name"
                    placeholder="e.g. Google Pixel 9 Pro 5G"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Brand and Category */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    placeholder="e.g. Google"
                    value={form.brand}
                    onChange={(e) => setForm({ ...form, brand: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Category *</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    style={{ background: 'var(--bg-primary)' }}
                  >
                    <option value="Premium Flagship">Premium Flagship</option>
                    <option value="Flagship">Flagship</option>
                    <option value="Mid-Range Premium">Mid-Range Premium</option>
                    <option value="Mid-Range">Mid-Range</option>
                    <option value="Budget Flagship">Budget Flagship</option>
                    <option value="Budget Friendly">Budget Friendly</option>
                  </select>
                </div>
              </div>

              {/* Price and MRP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Wholesale Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="e.g. 79999"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    required
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>List Price / MRP (₹) *</label>
                  <input
                    type="number"
                    name="mrp"
                    placeholder="e.g. 84999"
                    value={form.mrp}
                    onChange={(e) => setForm({ ...form, mrp: e.target.value })}
                    required
                  />
                </div>
              </div>

              {/* Color Gradient representation */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>CSS Image Gradient Representation</label>
                <input
                  type="text"
                  name="imageColor"
                  placeholder="linear-gradient(135deg, #color1 0%, #color2 100%)"
                  value={form.imageColor}
                  onChange={(e) => setForm({ ...form, imageColor: e.target.value })}
                />
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ width: '40px', height: '24px', borderRadius: '4px', background: form.imageColor }}></div>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Live color preview banner</span>
                </div>
              </div>

              {/* Stock Status toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>Set available In Stock immediately:</label>
                <input
                  type="checkbox"
                  checked={form.inStock}
                  onChange={(e) => setForm({ ...form, inStock: e.target.checked })}
                  style={{ width: '20px', height: '20px', cursor: 'pointer' }}
                />
              </div>

              {/* Technical Specifications */}
              <h3 style={{ fontSize: '0.95rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '6px', color: 'var(--accent-gold)', marginTop: '8px' }}>
                Mobile Specifications
              </h3>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Display Specs</label>
                  <input
                    type="text"
                    placeholder="e.g. 6.7-inch LTPO OLED, 120Hz"
                    value={form.display}
                    onChange={(e) => setForm({ ...form, display: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processor Chipset</label>
                  <input
                    type="text"
                    placeholder="e.g. Snapdragon 8 Gen 4"
                    value={form.processor}
                    onChange={(e) => setForm({ ...form, processor: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>RAM Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 12 GB"
                    value={form.ram}
                    onChange={(e) => setForm({ ...form, ram: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Storage Capacity</label>
                  <input
                    type="text"
                    placeholder="e.g. 256 GB"
                    value={form.storage}
                    onChange={(e) => setForm({ ...form, storage: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rear Camera details</label>
                  <input
                    type="text"
                    placeholder="e.g. 50 MP + 48 MP + 12 MP OIS"
                    value={form.backCamera}
                    onChange={(e) => setForm({ ...form, backCamera: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Front Camera details</label>
                  <input
                    type="text"
                    placeholder="e.g. 32 MP Selfie"
                    value={form.frontCamera}
                    onChange={(e) => setForm({ ...form, frontCamera: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Battery Size & Charging</label>
                  <input
                    type="text"
                    placeholder="e.g. 5000 mAh (45W fast charging)"
                    value={form.battery}
                    onChange={(e) => setForm({ ...form, battery: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Operating System (OS)</label>
                  <input
                    type="text"
                    placeholder="e.g. Android 15"
                    value={form.os}
                    onChange={(e) => setForm({ ...form, os: e.target.value })}
                  />
                </div>
              </div>

              {/* Bullet Features list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Marketing Highlight Features (comma separated)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. AI-powered editing, IP68 water resistance, Corning Gorilla Armor"
                  value={form.featuresInput}
                  onChange={(e) => setForm({ ...form, featuresInput: e.target.value })}
                  style={{ resize: 'none' }}
                />
              </div>

              {/* Submit panel */}
              <div style={{ display: 'flex', gap: '16px', marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '20px' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsAddModalOpen(false)} style={{ flex: 1 }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>
                  {editingProductId ? 'Apply Changes' : 'Add Mobile Model'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
