import React, { createContext, useContext, useState, useEffect } from 'react';
import { products as initialProducts } from '../data/products';

const ShopContext = createContext();

export const ShopProvider = ({ children }) => {
  // Dynamic products state synced with backend
  const [products, setProducts] = useState(initialProducts);

  // Navigation states
  const [activePage, setActivePage] = useState('home');
  const [selectedProductId, setSelectedProductId] = useState(null);
  
  // Shop states
  const [cart, setCart] = useState([]);
  const [quoteItems, setQuoteItems] = useState([]);
  const [compareItems, setCompareItems] = useState([]);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(true);
  
  // Global search input
  const [searchQuery, setSearchQuery] = useState('');
  
  // Order history synced with backend
  const [orders, setOrders] = useState([]);

  // Customer Login State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('jss_customer_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // Dynamic active coupons/offers synced with backend
  const [coupons, setCoupons] = useState([
    { code: 'SHREESHYAM', type: 'flat', value: 2500, minSubtotal: 50000, description: 'Flat ₹2,500 Off on orders above ₹50,000' },
    { code: 'JSS10', type: 'percent', value: 10, minSubtotal: 0, description: '10% Off on all orders' },
    { code: 'FIRSTBUY', type: 'flat', value: 1000, minSubtotal: 10000, description: 'Flat ₹1,000 Off on orders above ₹10,000' }
  ]);

  // Dynamic active bank card offers synced with backend
  const [bankOffers, setBankOffers] = useState([
    { id: 'HDFC', bank: 'HDFC Card EMI', desc: 'Flat ₹3,000 Instant Off', type: 'flat', value: 3000, maxDiscount: 3000 },
    { id: 'ICICI', bank: 'ICICI Card', desc: '10% Cashback up to ₹2,500', type: 'percent', value: 10, maxDiscount: 2500 },
    { id: 'SBI', bank: 'SBI Card', desc: 'Flat ₹1,500 Instant Discount', type: 'flat', value: 1500, maxDiscount: 1500 }
  ]);

  // Dynamic Deal of the Week (Flash Sale) synced with backend
  const [flashDeal, setFlashDeal] = useState({
    id: 'active',
    product_id: 'xiaomi-14',
    discount: 3500,
    description: 'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
  });

  // Customer callback queries and B2B wholesale quotations synced with backend
  const [queries, setQueries] = useState([]);

  // Fetch initial data from backend API
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const prodRes = await fetch('/api/products');
        if (prodRes.ok) {
          const prodData = await prodRes.json();
          setProducts(prodData);
        }
      } catch (err) {
        console.error('Error fetching products from backend:', err);
      }

      try {
        const coupRes = await fetch('/api/coupons');
        if (coupRes.ok) {
          const coupData = await coupRes.json();
          setCoupons(coupData);
        }
      } catch (err) {
        console.error('Error fetching coupons from backend:', err);
      }

      try {
        const bankRes = await fetch('/api/bank-offers');
        if (bankRes.ok) {
          const bankData = await bankRes.json();
          setBankOffers(bankData);
        }
      } catch (err) {
        console.error('Error fetching bank offers from backend:', err);
      }

      try {
        const flashRes = await fetch('/api/flash-deal');
        if (flashRes.ok) {
          const flashData = await flashRes.json();
          setFlashDeal(flashData);
        }
      } catch (err) {
        console.error('Error fetching flash deal from backend:', err);
      }

      try {
        const queryRes = await fetch('/api/queries');
        if (queryRes.ok) {
          const queryData = await queryRes.json();
          setQueries(queryData);
        }
      } catch (err) {
        console.error('Error fetching queries from backend:', err);
      }

      try {
        const orderRes = await fetch('/api/orders');
        if (orderRes.ok) {
          const orderData = await orderRes.json();
          setOrders(orderData);
        }
      } catch (err) {
        console.error('Error fetching orders from backend:', err);
      }
    };

    fetchInitialData();
  }, []);

  // Sync theme with class on documentElement
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.remove('light-mode');
    } else {
      root.classList.add('light-mode');
    }
  }, [darkMode]);

  // Navigate helper
  const navigateTo = (page, productId = null) => {
    setActivePage(page);
    if (productId) {
      setSelectedProductId(productId);
    }
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // --- Cart Actions ---
  const addToCart = (productId, qty = 1) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.product.id === productId);
      if (existingItem) {
        return prevCart.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: item.quantity + qty } 
            : item
        );
      }
      return [...prevCart, { product, quantity: qty }];
    });
  };

  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.product.id !== productId));
  };

  const updateCartQuantity = (productId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart(prevCart => prevCart.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code, subtotal) => {
    const cleanCode = code.trim().toUpperCase();
    const coupon = coupons.find(c => c.code === cleanCode);
    if (!coupon) {
      return { success: false, msg: 'Invalid promo code. Check active offers.' };
    }
    if (subtotal < coupon.minSubtotal) {
      return { 
        success: false, 
        msg: `Coupon ${coupon.code} requires a minimum purchase of ₹${coupon.minSubtotal.toLocaleString('en-IN')}.` 
      };
    }
    let discount = 0;
    if (coupon.type === 'flat') {
      discount = coupon.value;
    } else if (coupon.type === 'percent') {
      discount = Math.round(subtotal * (coupon.value / 100));
    }
    const applied = { 
      code: coupon.code, 
      type: coupon.type, 
      value: discount, 
      percent: coupon.type === 'percent' ? coupon.value : null 
    };
    setAppliedCoupon(applied);
    return { success: true, msg: `${coupon.code} coupon applied! Discount: ₹${discount.toLocaleString('en-IN')}` };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  // --- Wholesale Quote Actions ---
  const addToQuote = (productId, qty = 5) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    setQuoteItems(prevQuote => {
      const existingItem = prevQuote.find(item => item.product.id === productId);
      if (existingItem) {
        return prevQuote.map(item => 
          item.product.id === productId 
            ? { ...item, quantity: Math.max(5, item.quantity + qty) } 
            : item
        );
      }
      return [...prevQuote, { product, quantity: Math.max(5, qty) }];
    });
  };

  const removeFromQuote = (productId) => {
    setQuoteItems(prevQuote => prevQuote.filter(item => item.product.id !== productId));
  };

  const updateQuoteQuantity = (productId, quantity) => {
    // Wholesale minimum quantity is 5
    if (quantity < 5) {
      removeFromQuote(productId);
      return;
    }
    setQuoteItems(prevQuote => prevQuote.map(item => 
      item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearQuote = () => setQuoteItems([]);

  // --- Comparison Actions ---
  const toggleCompare = (product) => {
    setCompareItems(prev => {
      const exists = prev.some(item => item.id === product.id);
      if (exists) {
        return prev.filter(item => item.id !== product.id);
      }
      if (prev.length >= 3) {
        alert("You can compare a maximum of 3 mobiles at the same time.");
        return prev;
      }
      return [...prev, product];
    });
  };

  const removeCompare = (productId) => {
    setCompareItems(prev => prev.filter(item => item.id !== productId));
  };

  const clearCompare = () => setCompareItems([]);

  // --- Order History Actions ---
  const addOrder = async (order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setOrders(prev => [savedOrder, ...prev]);
        return { success: true, order: savedOrder };
      }
      return { success: false, msg: 'Failed to place order.' };
    } catch (err) {
      console.error('Error saving order to database:', err);
      return { success: false, msg: 'Network error placing order.' };
    }
  };

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updatedOrder = await res.json();
        setOrders(prev => prev.map(o => o.id === orderId ? updatedOrder : o));
        return { success: true, order: updatedOrder };
      }
      return { success: false, msg: 'Failed to update order status.' };
    } catch (err) {
      console.error('Error updating order status:', err);
      return { success: false, msg: 'Network error updating order status.' };
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        return { success: true };
      }
      return { success: false, msg: 'Failed to delete order.' };
    } catch (err) {
      console.error('Error deleting order:', err);
      return { success: false, msg: 'Network error deleting order.' };
    }
  };

  // --- Customer Auth Actions ---
  const registerCustomer = async (name, email, phone, password, address = '', pincode = '') => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password, address, pincode })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        localStorage.setItem('jss_customer_user', JSON.stringify(data));
        return { success: true, user: data };
      } else {
        const errData = await res.json();
        return { success: false, msg: errData.error || 'Registration failed' };
      }
    } catch (err) {
      console.error('Registration error:', err);
      return { success: false, msg: 'Network error occurred during registration.' };
    }
  };

  const loginCustomer = async (email, password) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (res.ok) {
        const data = await res.json();
        setCurrentUser(data);
        localStorage.setItem('jss_customer_user', JSON.stringify(data));
        return { success: true, user: data };
      } else {
        const errData = await res.json();
        return { success: false, msg: errData.error || 'Invalid email or password' };
      }
    } catch (err) {
      console.error('Login error:', err);
      return { success: false, msg: 'Network error occurred during login.' };
    }
  };

  const logoutCustomer = () => {
    setCurrentUser(null);
    localStorage.removeItem('jss_customer_user');
  };

  const updateCustomerProfile = async (updatedFields) => {
    if (!currentUser) return { success: false, msg: 'No active user session' };
    try {
      const res = await fetch(`/api/users/${currentUser.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updated = await res.json();
        setCurrentUser(updated);
        localStorage.setItem('jss_customer_user', JSON.stringify(updated));
        return { success: true, user: updated };
      } else {
        const errData = await res.json();
        return { success: false, msg: errData.error || 'Failed to update profile' };
      }
    } catch (err) {
      console.error('Profile update error:', err);
      return { success: false, msg: 'Network error occurred during profile update.' };
    }
  };

  // --- Live Stock & Price Management Actions (Admin Panel) ---
  const updateProductStock = async (productId, inStock) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inStock })
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      }
    } catch (err) {
      console.error('Error updating stock on database:', err);
    }
  };

  const updateProductPrice = async (productId, price) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ price: Number(price) })
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      }
    } catch (err) {
      console.error('Error updating price on database:', err);
    }
  };

  const updateProduct = async (productId, updatedFields) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updatedProduct = await res.json();
        setProducts(prev => prev.map(p => p.id === productId ? updatedProduct : p));
      }
    } catch (err) {
      console.error('Error updating product on database:', err);
    }
  };

  const addProduct = async (newProduct) => {
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      if (res.ok) {
        const created = await res.json();
        setProducts(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Error adding product to database:', err);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      const res = await fetch(`/api/products/${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error('Error deleting product from database:', err);
    }
  };

  const resetProducts = async () => {
    try {
      const res = await fetch('/api/products/reset', { method: 'POST' });
      if (res.ok) {
        const resetData = await res.json();
        setProducts(resetData);
      }
    } catch (err) {
      console.error('Error resetting products in database:', err);
    }
  };

  // --- Dynamic Coupons Actions ---
  const addCoupon = async (newCoupon) => {
    try {
      const res = await fetch('/api/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCoupon)
      });
      if (res.ok) {
        const created = await res.json();
        setCoupons(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Error adding coupon to database:', err);
    }
  };

  const deleteCoupon = async (code) => {
    try {
      const res = await fetch(`/api/coupons/${code}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setCoupons(prev => prev.filter(c => c.code !== code));
        if (appliedCoupon && appliedCoupon.code === code) {
          setAppliedCoupon(null);
        }
      }
    } catch (err) {
      console.error('Error deleting coupon from database:', err);
    }
  };

  const resetCoupons = async () => {
    try {
      const res = await fetch('/api/coupons/reset', { method: 'POST' });
      if (res.ok) {
        const resetData = await res.json();
        setCoupons(resetData);
        setAppliedCoupon(null);
      }
    } catch (err) {
      console.error('Error resetting coupons in database:', err);
    }
  };

  // --- Dynamic Bank Offers Actions ---
  const addBankOffer = async (newOffer) => {
    try {
      const res = await fetch('/api/bank-offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOffer)
      });
      if (res.ok) {
        const created = await res.json();
        setBankOffers(prev => [...prev, created]);
      }
    } catch (err) {
      console.error('Error adding bank offer to database:', err);
    }
  };

  const deleteBankOffer = async (id) => {
    try {
      const res = await fetch(`/api/bank-offers/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setBankOffers(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      console.error('Error deleting bank offer from database:', err);
    }
  };

  const resetBankOffers = async () => {
    try {
      const res = await fetch('/api/bank-offers/reset', { method: 'POST' });
      if (res.ok) {
        const resetData = await res.json();
        setBankOffers(resetData);
      }
    } catch (err) {
      console.error('Error resetting bank offers in database:', err);
    }
  };

  const updateBankOffer = async (id, updatedFields) => {
    try {
      const res = await fetch(`/api/bank-offers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      if (res.ok) {
        const updatedOffer = await res.json();
        setBankOffers(prev => prev.map(b => b.id === id ? updatedOffer : b));
      }
    } catch (err) {
      console.error('Error updating bank offer on database:', err);
    }
  };

  // --- Dynamic Deal of the Week (Flash Sale) Actions ---
  const updateFlashDeal = async (productId, discount, description) => {
    try {
      const res = await fetch('/api/flash-deal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ product_id: productId, discount: Number(discount), description })
      });
      if (res.ok) {
        const updatedDeal = await res.json();
        setFlashDeal(updatedDeal);
      }
    } catch (err) {
      console.error('Error updating flash deal on database:', err);
    }
  };

  const resetFlashDeal = async () => {
    try {
      const res = await fetch('/api/flash-deal/reset', { method: 'POST' });
      if (res.ok) {
        const resetData = await res.json();
        setFlashDeal(resetData);
      }
    } catch (err) {
      console.error('Error resetting flash deal in database:', err);
    }
  };

  // --- Customer Queries Actions ---
  const submitCallbackQuery = async (name, phone, email, subject, message) => {
    const newQuery = {
      id: 'query-' + Date.now(),
      type: 'callback',
      date: new Date().toISOString(),
      contactName: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      subject: subject.trim(),
      message: message.trim(),
      status: 'Pending'
    };
    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuery)
      });
      if (res.ok) {
        const savedQuery = await res.json();
        setQueries(prev => [savedQuery, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting callback query to database:', err);
    }
  };

  const submitWholesaleQuery = async (dealerForm, quoteItems) => {
    const itemsSummary = quoteItems.map(item => ({
      productId: item.product.id,
      name: item.product.name,
      quantity: item.quantity,
      price: item.product.price,
      discount: item.quantity >= 51 ? 20 : (item.quantity >= 26 ? 15 : (item.quantity >= 11 ? 10 : 5))
    }));
    
    const totalVolume = quoteItems.reduce((acc, item) => acc + item.quantity, 0);
    const retailTotal = quoteItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
    const discountTotal = quoteItems.reduce((acc, item) => {
      const disc = item.quantity >= 51 ? 20 : (item.quantity >= 26 ? 15 : (item.quantity >= 11 ? 10 : 5));
      return acc + (item.product.price * (disc / 100)) * item.quantity;
    }, 0);
    const netTotal = retailTotal - discountTotal;

    const newQuery = {
      id: 'query-' + Date.now(),
      type: 'wholesale',
      date: new Date().toISOString(),
      companyName: dealerForm.companyName.trim(),
      gstNumber: dealerForm.gstNumber.trim(),
      contactName: dealerForm.contactName.trim(),
      phone: dealerForm.phone.trim(),
      email: dealerForm.email.trim(),
      deliveryDate: dealerForm.deliveryDate,
      comments: dealerForm.comments.trim(),
      items: itemsSummary,
      totalVolume,
      netTotal,
      status: 'Pending'
    };

    try {
      const res = await fetch('/api/queries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newQuery)
      });
      if (res.ok) {
        const savedQuery = await res.json();
        setQueries(prev => [savedQuery, ...prev]);
      }
    } catch (err) {
      console.error('Error submitting wholesale query to database:', err);
    }
  };

  const deleteQuery = async (queryId) => {
    try {
      const res = await fetch(`/api/queries/${queryId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setQueries(prev => prev.filter(q => q.id !== queryId));
      }
    } catch (err) {
      console.error('Error deleting query from database:', err);
    }
  };

  const resetQueries = async () => {
    try {
      const res = await fetch('/api/queries/reset', { method: 'POST' });
      if (res.ok) {
        setQueries([]);
      }
    } catch (err) {
      console.error('Error resetting queries in database:', err);
    }
  };

  return (
    <ShopContext.Provider value={{
      products,
      activePage,
      selectedProductId,
      cart,
      quoteItems,
      compareItems,
      darkMode,
      searchQuery,
      orders,
      setDarkMode,
      setSearchQuery,
      navigateTo,
      addToCart,
      removeFromCart,
      updateCartQuantity,
      clearCart,
      addToQuote,
      removeFromQuote,
      updateQuoteQuantity,
      clearQuote,
      toggleCompare,
      removeCompare,
      clearCompare,
      addOrder,
      appliedCoupon,
      applyCoupon,
      removeCoupon,
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
      submitCallbackQuery,
      submitWholesaleQuery,
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
      currentUser,
      registerCustomer,
      loginCustomer,
      logoutCustomer,
      updateCustomerProfile,
      updateOrderStatus,
      deleteOrder
    }}>
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
