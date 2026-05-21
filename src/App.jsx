import React from 'react'
import { useShop } from './context/ShopContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import Detail from './pages/Detail'
import Cart from './pages/Cart'
import Wholesale from './pages/Wholesale'
import Admin from './pages/Admin'
import Account from './pages/Account'
import ProductCompare from './components/ProductCompare'
import { Scale, X } from 'lucide-react'

function App() {
  const { activePage, compareItems, navigateTo, removeCompare, clearCompare } = useShop()

  // Routing switch
  const renderActivePage = () => {
    switch (activePage) {
      case 'home':
        return <Home />
      case 'catalog':
        return <Catalog />
      case 'detail':
        return <Detail />
      case 'cart':
        return <Cart />
      case 'wholesale':
        return <Wholesale />
      case 'compare':
        return <ProductCompare />
      case 'admin':
        return <Admin />
      case 'account':
        return <Account />
      default:
        return <Home />
    }
  }

  return (
    <div className="app-wrapper">
      {/* Dynamic Header */}
      <Navbar />

      {/* Main Pages Content */}
      <main className="main-content">
        {renderActivePage()}
      </main>

      {/* Floating specification comparison drawer */}
      {compareItems.length > 0 && activePage !== 'compare' && (
        <div 
          className="no-print"
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 99,
            backgroundColor: 'var(--bg-secondary)',
            border: '2px solid var(--accent-primary)',
            borderRadius: 'var(--border-radius-md)',
            boxShadow: 'var(--shadow-lg), 0 0 30px rgba(99, 102, 241, 0.2)',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            maxWidth: '90%',
            width: '600px',
            animation: 'fadeIn 0.3s ease-out'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)' }}>
            <Scale size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Compare</span>
          </div>

          {/* Thumbnails of compared phones */}
          <div style={{ display: 'flex', gap: '12px', flexGrow: 1, overflowX: 'auto', padding: '4px 0' }}>
            {compareItems.map(product => (
              <div 
                key={product.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  background: 'var(--bg-tertiary)',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.75rem',
                  fontWeight: 550,
                  whiteSpace: 'nowrap',
                  position: 'relative'
                }}
              >
                <span>{product.name.split(' ').slice(-2).join(' ')}</span>
                <button 
                  onClick={() => removeCompare(product.id)}
                  style={{ display: 'flex', alignItems: 'center', color: 'var(--text-muted)', hover: { color: 'var(--accent-danger)' } }}
                  title="Remove device"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', flexShrink: 0 }}>
            <button 
              className="btn btn-secondary" 
              onClick={clearCompare} 
              style={{ padding: '8px 12px', fontSize: '0.75rem' }}
            >
              Clear
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => navigateTo('compare')}
              style={{ padding: '8px 16px', fontSize: '0.75rem' }}
            >
              Compare Now ({compareItems.length})
            </button>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App
