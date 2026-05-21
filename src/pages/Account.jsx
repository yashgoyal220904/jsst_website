import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { 
  User, Mail, Phone, MapPin, Lock, ShoppingBag, 
  LogOut, CheckCircle, Clock, Truck, Package, Shield, 
  ArrowRight, KeyRound, AlertCircle, ShoppingCart
} from 'lucide-react';

export default function Account() {
  const { 
    currentUser, 
    orders, 
    registerCustomer, 
    loginCustomer, 
    logoutCustomer, 
    updateCustomerProfile,
    navigateTo 
  } = useShop();

  // Tab Control for Login vs Signup when guest
  const [authTab, setAuthTab] = useState('login');

  // Login Form State
  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Signup Form State
  const [signupForm, setSignupForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    address: '',
    pincode: ''
  });
  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Profile Form State (used when logged in)
  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    pincode: currentUser?.pincode || ''
  });
  const [profileSuccess, setProfileSuccess] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Initialize/sync profile form when currentUser is loaded
  React.useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        phone: currentUser.phone || '',
        address: currentUser.address || '',
        pincode: currentUser.pincode || ''
      });
    }
  }, [currentUser]);

  // Filter orders matching logged-in customer's email
  const customerOrders = currentUser 
    ? orders.filter(o => o.customerEmail?.toLowerCase() === currentUser.email?.toLowerCase())
    : [];

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginForm.email || !loginForm.password) {
      setLoginError('Please fill out all fields.');
      return;
    }
    setLoginError('');
    setLoginLoading(true);
    const res = await loginCustomer(loginForm.email, loginForm.password);
    setLoginLoading(false);
    if (!res.success) {
      setLoginError(res.msg);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!signupForm.name || !signupForm.email || !signupForm.phone || !signupForm.password) {
      setSignupError('All fields marked * are required.');
      return;
    }
    if (signupForm.password !== signupForm.confirmPassword) {
      setSignupError('Passwords do not match.');
      return;
    }
    if (signupForm.phone.length < 10) {
      setSignupError('Please enter a valid phone number.');
      return;
    }
    setSignupError('');
    setSignupLoading(true);
    const res = await registerCustomer(
      signupForm.name,
      signupForm.email,
      signupForm.phone,
      signupForm.password,
      signupForm.address,
      signupForm.pincode
    );
    setSignupLoading(false);
    if (!res.success) {
      setSignupError(res.msg);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!profileForm.name || !profileForm.phone) {
      setProfileError('Name and Phone fields are required.');
      return;
    }
    setProfileError('');
    setProfileSuccess('');
    setProfileLoading(true);
    const res = await updateCustomerProfile(profileForm);
    setProfileLoading(false);
    if (res.success) {
      setProfileSuccess('Profile details updated successfully!');
      setTimeout(() => setProfileSuccess(''), 4000);
    } else {
      setProfileError(res.msg);
    }
  };

  const getStatusStepIndex = (status) => {
    const s = status?.toLowerCase() || 'placed';
    if (s === 'placed' || s === 'ordered') return 0;
    if (s === 'processing') return 1;
    if (s === 'dispatched' || s === 'shipped') return 2;
    if (s === 'delivered') return 3;
    return 0; // Default to placed
  };

  const renderStatusStepper = (status) => {
    const currentIndex = getStatusStepIndex(status);
    const steps = [
      { label: 'Order Placed', desc: 'Awaiting dispatch', icon: Clock },
      { label: 'Processing', desc: 'Packing your item', icon: Package },
      { label: 'Dispatched', desc: 'In transit', icon: Truck },
      { label: 'Delivered', desc: 'Successfully received', icon: CheckCircle }
    ];

    return (
      <div style={{ marginTop: '20px', marginBottom: '10px' }}>
        {/* Progress Line and Circles */}
        <div style={{ position: 'relative', display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 24px' }}>
          {/* Background grey tracking line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            height: '4px',
            backgroundColor: 'var(--bg-tertiary)',
            transform: 'translateY(-50%)',
            zIndex: 1
          }} />

          {/* Active blue progress line */}
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: `${(currentIndex / 3) * 100}%`,
            height: '4px',
            backgroundColor: 'var(--accent-primary)',
            transform: 'translateY(-50%)',
            zIndex: 2,
            transition: 'width 0.4s ease-in-out',
            boxShadow: '0 0 10px rgba(99, 102, 241, 0.5)'
          }} />

          {steps.map((step, idx) => {
            const StepIcon = step.icon;
            const isCompleted = idx < currentIndex;
            const isActive = idx === currentIndex;
            const isPending = idx > currentIndex;

            return (
              <div 
                key={idx}
                style={{
                  position: 'relative',
                  zIndex: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  backgroundColor: isCompleted || isActive ? 'var(--bg-primary)' : 'var(--bg-secondary)',
                  border: `2px solid ${isCompleted || isActive ? 'var(--accent-primary)' : 'var(--border-color)'}`,
                  boxShadow: isActive ? '0 0 12px var(--accent-primary)' : 'none',
                  color: isCompleted || isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                  transition: 'all 0.3s ease'
                }}
              >
                <StepIcon size={16} />
              </div>
            );
          })}
        </div>

        {/* Stepper Labels */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px' }}>
          {steps.map((step, idx) => {
            const isActive = idx === currentIndex;
            const isCompleted = idx <= currentIndex;
            return (
              <div key={idx} style={{ textAlign: 'center', width: '23%', padding: '0 4px' }}>
                <div style={{ 
                  fontSize: '0.75rem', 
                  fontWeight: isActive ? 700 : 500, 
                  color: isActive ? 'var(--text-primary)' : (isCompleted ? 'var(--text-secondary)' : 'var(--text-muted)'),
                  transition: 'color 0.3s ease'
                }}>
                  {step.label}
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {step.desc}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="container animate-fade-in" style={{ paddingBottom: '80px', paddingTop: '40px' }}>
      {!currentUser ? (
        /* ================= GUEST - AUTH PORTAL (LOGIN / REGISTER) ================= */
        <div style={{ maxWidth: '480px', margin: '0 auto' }}>
          <div className="glass-panel" style={{ padding: '36px', position: 'relative', overflow: 'hidden' }}>
            {/* Glowing ambient background filter element */}
            <div style={{
              position: 'absolute',
              top: '-10%',
              left: '-10%',
              width: '120%',
              height: '30%',
              background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.12) 0%, rgba(0, 0, 0, 0) 70%)',
              pointerEvents: 'none'
            }} />

            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ display: 'inline-flex', padding: '12px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '16px', border: '1px solid var(--border-color)' }}>
                <User size={32} style={{ color: 'var(--accent-primary)' }} />
              </div>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '6px' }}>Customer Center</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Access order history, tracking details & account updates</p>
            </div>

            {/* Auth Tab Switcher */}
            <div style={{ display: 'flex', borderRadius: '8px', background: 'var(--bg-secondary)', padding: '4px', marginBottom: '24px', border: '1px solid var(--border-color)' }}>
              <button 
                onClick={() => { setAuthTab('login'); setLoginError(''); setSignupError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: authTab === 'login' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: authTab === 'login' ? 'var(--bg-tertiary)' : 'transparent',
                  border: authTab === 'login' ? '1px solid var(--border-color)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Sign In
              </button>
              <button 
                onClick={() => { setAuthTab('signup'); setLoginError(''); setSignupError(''); }}
                style={{
                  flex: 1,
                  padding: '10px 0',
                  textAlign: 'center',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: 600,
                  color: authTab === 'signup' ? 'var(--text-primary)' : 'var(--text-secondary)',
                  background: authTab === 'signup' ? 'var(--bg-tertiary)' : 'transparent',
                  border: authTab === 'signup' ? '1px solid var(--border-color)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                Create Account
              </button>
            </div>

            {/* LOGIN FORM */}
            {authTab === 'login' && (
              <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {loginError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{loginError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      placeholder="e.g. test@example.com"
                      value={loginForm.email}
                      onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="password" 
                      placeholder="Enter password"
                      value={loginForm.password}
                      onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required 
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={loginLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: 600, marginTop: '8px' }}
                >
                  {loginLoading ? 'Signing In...' : 'Sign In'} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              </form>
            )}

            {/* REGISTRATION FORM */}
            {authTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {signupError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{signupError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name *</label>
                  <div style={{ position: 'relative' }}>
                    <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. Hemant Kumar"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Email Address *</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="email" 
                      placeholder="e.g. hemant@example.com"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number *</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="tel" 
                      placeholder="e.g. 9876543210"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                      required 
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Password *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        placeholder="Password"
                        value={signupForm.password}
                        onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                        style={{ width: '100%', paddingLeft: '38px' }}
                        required 
                      />
                    </div>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Confirm *</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                      <input 
                        type="password" 
                        placeholder="Confirm"
                        value={signupForm.confirmPassword}
                        onChange={(e) => setSignupForm({ ...signupForm, confirmPassword: e.target.value })}
                        style={{ width: '100%', paddingLeft: '38px' }}
                        required 
                      />
                    </div>
                  </div>
                </div>

                <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Default Address</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-muted)' }} />
                    <textarea 
                      placeholder="e.g. F22 Milap Nagar, Uttam Nagar East"
                      value={signupForm.address}
                      onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px', minHeight: '60px', resize: 'vertical' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pincode</label>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(Optional)</span>
                  </div>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      placeholder="e.g. 110059"
                      value={signupForm.pincode}
                      onChange={(e) => setSignupForm({ ...signupForm, pincode: e.target.value })}
                      style={{ width: '100%', paddingLeft: '38px' }}
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={signupLoading}
                  style={{ width: '100%', justifyContent: 'center', padding: '12px', fontWeight: 600, marginTop: '8px' }}
                >
                  {signupLoading ? 'Creating Account...' : 'Register & Log In'} <ArrowRight size={16} style={{ marginLeft: '6px' }} />
                </button>
              </form>
            )}
          </div>
        </div>
      ) : (
        /* ================= LOGGED IN CUSTOMER DASHBOARD ================= */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Dashboard Header greeting with logout option */}
          <div className="glass-panel" style={{ padding: '24px 32px', display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary) 0%, #fb7185 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: 700,
                fontSize: '1.25rem',
                border: '2px solid rgba(255, 255, 255, 0.1)'
              }}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'C'}
              </div>
              <div>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Welcome back, {currentUser.name}!</h1>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: '2px 0 0 0' }}>
                  Registered Email: <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email}</strong>
                </p>
              </div>
            </div>

            <button 
              onClick={logoutCustomer}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 18px',
                borderRadius: '8px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: 'var(--accent-danger)',
                fontWeight: 600,
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
              }}
              className="logout-btn"
            >
              <LogOut size={16} />
              <span>Log Out</span>
            </button>
          </div>

          {/* Quick Metrics Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '20px'
          }}>
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--accent-primary)' }}>
                <ShoppingBag size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Orders</div>
                <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>{customerOrders.length}</div>
              </div>
            </div>
            
            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--accent-success)' }}>
                <Shield size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Account Level</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--accent-success)' }}>Verified Shopper</div>
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(251, 191, 36, 0.1)', color: 'var(--accent-gold)' }}>
                <MapPin size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Default Pin</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>{currentUser.pincode || 'Not Set'}</div>
              </div>
            </div>
          </div>

          {/* Main 2-Column Dashboard (Profile Settings vs Order History) */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: '32px',
          }} className="dashboard-grid-layout">
            <style dangerouslySetInnerHTML={{__html: `
              @media (min-width: 1024px) {
                .dashboard-grid-layout {
                  grid-template-columns: 380px 1fr !important;
                }
              }
              .logout-btn:hover {
                background-color: rgba(239, 68, 68, 0.15) !important;
                box-shadow: 0 0 10px rgba(239, 68, 68, 0.1);
              }
            `}} />

            {/* Left Column: Profile Editor */}
            <div className="glass-panel" style={{ padding: '28px', height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={20} style={{ color: 'var(--accent-primary)' }} />
                <span>Profile Information</span>
              </h3>

              <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {profileSuccess && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '6px', color: 'var(--accent-success)', fontSize: '0.85rem' }}>
                    <CheckCircle size={16} />
                    <span>{profileSuccess}</span>
                  </div>
                )}
                {profileError && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '6px', color: 'var(--accent-danger)', fontSize: '0.85rem' }}>
                    <AlertCircle size={16} />
                    <span>{profileError}</span>
                  </div>
                )}

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Full Name</label>
                  <input 
                    type="text" 
                    value={profileForm.name}
                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Phone Number</label>
                  <input 
                    type="tel" 
                    value={profileForm.phone}
                    onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Shipping Address</label>
                  <textarea 
                    value={profileForm.address}
                    onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                    style={{ minHeight: '80px', resize: 'vertical' }}
                    placeholder="Enter shipping address"
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Pincode</label>
                  <input 
                    type="text" 
                    value={profileForm.pincode}
                    onChange={(e) => setProfileForm({ ...profileForm, pincode: e.target.value })}
                    placeholder="Enter area pincode"
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={profileLoading}
                  style={{ width: '100%', padding: '12px', justifyContent: 'center', fontWeight: 600, marginTop: '8px' }}
                >
                  {profileLoading ? 'Saving...' : 'Update Details'}
                </button>
              </form>
            </div>

            {/* Right Column: Order History list and tracking details */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShoppingBag size={20} style={{ color: 'var(--accent-primary)' }} />
                  <span>Your Orders ({customerOrders.length})</span>
                </h3>

                {customerOrders.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '48px 16px' }}>
                    <div style={{ display: 'inline-flex', padding: '14px', borderRadius: '50%', background: 'var(--bg-secondary)', marginBottom: '16px' }}>
                      <ShoppingCart size={32} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <h4 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '6px' }}>No Orders Found Yet</h4>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', maxWidth: '360px', margin: '0 auto 20px auto', lineHeight: '1.4' }}>
                      We couldn't find any shopping purchases associated with email <strong style={{ color: 'var(--text-primary)' }}>{currentUser.email}</strong>.
                    </p>
                    <button className="btn btn-primary" onClick={() => navigateTo('catalog')}>
                      Browse Mobiles
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {customerOrders.map((order) => {
                      const status = order.status || 'Placed';
                      const isDelivered = status.toLowerCase() === 'delivered';
                      const statusColor = isDelivered 
                        ? 'var(--accent-success)' 
                        : (status.toLowerCase() === 'dispatched' ? '#6366f1' : 'var(--accent-gold)');

                      return (
                        <div 
                          key={order.id} 
                          style={{
                            background: 'var(--bg-secondary)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            overflow: 'hidden',
                            boxShadow: 'var(--shadow-sm)'
                          }}
                        >
                          {/* Order Header */}
                          <div style={{
                            padding: '16px 20px',
                            borderBottom: '1px solid var(--border-color)',
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '12px',
                            background: 'rgba(255,255,255,0.01)'
                          }}>
                            <div>
                              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                                Order ID: <span style={{ color: 'var(--text-primary)', fontWeight: 700 }}>{order.id}</span>
                              </div>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                Placed on {order.date}
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{
                                padding: '4px 10px',
                                borderRadius: '20px',
                                fontSize: '0.7rem',
                                fontWeight: 700,
                                textTransform: 'uppercase',
                                border: `1px solid ${statusColor}`,
                                color: statusColor,
                                background: `${statusColor}10`
                              }}>
                                {status}
                              </span>
                              
                              <span style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                                ₹{Number(order.total).toLocaleString('en-IN')}
                              </span>
                            </div>
                          </div>

                          {/* Order Body Details */}
                          <div style={{ padding: '20px' }}>
                            {/* Items List */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                              {order.items && order.items.map((item, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px' }}>
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <div style={{
                                      width: '32px',
                                      height: '32px',
                                      borderRadius: '6px',
                                      background: item.product?.imageColor || 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
                                      flexShrink: 0
                                    }} />
                                    <div>
                                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                                        {item.product?.name || 'Smart Phone'}
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                        Qty: {item.quantity} × ₹{Number(item.product?.price || 0).toLocaleString('en-IN')}
                                      </div>
                                    </div>
                                  </div>
                                  <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                    ₹{Number((item.product?.price || 0) * item.quantity).toLocaleString('en-IN')}
                                  </span>
                                </div>
                              ))}
                            </div>

                            {/* Summary breakdown details (Discounts) */}
                            {(order.couponDiscount > 0 || order.bankDiscount > 0) && (
                              <div style={{ 
                                padding: '12px 16px', 
                                background: 'rgba(255,255,255,0.02)', 
                                borderRadius: '8px', 
                                border: '1px solid var(--border-color)',
                                fontSize: '0.8rem',
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '6px',
                                marginBottom: '20px'
                              }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                                  <span>Subtotal:</span>
                                  <span>₹{Number(order.subtotal).toLocaleString('en-IN')}</span>
                                </div>
                                {order.couponDiscount > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-success)' }}>
                                    <span>Coupon Discount:</span>
                                    <span>-₹{Number(order.couponDiscount).toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                                {order.bankDiscount > 0 && (
                                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--accent-success)' }}>
                                    <span>Bank Discount:</span>
                                    <span>-₹{Number(order.bankDiscount).toLocaleString('en-IN')}</span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Shipping address info */}
                            <div style={{ borderTop: '1px solid var(--border-color)', padding: '16px 0 0 0', display: 'flex', flexWrap: 'wrap', gap: '20px', justifyContent: 'space-between', fontSize: '0.8rem' }}>
                              <div style={{ flex: 1, minWidth: '180px' }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Shipping Address:</div>
                                <div style={{ color: 'var(--text-muted)', lineHeight: '1.4' }}>
                                  {order.customerAddress || order.customer?.address}, {order.customerPincode || order.customer?.pincode}
                                </div>
                              </div>
                              <div style={{ flexShrink: 0 }}>
                                <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>Payment Info:</div>
                                <div style={{ color: 'var(--text-muted)' }}>
                                  {order.paymentMethod}
                                </div>
                              </div>
                            </div>

                            <hr style={{ borderColor: 'var(--border-color)', margin: '20px 0' }} />

                            {/* Stepper progress tracker timeline */}
                            <div>
                              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '12px' }}>
                                Order Ship Status Tracking:
                              </div>
                              {renderStatusStepper(status)}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
