import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import ProductCard from '../components/ProductCard';
import { SlidersHorizontal, RotateCcw, X, Search } from 'lucide-react';

export default function Catalog() {
  const { products, searchQuery, setSearchQuery } = useShop();

  // Filter States
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState([]);
  const [selectedRams, setSelectedRams] = useState([]);
  const [selectedStorages, setSelectedStorages] = useState([]);
  const [filter5G, setFilter5G] = useState(false);
  
  // Sorting State
  const [sortBy, setSortBy] = useState('relevance');

  // Available Filter Options
  const brandsList = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Motorola', 'POCO'];
  const ramList = ['6 GB', '8 GB', '12 GB', '16 GB'];
  const storageList = ['128 GB', '256 GB', '512 GB'];
  const priceRanges = [
    { label: 'Under ₹25,000', id: 'under-25', min: 0, max: 25000 },
    { label: '₹25,000 - ₹50,000', id: '25-50', min: 25000, max: 50000 },
    { label: '₹50,000 - ₹1,00,000', id: '50-100', min: 50000, max: 100000 },
    { label: 'Above ₹1,00,000', id: 'above-100', min: 100000, max: 999999 }
  ];

  // Toggle helpers
  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand) ? prev.filter(b => b !== brand) : [...prev, brand]
    );
  };

  const handlePriceRangeToggle = (rangeId) => {
    setSelectedPriceRanges(prev => 
      prev.includes(rangeId) ? prev.filter(r => r !== rangeId) : [...prev, rangeId]
    );
  };

  const handleRamToggle = (ram) => {
    setSelectedRams(prev => 
      prev.includes(ram) ? prev.filter(r => r !== ram) : [...prev, ram]
    );
  };

  const handleStorageToggle = (storage) => {
    setSelectedStorages(prev => 
      prev.includes(storage) ? prev.filter(s => s !== storage) : [...prev, storage]
    );
  };

  const clearAllFilters = () => {
    setSelectedBrands([]);
    setSelectedPriceRanges([]);
    setSelectedRams([]);
    setSelectedStorages([]);
    setFilter5G(false);
    setSearchQuery('');
  };

  // --- FILTER & SORT LOGIC ---
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search query match (search name, brand, processor, os)
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.specs.processor.toLowerCase().includes(query) ||
        p.specs.os.toLowerCase().includes(query)
      );
    }

    // Brand Filter
    if (selectedBrands.length > 0) {
      result = result.filter(p => selectedBrands.includes(p.brand));
    }

    // Price Range Filter
    if (selectedPriceRanges.length > 0) {
      result = result.filter(p => {
        return selectedPriceRanges.some(rangeId => {
          const range = priceRanges.find(r => r.id === rangeId);
          if (!range) return false;
          return p.price >= range.min && p.price <= range.max;
        });
      });
    }

    // RAM Filter
    if (selectedRams.length > 0) {
      result = result.filter(p => selectedRams.includes(p.specs.ram));
    }

    // Storage Filter
    if (selectedStorages.length > 0) {
      result = result.filter(p => selectedStorages.includes(p.specs.storage));
    }

    // 5G Network Filter
    if (filter5G) {
      result = result.filter(p => p.specs.network.includes('5G'));
    }

    // Sorting
    if (sortBy === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    } else if (sortBy === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, searchQuery, selectedBrands, selectedPriceRanges, selectedRams, selectedStorages, filter5G, sortBy]);

  // Check if any filters are active
  const hasActiveFilters = 
    selectedBrands.length > 0 ||
    selectedPriceRanges.length > 0 ||
    selectedRams.length > 0 ||
    selectedStorages.length > 0 ||
    filter5G ||
    searchQuery !== '';

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '64px', paddingTop: '24px' }}>
      
      {/* Search Bar for Mobile viewports */}
      <div className="glass-panel" style={{ display: 'none', padding: '12px', marginBottom: '24px' }}>
        <div style={{ position: 'relative', width: '100%' }}>
          <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={16} />
          <input
            type="text"
            placeholder="Search mobile phones..."
            style={{ width: '100%', paddingLeft: '36px', height: '40px' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="catalog-layout">
        
        {/* FILTERS SIDEBAR */}
        <aside className="glass-panel filter-sidebar" style={{ padding: '24px', backgroundColor: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-md)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <SlidersHorizontal size={18} /> Filters
            </h2>
            {hasActiveFilters && (
              <button 
                onClick={clearAllFilters}
                style={{ fontSize: '0.75rem', color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}
              >
                <RotateCcw size={12} /> Clear
              </button>
            )}
          </div>

          {/* Brand Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Brands</h3>
            <div className="filter-options">
              {brandsList.map(brand => (
                <label key={brand} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(brand)}
                    onChange={() => handleBrandToggle(brand)}
                  />
                  <span>{brand}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Price Range</h3>
            <div className="filter-options">
              {priceRanges.map(range => (
                <label key={range.id} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedPriceRanges.includes(range.id)}
                    onChange={() => handlePriceRangeToggle(range.id)}
                  />
                  <span>{range.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* RAM Filter */}
          <div className="filter-section">
            <h3 className="filter-title">RAM Memory</h3>
            <div className="filter-options">
              {ramList.map(ram => (
                <label key={ram} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedRams.includes(ram)}
                    onChange={() => handleRamToggle(ram)}
                  />
                  <span>{ram}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Storage Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Internal Storage</h3>
            <div className="filter-options">
              {storageList.map(storage => (
                <label key={storage} className="filter-option">
                  <input
                    type="checkbox"
                    checked={selectedStorages.includes(storage)}
                    onChange={() => handleStorageToggle(storage)}
                  />
                  <span>{storage}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Connectivity Filter */}
          <div className="filter-section">
            <h3 className="filter-title">Network</h3>
            <div className="filter-options">
              <label className="filter-option">
                <input
                  type="checkbox"
                  checked={filter5G}
                  onChange={() => setFilter5G(!filter5G)}
                />
                <span>5G Supported</span>
              </label>
            </div>
          </div>
        </aside>

        {/* PRODUCTS AREA */}
        <main>
          {/* Top Bar (Sorting & Counts) */}
          <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Showing <strong style={{ color: 'var(--text-primary)' }}>{filteredProducts.length}</strong> mobiles matching
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Sort By:</label>
              <select 
                value={sortBy} 
                onChange={(e) => setSortBy(e.target.value)}
                style={{ height: '36px', padding: '0 10px', fontSize: '0.85rem' }}
              >
                <option value="relevance">Popularity</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="name">Model Name</option>
              </select>
            </div>
          </div>

          {/* Active Filter Chips Row */}
          {hasActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '24px' }}>
              {searchQuery && (
                <span className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  Search: "{searchQuery}" <X size={12} style={{ cursor: 'pointer' }} onClick={() => setSearchQuery('')} />
                </span>
              )}
              {selectedBrands.map(brand => (
                <span key={brand} className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  Brand: {brand} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleBrandToggle(brand)} />
                </span>
              ))}
              {selectedPriceRanges.map(rangeId => (
                <span key={rangeId} className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  Price: {priceRanges.find(r => r.id === rangeId)?.label} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handlePriceRangeToggle(rangeId)} />
                </span>
              ))}
              {selectedRams.map(ram => (
                <span key={ram} className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  RAM: {ram} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleRamToggle(ram)} />
                </span>
              ))}
              {selectedStorages.map(storage => (
                <span key={storage} className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  Storage: {storage} <X size={12} style={{ cursor: 'pointer' }} onClick={() => handleStorageToggle(storage)} />
                </span>
              ))}
              {filter5G && (
                <span className="badge badge-blue" style={{ gap: '4px', padding: '6px 12px' }}>
                  Network: 5G <X size={12} style={{ cursor: 'pointer' }} onClick={() => setFilter5G(false)} />
                </span>
              )}
            </div>
          )}

          {/* Catalog Grid */}
          {filteredProducts.length > 0 ? (
            <div className="product-grid">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="glass-panel" style={{ padding: '64px 24px', textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>No Mobiles Match Your Filters</h3>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px auto' }}>
                We couldn't find any mobile models that match the active specifications. Try resetting your search or checks.
              </p>
              <button className="btn btn-primary" onClick={clearAllFilters}>
                Reset All Filters
              </button>
            </div>
          )}
        </main>

      </div>
    </div>
  );
}
