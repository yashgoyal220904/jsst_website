import React from 'react';
import { useShop } from '../context/ShopContext';
import { X, ShoppingCart, FileText, Scale } from 'lucide-react';

export default function ProductCompare() {
  const {
    compareItems,
    removeCompare,
    clearCompare,
    addToCart,
    addToQuote,
    navigateTo
  } = useShop();

  if (compareItems.length === 0) {
    return (
      <div className="container animate-fade-in" style={{ padding: '64px 24px', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '16px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '24px' }}>
          <Scale size={48} style={{ color: 'var(--text-muted)' }} />
        </div>
        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px' }}>Comparison Matrix is Empty</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 24px auto' }}>
          Add up to 3 mobiles from the catalog to compare their pricing, cameras, performance, and batteries side-by-side.
        </p>
        <button className="btn btn-primary" onClick={() => navigateTo('catalog')}>
          Browse Mobiles
        </button>
      </div>
    );
  }

  const handleAddToCart = (product) => {
    addToCart(product.id, 1);
    navigateTo('cart');
  };

  const handleAddToQuote = (product) => {
    addToQuote(product.id, 5);
    navigateTo('wholesale');
  };

  const specKeys = [
    { label: 'Price', key: 'price', format: (val) => `₹${val.toLocaleString('en-IN')}` },
    { label: 'Display Size & Tech', key: 'display', path: 'specs' },
    { label: 'Processor', key: 'processor', path: 'specs' },
    { label: 'RAM Memory', key: 'ram', path: 'specs' },
    { label: 'Internal Storage', key: 'storage', path: 'specs' },
    { label: 'Rear Camera', key: 'backCamera', path: 'specs' },
    { label: 'Front Camera', key: 'frontCamera', path: 'specs' },
    { label: 'Battery Capacity', key: 'battery', path: 'specs' },
    { label: 'Operating System', key: 'os', path: 'specs' },
    { label: 'Network Support', key: 'network', path: 'specs' },
    { label: 'Weight', key: 'weight', path: 'specs' }
  ];

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
        <div>
          <span className="badge badge-blue" style={{ marginBottom: '8px' }}>Compare Mode</span>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800 }}>Mobile Comparison Matrix</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Side-by-side analysis of key hardware and pricing details.</p>
        </div>
        
        <button className="btn btn-secondary" onClick={clearCompare} style={{ fontSize: '0.85rem' }}>
          Clear All ({compareItems.length})
        </button>
      </div>

      {/* Grid Matrix Table */}
      <div className="glass-panel" style={{ overflowX: 'auto', padding: '1px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              {/* First cell: labels header */}
              <th style={{ width: '20%', padding: '24px', textAlign: 'left', borderRight: '1px solid var(--border-color)', color: 'var(--text-muted)', fontWeight: 500, fontSize: '0.9rem' }}>
                Specifications
              </th>
              
              {/* Product Card Columns */}
              {compareItems.map(product => (
                <th key={product.id} style={{ padding: '24px', textAlign: 'center', borderRight: '1px solid var(--border-color)', position: 'relative', verticalAlign: 'top' }}>
                  <button 
                    className="btn-icon" 
                    onClick={() => removeCompare(product.id)}
                    style={{ position: 'absolute', top: '12px', right: '12px', width: '28px', height: '28px' }}
                    title="Remove from comparison"
                  >
                    <X size={14} />
                  </button>
                  
                  {/* Phone Render thumb */}
                  <div style={{ width: '50px', height: '80px', borderRadius: '8px', background: product.imageColor, margin: '0 auto 16px auto', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 'var(--shadow-sm)' }}>
                    <span style={{ fontSize: '1.2rem' }}>📱</span>
                  </div>

                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: '4px' }}>{product.name}</h3>
                  <span className="product-brand" style={{ fontSize: '0.7rem' }}>{product.brand}</span>
                </th>
              ))}

              {/* Empty placeholder column if < 3 items compared */}
              {compareItems.length < 3 && [...Array(3 - compareItems.length)].map((_, i) => (
                <th key={`empty-${i}`} style={{ padding: '24px', textAlign: 'center', verticalAlign: 'middle', background: 'rgba(255,255,255,0.01)' }}>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontStyle: 'italic' }}>
                    <button className="btn btn-secondary" onClick={() => navigateTo('catalog')} style={{ padding: '8px 16px', fontSize: '0.75rem' }}>
                      + Add Mobile
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          
          <tbody>
            {specKeys.map((spec, sIdx) => (
              <tr key={spec.label} style={{ borderBottom: sIdx === specKeys.length - 1 ? 'none' : '1px solid var(--border-color)', background: sIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'none' }}>
                {/* Spec Name */}
                <td style={{ padding: '16px 24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                  {spec.label}
                </td>

                {/* Compared Product Values */}
                {compareItems.map(product => {
                  const value = spec.path === 'specs'
                    ? product.specs[spec.key]
                    : product[spec.key];

                  return (
                    <td 
                      key={`${product.id}-${spec.label}`} 
                      style={{ 
                        padding: '16px 24px', 
                        textAlign: 'center', 
                        fontSize: '0.9rem', 
                        borderRight: '1px solid var(--border-color)',
                        color: spec.key === 'price' ? 'var(--text-primary)' : 'inherit',
                        fontWeight: spec.key === 'price' ? '700' : 'normal',
                        fontFamily: spec.key === 'price' ? 'var(--font-display)' : 'inherit'
                      }}
                    >
                      {spec.format ? spec.format(value) : value}
                    </td>
                  );
                })}

                {/* Empty placeholders columns */}
                {compareItems.length < 3 && [...Array(3 - compareItems.length)].map((_, i) => (
                  <td key={`empty-cell-${i}`} style={{ borderRight: i === (2 - compareItems.length) ? 'none' : '1px solid var(--border-color)' }}></td>
                ))}
              </tr>
            ))}

            {/* Quick Actions Row */}
            <tr style={{ background: 'rgba(99, 102, 241, 0.02)' }}>
              <td style={{ padding: '24px', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', borderRight: '1px solid var(--border-color)' }}>
                Purchase Options
              </td>

              {compareItems.map(product => (
                <td key={`actions-${product.id}`} style={{ padding: '24px', borderRight: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '180px', margin: '0 auto' }}>
                    <button className="btn btn-primary" onClick={() => handleAddToCart(product)} style={{ width: '100%', fontSize: '0.8rem', padding: '10px' }}>
                      <ShoppingCart size={14} /> Buy Retail
                    </button>
                    <button className="btn btn-secondary" onClick={() => handleAddToQuote(product)} style={{ width: '100%', fontSize: '0.8rem', padding: '10px', borderColor: 'var(--accent-gold)' }}>
                      <FileText size={14} style={{ color: 'var(--accent-gold)' }} /> Request Quote
                    </button>
                  </div>
                </td>
              ))}

              {/* Empty placeholder columns */}
              {compareItems.length < 3 && [...Array(3 - compareItems.length)].map((_, i) => (
                <td key={`empty-actions-${i}`} style={{ borderRight: i === (2 - compareItems.length) ? 'none' : '1px solid var(--border-color)' }}></td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
