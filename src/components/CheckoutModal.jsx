import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { X, CreditCard, CheckCircle, Smartphone, Landmark, HandCoins, ArrowRight, Printer } from 'lucide-react';
import { STRIPE_CONFIG } from '../stripeConfig';
import { loadStripe } from '@stripe/stripe-js';
import { RAZORPAY_CONFIG } from '../razorpayConfig';

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutModal({ isOpen, onClose }) {
  const { cart, clearCart, addOrder, appliedCoupon, bankOffers, currentUser } = useShop();
  
  // Checkout wizard steps: 'shipping' | 'payment' | 'processing' | 'otp' | 'success'
  const [step, setStep] = useState('shipping');
  const [orderId, setOrderId] = useState('');
  
  // Shipping Form State
  const [shippingForm, setShippingForm] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    pincode: '',
    city: 'New Delhi',
    state: 'Delhi'
  });

  // Payment Selection State: 'upi' | 'card' | 'netbanking' | 'cod'
  const [paymentMethod, setPaymentMethod] = useState('upi');
  
  // Card Form State
  const [cardForm, setCardForm] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  // Stripe Elements States
  const [cardType, setCardType] = useState('Unknown');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('India');
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [processingText, setProcessingText] = useState('Connecting to secure banking portals to authorize your purchase. Please do not close this window.');

  // Selected Bank Offer State for card checkout
  const [checkoutBank, setCheckoutBank] = useState('');

  // Local state to store receipt details so they do not clear when cart is emptied
  const [receipt, setReceipt] = useState({
    subtotal: 0,
    couponDiscount: 0,
    bankDiscount: 0,
    total: 0,
    items: [],
    bankName: ''
  });

  const subtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const couponDiscount = appliedCoupon ? appliedCoupon.value : 0;
  
  // Dynamic bank offer deductions from SQLite
  const getBankDiscount = () => {
    if (paymentMethod !== 'card' || !checkoutBank) return 0;
    const offer = bankOffers.find(o => o.id === checkoutBank);
    if (!offer) return 0;
    if (offer.type === 'flat') {
      return offer.value;
    } else if (offer.type === 'percent') {
      return Math.min(Math.round(subtotal * (offer.value / 100)), offer.maxDiscount || Infinity);
    }
    return 0;
  };
  const bankDiscount = getBankDiscount();

  const currentPayable = Math.max(subtotal - couponDiscount - bankDiscount, 1000);

  useEffect(() => {
    if (isOpen) {
      loadRazorpayScript();
      setStep('shipping');
      setCheckoutBank('');
      setCardType('Unknown');
      setZipCode('');
      setCountry('India');
      setOtpCode('');
      setOtpError('');
      setProcessingText('Connecting to secure banking portals to authorize your purchase. Please do not close this window.');
      // Reset card state
      setCardForm({ number: '', expiry: '', cvv: '', name: '' });

      // Pre-fill shipping form if user logged in
      if (currentUser) {
        setShippingForm({
          name: currentUser.name || '',
          email: currentUser.email || '',
          phone: currentUser.phone || '',
          address: currentUser.address || '',
          pincode: currentUser.pincode || '',
          city: 'New Delhi',
          state: 'Delhi'
        });
      } else {
        setShippingForm({
          name: '',
          email: '',
          phone: '',
          address: '',
          pincode: '',
          city: 'New Delhi',
          state: 'Delhi'
        });
      }
    }
  }, [isOpen, currentUser]);

  if (!isOpen) return null;

  // Handle inputs
  const handleShippingChange = (e) => {
    setShippingForm({ ...shippingForm, [e.target.name]: e.target.value });
  };

  const handleCardChange = (e) => {
    let { name, value } = e.target;
    
    // Formatting card number with spaces
    if (name === 'number') {
      value = value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim();
      if (value.length > 19) return; // limit to 16 digits + 3 spaces

      // Card Brand Detection
      const cleanNum = value.replace(/\s+/g, '');
      if (/^4/.test(cleanNum)) {
        setCardType('Visa');
      } else if (/^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cleanNum)) {
        setCardType('Mastercard');
      } else if (/^3[47]/.test(cleanNum)) {
        setCardType('Amex');
      } else if (/^(60|65|81|82|508)/.test(cleanNum)) {
        setCardType('RuPay');
      } else {
        setCardType('Unknown');
      }
    }
    
    // Formatting expiry with slash
    if (name === 'expiry') {
      value = value.replace(/\//g, '');
      if (value.length > 2) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4);
      }
      if (value.length > 5) return; // MM/YY limit
    }

    if (name === 'cvv' && value.length > 3) return; // limit CVV

    setCardForm({ ...cardForm, [name]: value });
  };

  const submitShipping = (e) => {
    e.preventDefault();
    if (!shippingForm.name || !shippingForm.phone || !shippingForm.address || !shippingForm.pincode) {
      alert("Please fill all required shipping details.");
      return;
    }
    setStep('payment');
  };

  const triggerPaymentSimulation = () => {
    // Capture receipt details prior to cart clearing
    setReceipt({
      subtotal: subtotal,
      couponDiscount: couponDiscount,
      bankDiscount: bankDiscount,
      total: currentPayable,
      items: [...cart],
      bankName: checkoutBank
    });

    setProcessingText('Connecting to secure banking portals to authorize your purchase. Please do not close this window.');
    setStep('processing');
    
    // Simulate payment call wait
    setTimeout(() => {
      const generatedId = `JSS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      
      const newOrder = {
        id: generatedId,
        date: new Date().toLocaleDateString('en-IN'),
        items: [...cart],
        subtotal: subtotal,
        couponDiscount: couponDiscount,
        bankDiscount: bankDiscount,
        total: currentPayable,
        customer: shippingForm,
        paymentMethod: paymentMethod.toUpperCase() + (checkoutBank ? ` (${checkoutBank} CARD)` : '')
      };
      
      addOrder(newOrder);
      setStep('success');
      clearCart();
    }, 3000);
  };

  // Razorpay Simulation handler
  const triggerRazorpaySimulation = () => {
    setProcessingText('Launching Razorpay Sandbox Gateway...');
    setStep('processing');
    
    setTimeout(() => {
      const generatedOrderId = `JSS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substring(2, 10)}`;
      
      const proceed = window.confirm(`[RAZORPAY SANDBOX SIMULATOR]
Merchant: Jai Shree Shyam Traders
Amount: ₹${currentPayable.toLocaleString('en-IN')}

Would you like to simulate a SUCCESSFUL payment transaction?
Click "OK" to Approve or "Cancel" to Decline.`);
      
      if (proceed) {
        setProcessingText('Verifying payment signature with Razorpay Secure API...');
        setStep('processing');
        
        setTimeout(async () => {
          try {
            const verifyRes = await fetch('/api/razorpay/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: `order_mock_${Math.random().toString(36).substring(2, 10)}`,
                razorpay_payment_id: mockPaymentId,
                razorpay_signature: 'mock_signature',
                order: {
                  id: generatedOrderId,
                  date: new Date().toLocaleDateString('en-IN'),
                  items: [...cart],
                  subtotal: subtotal,
                  couponDiscount: couponDiscount,
                  bankDiscount: bankDiscount,
                  total: currentPayable,
                  customer: shippingForm,
                  paymentMethod: `RAZORPAY (MOCK_${paymentMethod.toUpperCase()})`
                }
              })
            });
            
            const verifyData = await verifyRes.json();
            if (verifyData.success) {
              setOrderId(generatedOrderId);
              setReceipt({
                subtotal: subtotal,
                couponDiscount: couponDiscount,
                bankDiscount: bankDiscount,
                total: currentPayable,
                items: [...cart],
                bankName: `MOCK_${paymentMethod.toUpperCase()}`
              });
              setStep('success');
              clearCart();
            } else {
              alert("Mock verification failed");
              setStep('payment');
            }
          } catch (err) {
            console.error(err);
            setStep('payment');
          }
        }, 1500);
      } else {
        alert("Payment canceled by user.");
        setStep('payment');
      }
    }, 1500);
  };

  // Real Razorpay integration flow
  const handleRazorpayCheckout = async () => {
    if (!RAZORPAY_CONFIG.USE_REAL_RAZORPAY) {
      triggerRazorpaySimulation();
      return;
    }

    setProcessingText('Initializing secure checkout window...');
    setStep('processing');
    
    let keyId = '';
    try {
      const configRes = await fetch('/api/razorpay/config');
      const configData = await configRes.json();
      keyId = configData.keyId;
    } catch (err) {
      console.error("Failed to load Razorpay config:", err);
    }
    
    if (!keyId) {
      console.log("No Razorpay Key ID found. Falling back to sandbox simulation.");
      triggerRazorpaySimulation();
      return;
    }
    
    const generatedOrderId = `JSS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const rzpReceipt = `rcpt_${Date.now()}`;
    
    let rzpOrder;
    try {
      const orderRes = await fetch('/api/razorpay/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: currentPayable,
          receipt: rzpReceipt
        })
      });
      if (!orderRes.ok) {
        throw new Error("Backend failed to create Razorpay order");
      }
      rzpOrder = await orderRes.json();
    } catch (err) {
      console.error("Razorpay order creation error:", err);
      alert(`Razorpay Setup Error: ${err.message}. Running in simulated mode instead.`);
      triggerRazorpaySimulation();
      return;
    }
    
    const options = {
      key: keyId,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
      name: "Jai Shree Shyam Traders",
      description: `Payment for Order #${generatedOrderId}`,
      image: "/favicon.svg",
      order_id: rzpOrder.id,
      handler: async function (response) {
        setProcessingText('Verifying payment signature with Razorpay Secure API...');
        setStep('processing');
        
        try {
          const verifyRes = await fetch('/api/razorpay/verify-payment', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              order: {
                id: generatedOrderId,
                date: new Date().toLocaleDateString('en-IN'),
                items: [...cart],
                subtotal: subtotal,
                couponDiscount: couponDiscount,
                bankDiscount: bankDiscount,
                total: currentPayable,
                customer: shippingForm,
                paymentMethod: `RAZORPAY (${paymentMethod.toUpperCase()})`
              }
            })
          });
          
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            setOrderId(generatedOrderId);
            setReceipt({
              subtotal: subtotal,
              couponDiscount: couponDiscount,
              bankDiscount: bankDiscount,
              total: currentPayable,
              items: [...cart],
              bankName: paymentMethod.toUpperCase()
            });
            setStep('success');
            clearCart();
          } else {
            alert(`Signature verification failed: ${verifyData.message}`);
            setStep('payment');
          }
        } catch (err) {
          console.error("Signature verification error:", err);
          alert(`Verification Error: ${err.message}`);
          setStep('payment');
        }
      },
      prefill: {
        name: shippingForm.name,
        email: shippingForm.email || 'customer@jaishreeshyam.com',
        contact: shippingForm.phone
      },
      notes: {
        address: shippingForm.address,
        pincode: shippingForm.pincode
      },
      theme: {
        color: "#6366f1"
      },
      modal: {
        ondismiss: function () {
          setStep('payment');
        }
      }
    };
    
    setStep('payment');
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  // Stripe Elements Payment submit handler
  const handleStripePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!cardForm.number || !cardForm.expiry || !cardForm.cvv || !cardForm.name) {
      alert("Please complete the card details.");
      return;
    }
    if (cardForm.number.replace(/\s+/g, '').length < 16) {
      alert("Please enter a valid 16-digit card number.");
      return;
    }
    if (!zipCode || zipCode.length < 6) {
      alert("Please enter a valid 6-digit PIN/ZIP code.");
      return;
    }

    // Capture receipt details prior to cart/Stripe logic
    setReceipt({
      subtotal: subtotal,
      couponDiscount: couponDiscount,
      bankDiscount: bankDiscount,
      total: currentPayable,
      items: [...cart],
      bankName: checkoutBank
    });

    if (STRIPE_CONFIG.USE_REAL_STRIPE) {
      // Real Stripe Checkout Redirect
      setProcessingText('Redirecting to secure Stripe payment portal...');
      setStep('processing');
      try {
        const stripe = await loadStripe(STRIPE_CONFIG.PUBLISHABLE_KEY || 'pk_test_dummy');
        if (!stripe) {
          throw new Error("Stripe SDK failed to load. Check VITE_STRIPE_PUBLISHABLE_KEY.");
        }
        
        const lineItems = cart.map(item => {
          const stripePriceId = STRIPE_CONFIG.PRICE_IDS[item.product.id];
          return {
            price: stripePriceId || 'price_dummy',
            quantity: item.quantity
          };
        });

        const { error } = await stripe.redirectToCheckout({
          lineItems,
          mode: 'payment',
          successUrl: `${window.location.origin}/`,
          cancelUrl: `${window.location.origin}/`,
        });

        if (error) throw error;
      } catch (err) {
        console.error("Stripe Redirect Error:", err);
        alert(`Stripe Error: ${err.message}`);
        setStep('payment');
      }
    } else {
      // Simulated Stripe Elements Sandbox verification
      setProcessingText('Verifying card details with Stripe Sandbox API...');
      setStep('processing');
      
      // Verification wait -> trigger OTP Secure page
      setTimeout(() => {
        setOtpCode('');
        setOtpError('');
        setStep('otp');
      }, 1800);
    }
  };

  // Simulated OTP verification submit handler
  const handleOTPSubmit = (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a valid 6-digit verification code.');
      return;
    }
    if (otpCode !== '123456') {
      setOtpError('Incorrect verification code. For simulation, please use 123456.');
      return;
    }

    setOtpError('');
    setProcessingText('Authorizing charge & securing bank settlement...');
    setStep('processing');

    // Final order processing simulation
    setTimeout(() => {
      const generatedId = `JSS-ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedId);
      
      const newOrder = {
        id: generatedId,
        date: new Date().toLocaleDateString('en-IN'),
        items: [...receipt.items],
        subtotal: receipt.subtotal,
        couponDiscount: receipt.couponDiscount,
        bankDiscount: receipt.bankDiscount,
        total: receipt.total,
        customer: shippingForm,
        paymentMethod: `STRIPE CARD (${cardType.toUpperCase()}${receipt.bankName ? ` - ${receipt.bankName} PROMO` : ''})`
      };
      
      addOrder(newOrder);
      setStep('success');
      clearCart();
    }, 1800);
  };

  const renderCardBrandIcon = () => {
    if (cardType === 'Visa') {
      return (
        <svg viewBox="0 0 48 48" width="28" height="28" style={{ display: 'block' }}>
          <path fill="#1E308F" d="M0 0h48v48H0z" rx="4"/>
          <path fill="#FFF" d="M12 28.5L9.6 15h-3l-.2 1.4c-.4 2.5-2.2 4.4-4.5 5.5l-.2.1v.5h7.3c.7 0 1.3-.4 1.5-1.1L12.5 15h3.2l-2.4 13.5H12zm11.3 0l1.5-8.4.8-4.1h2.9L26 28.5h-2.7zm11.4-12.8c-1.1-.5-2.8-.7-4.1-.7-3.9 0-6.6 2.1-6.6 5 0 2.2 2 3.4 3.5 4.1 1.5.7 2 1.2 2 1.9 0 1-.7 1.5-2.4 1.5-2 0-3.1-.9-3.9-1.4l-.6-.4-.6 3.6c.9.4 2.7.8 4.5.8 4.1 0 6.8-2 6.8-5.1 0-1.7-1-3-3.3-4.1-1.4-.7-2.2-1.2-2.2-1.9 0-.7.7-1.3 2.1-1.3 1.6-.1 2.8.4 3.6.8l.4.2.8-3.4zm10.7.3l-2.2 12.5H41l-2.5-10.4-1.2 8-1.5-7.7h4c.7 0 1.3.4 1.5 1.1l1.5 6.4 1.6-7.5H45.4z"/>
        </svg>
      );
    }
    if (cardType === 'Mastercard') {
      return (
        <svg viewBox="0 0 48 48" width="28" height="28" style={{ display: 'block' }}>
          <path fill="#0F172A" d="M0 0h48v48H0z" rx="4"/>
          <circle cx="18" cy="24" r="10" fill="#EB001B"/>
          <circle cx="30" cy="24" r="10" fill="#F79E1B" fillOpacity="0.8"/>
        </svg>
      );
    }
    if (cardType === 'Amex') {
      return (
        <svg viewBox="0 0 48 48" width="28" height="28" style={{ display: 'block' }}>
          <path fill="#016FD0" d="M0 0h48v48H0z" rx="4"/>
          <path fill="#FFF" d="M9.5 29.5l.8-2h3.9l.8 2h2.5L14 17h-2.5L8 29.5h1.5zm2.7-7l1.1 2.8H11l1.2-2.8zm11 7l.8-2h3.9l.8 2h2.5L25 17h-2.5L19 29.5h1.5zm2.7-7l1.1 2.8H22.5l1.2-2.8zm11.3 7V17h-2.2v5h-2.6V17H30v12.5h2.2v-5.2h2.6v5.2h2.2z"/>
        </svg>
      );
    }
    if (cardType === 'RuPay') {
      return (
        <svg viewBox="0 0 48 48" width="28" height="28" style={{ display: 'block' }}>
          <path fill="#0F172A" d="M0 0h48v48H0z" rx="4"/>
          <path fill="#00A2E8" d="M28.3 14H16v20h5V24h7.3c4 0 7.2-2.2 7.2-6.5S32.3 14 28.3 14zM21 20v-3h7.3c1.7 0 2.9.8 2.9 2.1s-1.2 2.1-2.9 2.1H21z" />
          <path fill="#F26522" d="M37 20l2-2.5-3.5-3.5L32 17.5z" />
        </svg>
      );
    }
    return <CreditCard size={18} style={{ color: 'var(--text-muted)' }} />;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content glass-panel animate-fade-in" style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-lg)', color: 'var(--text-primary)', maxWidth: '540px', width: '90%' }}>
        
        {/* Header (Hide in success step) */}
        {step !== 'success' && step !== 'processing' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard style={{ color: 'var(--accent-primary)' }} />
              Secure Checkout
            </h2>
            <button className="btn-icon" onClick={onClose} style={{ marginLeft: 'auto', width: '32px', height: '32px' }}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Wizard Step Labels */}
        {step !== 'success' && step !== 'processing' && (
          <div className="wizard-steps">
            <div className={`wizard-step ${step === 'shipping' ? 'active' : ''} ${step === 'payment' ? 'completed' : ''}`}>
              <div className="wizard-step-node">1</div>
              <span className="wizard-step-label">Shipping</span>
            </div>
            <div className={`wizard-step ${step === 'payment' ? 'active' : ''}`}>
              <div className="wizard-step-node">2</div>
              <span className="wizard-step-label">Payment Gateway</span>
            </div>
          </div>
        )}

        {/* --- STEP 1: Shipping Details --- */}
        {step === 'shipping' && (
          <form onSubmit={submitShipping} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Name *</label>
                <input
                  type="text"
                  name="name"
                  required
                  placeholder="e.g. Rajesh Kumar"
                  value={shippingForm.name}
                  onChange={handleShippingChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Phone Number *</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  placeholder="e.g. 9876543210"
                  value={shippingForm.phone}
                  onChange={handleShippingChange}
                />
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Email Address</label>
              <input
                type="email"
                name="email"
                placeholder="e.g. rajesh@gmail.com"
                value={shippingForm.email}
                onChange={handleShippingChange}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Full Delivery Address *</label>
              <textarea
                name="address"
                required
                rows={3}
                placeholder="Flat No, Street, Landmark, Area..."
                value={shippingForm.address}
                onChange={handleShippingChange}
                style={{ resize: 'none' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  required
                  placeholder="e.g. 110005"
                  value={shippingForm.pincode}
                  onChange={handleShippingChange}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>City & State</label>
                <input
                  type="text"
                  readOnly
                  value="New Delhi, Delhi"
                  style={{ background: 'var(--bg-primary)', opacity: 0.7 }}
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '20px', marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Total Payable Amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  ₹{currentPayable.toLocaleString('en-IN')}
                </div>
              </div>
              
              <button type="submit" className="btn btn-primary" style={{ marginLeft: 'auto' }}>
                Proceed to Payment <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {/* --- STEP 2: Payment Selection & Forms --- */}
        {step === 'payment' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Payment Method Selector Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
              <button
                className={`btn ${paymentMethod === 'upi' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setPaymentMethod('upi'); setCheckoutBank(''); }}
                style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}
              >
                <Smartphone size={16} />
                <span>UPI QR</span>
              </button>
              <button
                className={`btn ${paymentMethod === 'card' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setPaymentMethod('card')}
                style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}
              >
                <CreditCard size={16} />
                <span>Card</span>
              </button>
              <button
                className={`btn ${paymentMethod === 'netbanking' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setPaymentMethod('netbanking'); setCheckoutBank(''); }}
                style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}
              >
                <Landmark size={16} />
                <span>Net Banking</span>
              </button>
              <button
                className={`btn ${paymentMethod === 'cod' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => { setPaymentMethod('cod'); setCheckoutBank(''); }}
                style={{ padding: '12px 6px', flexDirection: 'column', gap: '6px', fontSize: '0.75rem' }}
              >
                <HandCoins size={16} />
                <span>COD</span>
              </button>
            </div>

            {/* Simulated or Real UPI Method */}
            {paymentMethod === 'upi' && (
              RAZORPAY_CONFIG.USE_REAL_RAZORPAY ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-panel" style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      fontSize: '1.5rem'
                    }}>
                      ⚡
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                        Pay via UPI
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>
                        Pay instantly using Google Pay, PhonePe, Paytm, or any UPI ID securely via Razorpay checkout.
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleRazorpayCheckout} style={{ width: '100%', maxWidth: '280px', padding: '12px', fontSize: '0.95rem' }}>
                      Proceed to Pay ₹{currentPayable.toLocaleString('en-IN')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>🔒 SECURE CHECKOUT</span>
                      <span>•</span>
                      <span>RAZORPAY SECURE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <h3 style={{ fontSize: '1.05rem', marginBottom: '8px' }}>Scan with UPI App</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Open Google Pay, PhonePe, or Paytm and scan the QR code to complete the simulated checkout.
                  </p>
                  
                  <div className="upi-qr-card animate-fade-in" style={{ margin: '0 auto 16px auto' }}>
                    <div className="upi-qr-box">
                      <div className="qr-corner-tl"></div>
                      <div className="qr-corner-tr"></div>
                      <div className="qr-corner-bl"></div>
                      {/* Simulated QR Code dots */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)' }}>
                        {[...Array(25)].map((_, i) => (
                          <div key={i} className="qr-dot" style={{ opacity: Math.random() > 0.4 ? 1 : 0.1 }}></div>
                        ))}
                      </div>
                    </div>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.05em' }}>BHIM UPI GATEWAY</span>
                    <div style={{ fontSize: '1.1rem', fontWeight: 'bold', marginTop: '6px' }}>
                      ₹{currentPayable.toLocaleString('en-IN')}
                    </div>
                  </div>

                  <button className="btn btn-gold" onClick={triggerPaymentSimulation} style={{ width: '100%', maxWidth: '280px' }}>
                    Simulate QR Payment Success
                  </button>
                </div>
              )
            )}

            {/* Simulated or Real Card Method */}
            {paymentMethod === 'card' && (
              RAZORPAY_CONFIG.USE_REAL_RAZORPAY ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-panel" style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      fontSize: '1.5rem'
                    }}>
                      💳
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                        Pay via Credit / Debit Card
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>
                        Pay securely using Visa, MasterCard, RuPay, Maestro, Diners Club, or American Express cards via Razorpay.
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleRazorpayCheckout} style={{ width: '100%', maxWidth: '280px', padding: '12px', fontSize: '0.95rem' }}>
                      Proceed to Pay ₹{currentPayable.toLocaleString('en-IN')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>🔒 SECURE CHECKOUT</span>
                      <span>•</span>
                      <span>RAZORPAY SECURE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in">
                  {/* Interactive Card Visual */}
                  <div className="payment-card-visual" style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ fontSize: '0.75rem', letterSpacing: '0.1em', fontWeight: 800 }}>
                        {checkoutBank ? `${checkoutBank} PREFERRED CARD` : 'JAI SHREE SHYAM BANK'}
                      </div>
                      <span style={{ fontSize: '1.2rem' }}>💳</span>
                    </div>
                    <div style={{ fontSize: '1.2rem', letterSpacing: '0.15em', fontFamily: 'monospace', margin: '14px 0' }}>
                      {cardForm.number || '•••• •••• •••• ••••'}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '0.55rem', opacity: 0.6, textTransform: 'uppercase' }}>Card Holder</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 550, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          {cardForm.name || 'YOUR FULL NAME'}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.55rem', opacity: 0.6, textTransform: 'uppercase' }}>Expires</div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 550 }}>
                          {cardForm.expiry || 'MM/YY'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bank Partner selection */}
                  <div style={{ marginBottom: '16px' }}>
                    <label style={{ display: 'block', fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 650 }}>
                      CHOOSE BANK CASHBACK INCENTIVE:
                    </label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px' }}>
                      {bankOffers.map(offer => (
                        <button
                          key={offer.id}
                          type="button"
                          onClick={() => setCheckoutBank(prev => prev === offer.id ? '' : offer.id)}
                          style={{
                            padding: '6px',
                            borderRadius: '6px',
                            background: checkoutBank === offer.id ? 'rgba(99,102,241,0.15)' : 'var(--bg-tertiary)',
                            border: checkoutBank === offer.id ? '1px solid var(--accent-primary)' : '1px solid var(--border-color)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            color: checkoutBank === offer.id ? 'white' : 'var(--text-secondary)',
                            textAlign: 'center'
                          }}
                        >
                          {offer.id} Deal
                        </button>
                      ))}
                    </div>
                    {checkoutBank && (() => {
                      const selectedOffer = bankOffers.find(o => o.id === checkoutBank);
                      if (!selectedOffer) return null;
                      const calculatedAmt = selectedOffer.type === 'percent' 
                        ? Math.min(Math.round(subtotal * (selectedOffer.value / 100)), selectedOffer.maxDiscount || Infinity)
                        : selectedOffer.value;
                      return (
                        <div style={{ fontSize: '0.7rem', color: 'var(--accent-success)', marginTop: '6px', fontWeight: 550 }}>
                          ⚡ Applied {selectedOffer.bank}: {selectedOffer.desc} (Deducted ₹{calculatedAmt.toLocaleString('en-IN')}!)
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stripe Elements unified container */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Cardholder Name</label>
                      <input
                        type="text"
                        name="name"
                        placeholder="e.g. RAJESH KUMAR"
                        value={cardForm.name}
                        onChange={handleCardChange}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Card Information</label>
                      <div className="stripe-element-container">
                        <div className="stripe-element-row">
                          <input
                            className="stripe-element-input"
                            style={{ flex: 1 }}
                            type="text"
                            name="number"
                            placeholder="Card number"
                            value={cardForm.number}
                            onChange={handleCardChange}
                            required
                          />
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', paddingLeft: '8px', borderLeft: '1px solid var(--border-color)', height: '20px' }}>
                            {renderCardBrandIcon()}
                          </div>
                        </div>
                        
                        <div className="stripe-element-divider"></div>
                        
                        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)' }}>
                          <div className="stripe-element-row" style={{ flex: 1, borderRight: '1px solid var(--border-color)' }}>
                            <input
                              className="stripe-element-input"
                              style={{ width: '100%' }}
                              type="text"
                              name="expiry"
                              placeholder="MM / YY"
                              value={cardForm.expiry}
                              onChange={handleCardChange}
                              required
                            />
                          </div>
                          <div className="stripe-element-row" style={{ flex: 1 }}>
                            <input
                              className="stripe-element-input"
                              style={{ width: '100%' }}
                              type="password"
                              name="cvv"
                              placeholder="CVC"
                              value={cardForm.cvv}
                              onChange={handleCardChange}
                              required
                            />
                          </div>
                        </div>

                        <div style={{ display: 'flex' }}>
                          <div className="stripe-element-row" style={{ flex: 1.5, borderRight: '1px solid var(--border-color)' }}>
                            <select
                              className="stripe-element-input"
                              style={{ width: '100%', cursor: 'pointer', paddingRight: '12px' }}
                              value={country}
                              onChange={(e) => setCountry(e.target.value)}
                            >
                              <option value="India">India</option>
                              <option value="United States">United States</option>
                              <option value="United Kingdom">United Kingdom</option>
                              <option value="Canada">Canada</option>
                              <option value="Australia">Australia</option>
                            </select>
                          </div>
                          <div className="stripe-element-row" style={{ flex: 1 }}>
                            <input
                              className="stripe-element-input"
                              style={{ width: '100%' }}
                              type="text"
                              name="zipCode"
                              placeholder="PIN / ZIP"
                              value={zipCode}
                              onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="stripe-secured-by">
                        <svg viewBox="0 0 35 15" width="28" height="12" style={{ fill: 'currentColor' }}>
                          <path d="M12.9 5.8c0-1.2-.9-1.8-2.3-1.8-1.5 0-2.9.5-3.8 1l.5 2.1c.9-.5 1.9-.8 2.7-.8.7 0 1 .2 1 .6 0 .9-2.7.7-2.7 2.6 0 1.2 1 1.9 2.3 1.9 1.1 0 2-.4 2.6-.9l.1.7h2v-5.4zm-2.4 3.7c-.5 0-.9-.2-.9-.6 0-.6 1.1-.6 1.7-.5 0 .6-.3 1.1-.8 1.1zM20.2 5.6c-.6-.2-1.3-.3-1.9-.3-1.7 0-2.8.9-2.8 2.5v2.8h2.3v-2.7c0-.7.4-1 1-1 .3 0 .5 0 .7.1l.7-1.4zm2.1-.2h2.3v5.2h-2.3zm0-3.3h2.3v2.2h-2.3zm8.3 6c0-1.4-.9-2.3-2.3-2.3-1.4 0-2.5 1-2.5 2.3 0 1.4.9 2.3 2.3 2.3.6 0 1.1-.1 1.5-.3l-.1-1.4c-.4.2-.8.3-1.1.3-.6 0-1-.3-1-.9h4.7c0-.2.5-1.7 0-2.7zm-2.4-.6c0-.5.3-.8.7-.8.4 0 .7.3.7.8h-1.4zM3.4 5.8C3.4 4.6 2.5 4 1.1 4c-.9 0-1.8.3-2.4.6l.4 1.3c.6-.3 1.3-.5 1.8-.5.5 0 .8.2.8.5 0 .7-1.8.5-1.8 1.8 0 .8.6 1.3 1.5 1.3.8 0 1.4-.3 1.8-.6l.1.5h1.3V5.8zm-1.6 2.5c-.3 0-.6-.1-.6-.4 0-.4.7-.4 1.1-.3 0 .4-.2.7-.5.7zm4.2-3.1h1.1v-1.9h1.4v1.9h1.1v1.1h-1.1v2.5c0 .3.1.4.4.4.2 0 .4 0 .5-.1v1c-.3.1-.7.1-1.1.1-1 0-1.2-.5-1.2-1.3v-2.6H6v-1.1z" />
                        </svg>
                        <span>Secured by Stripe</span>
                      </div>
                    </div>

                    <button className="btn btn-primary" onClick={handleStripePaymentSubmit} style={{ width: '100%', marginTop: '10px' }}>
                      Pay ₹{currentPayable.toLocaleString('en-IN')}
                    </button>
                  </div>
                </div>
              )
            )}

            {/* Simulated or Real Net Banking Method */}
            {paymentMethod === 'netbanking' && (
              RAZORPAY_CONFIG.USE_REAL_RAZORPAY ? (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="glass-panel" style={{
                    background: 'rgba(99, 102, 241, 0.05)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    padding: '24px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '16px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'rgba(99, 102, 241, 0.15)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--accent-primary)',
                      fontSize: '1.5rem'
                    }}>
                      🏦
                    </div>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px', color: 'white' }}>
                        Pay via Net Banking
                      </h4>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>
                        Log in securely to your bank account (SBI, HDFC, ICICI, Axis, etc.) to complete payment via Razorpay.
                      </p>
                    </div>
                    <button className="btn btn-primary" onClick={handleRazorpayCheckout} style={{ width: '100%', maxWidth: '280px', padding: '12px', fontSize: '0.95rem' }}>
                      Proceed to Pay ₹{currentPayable.toLocaleString('en-IN')}
                    </button>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>🔒 SECURE CHECKOUT</span>
                      <span>•</span>
                      <span>RAZORPAY SECURE</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <h3 style={{ fontSize: '1.05rem' }}>Select Bank</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {['State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank'].map(bank => (
                      <button key={bank} className="btn btn-secondary" onClick={triggerPaymentSimulation} style={{ fontSize: '0.85rem', padding: '12px' }}>
                        🏦 {bank}
                      </button>
                    ))}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                    Selecting a bank will redirect to a simulated login portal and complete the payment successfully.
                  </p>
                </div>
              )
            )}

            {/* Cash on Delivery / Shop Pickup */}
            {paymentMethod === 'cod' && (
              <div className="animate-fade-in" style={{ textAlign: 'center', padding: '16px' }}>
                <div style={{ fontSize: '3rem', marginBottom: '12px' }}>📦</div>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '8px' }}>Cash on Delivery / Showroom Pickup</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: '1.5' }}>
                  Pay cash at delivery, or pay by Card/UPI directly when picking up your order from our Milap Nagar showroom. No advance payment needed!
                </p>
                <button className="btn btn-primary" onClick={triggerPaymentSimulation} style={{ width: '100%', maxWidth: '280px' }}>
                  Confirm Order (COD)
                </button>
              </div>
            )}

            {/* Cancel/Back buttons */}
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
              <button className="btn btn-secondary" onClick={() => setStep('shipping')} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Back to Address
              </button>
              <button className="btn btn-secondary" onClick={onClose} style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
                Cancel Purchase
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 3: Processing Simulation --- */}
        {step === 'processing' && (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              border: '4px solid var(--border-color)',
              borderTopColor: 'var(--accent-primary)',
              borderRadius: '50%',
              margin: '0 auto 24px auto',
              animation: 'spin 1s linear infinite'
            }}></div>
            <style>{`
              @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Processing Payment...</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '320px', margin: '0 auto' }}>
              {processingText}
            </p>
          </div>
        )}

        {/* --- STEP 5: 3D Secure OTP Verification Portal --- */}
        {step === 'otp' && (
          <div className="animate-fade-in" style={{ padding: '8px 0' }}>
            {/* Visa/Mastercard Secure Logo Banner */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid var(--border-color)', paddingBottom: '12px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '1.25rem' }}>🔒</span>
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.05em', color: 'var(--text-primary)' }}>3D SECURE GATEWAY</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>SECURE BANK AUTHENTICATION</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                {cardType === 'Visa' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#6366f1', background: 'var(--bg-primary)' }}>Verified by VISA</span>
                )}
                {cardType === 'Mastercard' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#6366f1', background: 'var(--bg-primary)' }}>Mastercard Identity Check</span>
                )}
                {cardType === 'Amex' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#6366f1', background: 'var(--bg-primary)' }}>SafeKey</span>
                )}
                {cardType === 'RuPay' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#6366f1', background: 'var(--bg-primary)' }}>RuPay PaySecure</span>
                )}
                {cardType === 'Unknown' && (
                  <span style={{ fontSize: '0.7rem', fontWeight: 800, padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', color: '#6366f1', background: 'var(--bg-primary)' }}>3D Secure Check</span>
                )}
              </div>
            </div>

            {/* Merchant and Amount Info Panel */}
            <div className="glass-panel" style={{ background: 'var(--bg-primary)', padding: '16px', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                <div style={{ color: 'var(--text-secondary)' }}>Merchant:</div>
                <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Jai Shree Shyam Traders</div>

                <div style={{ color: 'var(--text-secondary)' }}>Amount:</div>
                <div style={{ fontWeight: 700, color: 'var(--accent-success)' }}>₹{receipt.total.toLocaleString('en-IN')}</div>

                <div style={{ color: 'var(--text-secondary)' }}>Card details:</div>
                <div style={{ fontFamily: 'monospace', fontWeight: 600 }}>{cardType} •••• {cardForm.number.replace(/\s+/g, '').slice(-4)}</div>
              </div>
            </div>

            {/* OTP Input Form */}
            <form onSubmit={handleOTPSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', textAlign: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Enter the One-Time Password (OTP)
                </label>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', maxWidth: '320px', lineHeight: '1.4' }}>
                  A verification code has been sent to the mobile number registered with your card.
                </p>
              </div>

              <div style={{ maxWidth: '240px', margin: '0 auto', width: '100%' }}>
                <input
                  type="text"
                  placeholder="------"
                  value={otpCode}
                  onChange={(e) => {
                    setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6));
                    setOtpError('');
                  }}
                  style={{
                    letterSpacing: '0.6em',
                    textAlign: 'center',
                    fontSize: '1.4rem',
                    fontFamily: 'monospace',
                    fontWeight: 700,
                    padding: '12px',
                    width: '100%',
                    borderRadius: '8px'
                  }}
                  required
                />
                
                {/* OTP Simulation Instruction */}
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '8px', fontStyle: 'italic' }}>
                  For simulation testing, please use OTP: <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>123456</span>
                </div>
              </div>

              {otpError && (
                <div style={{ color: 'var(--accent-danger)', fontSize: '0.8rem', fontWeight: 550 }}>
                  ⚠️ {otpError}
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                  Submit Code
                </button>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem' }}
                    onClick={() => {
                      setOtpCode('');
                      setOtpError('');
                      alert("A new simulated OTP code has been re-sent to your phone number.");
                    }}
                  >
                    Resend Code
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '8px', fontSize: '0.75rem', color: 'var(--accent-danger)' }}
                    onClick={() => {
                      setStep('payment');
                    }}
                  >
                    Cancel Payment
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* --- STEP 4: Success Receipt Screen --- */}
        {step === 'success' && (
          <div className="animate-fade-in" style={{ textAlign: 'center' }}>
            <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'rgba(16,185,129,0.1)', color: 'var(--accent-success)', marginBottom: '16px' }}>
              <CheckCircle size={48} />
            </div>
            
            <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '6px' }}>Order Placed Successfully!</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '20px' }}>
              Thank you for shopping at Jai Shree Shyam Traders. Your transaction has been approved.
            </p>

            {/* Receipt Summary Box */}
            <div className="glass-panel" style={{ background: 'var(--bg-primary)', padding: '20px', textAlign: 'left', marginBottom: '24px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Order ID:</span>
                <span style={{ fontWeight: 'bold', fontFamily: 'monospace' }}>{orderId}</span>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Payment Mode:</span>
                <span style={{ fontWeight: 600 }}>
                  {paymentMethod.toUpperCase()}{receipt.bankName ? ` (${receipt.bankName} CARD)` : ''}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Subtotal Amount:</span>
                <span style={{ fontWeight: 550 }}>₹{receipt.subtotal.toLocaleString('en-IN')}</span>
              </div>

              {receipt.couponDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--accent-success)' }}>
                  <span>Promo Discount:</span>
                  <span>- ₹{receipt.couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {receipt.bankDiscount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px', color: 'var(--accent-success)' }}>
                  <span>{receipt.bankName} Cashback:</span>
                  <span>- ₹{receipt.bankDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '8px' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Deliver to:</span>
                <span style={{ textAlign: 'right', fontWeight: 500 }}>
                  {shippingForm.name} <br />
                  {shippingForm.address}, Pincode - {shippingForm.pincode}
                </span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '8px', fontWeight: 'bold' }}>
                <span>Paid Net Amount:</span>
                <span style={{ color: 'var(--accent-success)', fontFamily: 'var(--font-display)', fontSize: '1.15rem' }}>
                  ₹{receipt.total.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="btn btn-secondary" onClick={() => window.print()} style={{ flex: 1 }}>
                <Printer size={16} /> Print Receipt
              </button>
              <button className="btn btn-primary" onClick={onClose} style={{ flex: 1 }}>
                Continue Shopping
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
