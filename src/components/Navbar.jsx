import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, FileText, Scale, Search, Sun, Moon, Phone, User, Menu, X } from 'lucide-react';

export default function Navbar() {
  const {
    activePage,
    cart,
    quoteItems,
    compareItems,
    darkMode,
    setDarkMode,
    searchQuery,
    setSearchQuery,
    navigateTo,
    currentUser
  } = useShop();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const quoteCount = quoteItems.length;

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (activePage !== 'catalog' && activePage !== 'detail') {
      navigateTo('catalog');
    }
  };

  const handleNavClick = (page) => {
    navigateTo(page);
    setMobileMenuOpen(false);
  };

  return (
    <header className="navbar-sticky no-print">
      <div className="container navbar-container">
        {/* Brand Logo */}
        <div className="logo" onClick={() => handleNavClick('home')} style={{ cursor: 'pointer' }}>
          <span style={{ color: 'var(--accent-primary)' }}>📱</span>
          <span>JAI SHREE SHYAM <span className="gold-gradient-text">TRADERS</span></span>
        </div>

        {/* Modern styled search bar */}
        <div className="search-bar-container">
          <Search className="search-icon-nav" size={18} />
          <input
            type="text"
            placeholder="Search all mobiles, brands or specs..."
            className="search-input"
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>

        {/* Action links */}
        <div className={`nav-links ${mobileMenuOpen ? 'open' : ''}`}>
          <button 
            className={`nav-link ${activePage === 'home' ? 'active' : ''}`}
            onClick={() => handleNavClick('home')}
          >
            Home
          </button>
          
          <button 
            className={`nav-link ${activePage === 'catalog' ? 'active' : ''}`}
            onClick={() => handleNavClick('catalog')}
          >
            Mobiles
          </button>

          {/* Wholesale quote builder link */}
          <button 
            className={`nav-link ${activePage === 'wholesale' ? 'active' : ''}`}
            onClick={() => handleNavClick('wholesale')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <span style={{ color: 'var(--accent-gold)' }}>★</span> Wholesale
          </button>

          {/* Compare shortcut if there are items */}
          {compareItems.length > 0 && (
            <button 
              className={`nav-link ${activePage === 'compare' ? 'active' : ''}`}
              onClick={() => handleNavClick('compare')}
              style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <Scale size={16} style={{ color: 'var(--accent-primary)' }} />
              Compare ({compareItems.length})
            </button>
          )}

          {/* Contact Helpline */}
          <a href="tel:+917206261583" className="nav-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem' }}>
            <Phone size={14} className="rating-star" />
            <span>Support</span>
          </a>

          {/* Customer Account Portal */}
          <button 
            className={`nav-link ${activePage === 'account' ? 'active' : ''}`}
            onClick={() => handleNavClick('account')}
            style={{ display: 'flex', alignItems: 'center', gap: '5px' }}
          >
            <User size={15} style={{ color: currentUser ? 'var(--accent-success)' : 'inherit' }} />
            <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
          </button>
        </div>

        {/* Navbar Action Icons */}
        <div className="nav-actions">
          {/* Light/Dark Toggle */}
          <button 
            className="btn-icon" 
            onClick={() => setDarkMode(!darkMode)}
            title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Wholesale Quote basket icon */}
          <button 
            className="btn-icon quote-icon-wrapper" 
            onClick={() => handleNavClick('wholesale')}
            title="Wholesale Quotation Request"
            style={{ borderColor: quoteCount > 0 ? 'var(--accent-gold)' : 'var(--border-color)' }}
          >
            <FileText size={18} style={{ color: quoteCount > 0 ? 'var(--accent-gold)' : 'inherit' }} />
            {quoteCount > 0 && <span className="quote-count">{quoteCount}</span>}
          </button>

          {/* Cart basket icon */}
          <button 
            className="btn-icon cart-icon-wrapper" 
            onClick={() => handleNavClick('cart')}
            title="Shopping Cart"
            style={{ borderColor: cartCount > 0 ? 'var(--accent-primary)' : 'var(--border-color)' }}
          >
            <ShoppingCart size={18} style={{ color: cartCount > 0 ? 'var(--accent-primary)' : 'inherit' }} />
            {cartCount > 0 && <span className="cart-count">{cartCount}</span>}
          </button>

          {/* Mobile hamburger menu toggle */}
          <button 
            className="hamburger-toggle" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            title={mobileMenuOpen ? "Close Menu" : "Open Menu"}
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>
    </header>
  );
}
