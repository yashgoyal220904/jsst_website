import React from 'react';
import { useShop } from '../context/ShopContext';
import { Star, ShoppingCart, FileText, Check } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    cart,
    quoteItems,
    compareItems,
    addToCart,
    addToQuote,
    toggleCompare,
    navigateTo
  } = useShop();

  const isCompared = compareItems.some(item => item.id === product.id);
  const isInCart = cart.some(item => item.product.id === product.id);
  const isInQuote = quoteItems.some(item => item.product.id === product.id);

  // Calculate discount percentage
  const discount = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  const handleAddToCart = (e) => {
    e.stopPropagation();
    addToCart(product.id, 1);
    navigateTo('cart');
  };

  const handleAddToQuote = (e) => {
    e.stopPropagation();
    addToQuote(product.id, 5); // Default wholesale qty is 5
    navigateTo('wholesale');
  };

  const handleCompareToggle = (e) => {
    e.stopPropagation();
    toggleCompare(product);
  };

  return (
    <div className="product-card" onClick={() => navigateTo('detail', product.id)}>
      {/* Compare Checkbox */}
      <label className="compare-checkbox-label" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={isCompared}
          onChange={handleCompareToggle}
          style={{ width: '13px', height: '13px' }}
        />
        <span>Compare</span>
      </label>

      {/* Modern Visual Phone Render */}
      <div className="product-card-visual" style={{ background: product.imageColor }}>
        <div className="card-phone-mockup">
          <div className="card-phone-screen" style={{ background: 'rgba(0,0,0,0.85)' }}>
            <span style={{ fontSize: '1.2rem', marginBottom: '4px' }}>📱</span>
            <div className="card-phone-logo">{product.brand}</div>
            <div style={{ fontSize: '0.55rem', opacity: 0.6, marginTop: '5px' }}>
              {product.specs.processor.split(' ')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Product Information */}
      <div className="product-card-details">
        <span className="product-brand">{product.brand}</span>
        <h3 className="product-title" style={{ cursor: 'pointer' }}>
          {product.name}
        </h3>

        {/* Rating */}
        <div className="rating-container">
          <div style={{ display: 'flex', gap: '2px' }}>
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                className="rating-star"
                style={{
                  fill: i < Math.floor(product.rating) ? 'var(--accent-gold)' : 'none',
                  color: 'var(--accent-gold)'
                }}
              />
            ))}
          </div>
          <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
            {product.rating}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            ({product.reviewsCount} reviews)
          </span>
        </div>

        {/* Pricing */}
        <div className="price-container">
          <span className="product-price">₹{product.price.toLocaleString('en-IN')}</span>
          {product.mrp > product.price && (
            <>
              <span className="product-mrp">₹{product.mrp.toLocaleString('en-IN')}</span>
              <span className="product-discount">{discount}% OFF</span>
            </>
          )}
        </div>

        {/* Spec badges */}
        <div className="card-spec-tags">
          <span className="card-spec-tag">{product.specs.ram} RAM</span>
          <span className="card-spec-tag">{product.specs.storage}</span>
          <span className="card-spec-tag">{product.specs.network}</span>
        </div>

        {/* Actions buttons */}
        <div className="card-actions">
          <button 
            className="btn btn-secondary" 
            onClick={handleAddToQuote}
            style={{ padding: '8px 12px', fontSize: '0.8rem', borderColor: isInQuote ? 'var(--accent-gold)' : 'var(--border-color)' }}
          >
            <FileText size={13} style={{ color: isInQuote ? 'var(--accent-gold)' : 'inherit' }} />
            <span>{isInQuote ? 'In Quote' : 'Quote (B2B)'}</span>
          </button>
          
          <button 
            className="btn btn-primary" 
            onClick={handleAddToCart}
            style={{ padding: '8px 12px', fontSize: '0.8rem', background: isInCart ? 'var(--accent-success)' : 'var(--accent-primary)' }}
          >
            <ShoppingCart size={13} />
            <span>{isInCart ? 'In Cart' : 'Buy Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
