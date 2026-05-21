import React from 'react';
import { useShop } from '../context/ShopContext';
import { Printer, ArrowLeft, Send } from 'lucide-react';

export default function QuotationSheet({ quoteData, quoteItems, onBack }) {
  const { navigateTo, clearQuote } = useShop();

  const getDiscountTier = (qty) => {
    if (qty >= 51) return 20;
    if (qty >= 26) return 15;
    if (qty >= 11) return 10;
    if (qty >= 5) return 5;
    return 0;
  };

  const calculateSubtotal = () => {
    return quoteItems.reduce((acc, item) => {
      const discount = getDiscountTier(item.quantity);
      const discountedPrice = item.product.price * (1 - discount / 100);
      return acc + (discountedPrice * item.quantity);
    }, 0);
  };

  const subtotal = calculateSubtotal();
  const gstRate = 0.18; // 18% GST on Mobiles in India
  const gstAmount = subtotal * gstRate;
  const grandTotal = subtotal + gstAmount;
  
  const quoteNumber = `JSS-QT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const todayDate = new Date().toLocaleDateString('en-IN');
  const validUntilDate = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'); // 15 days validity

  const handleSendAndPrint = () => {
    window.print();
  };

  const handleDone = () => {
    clearQuote();
    navigateTo('home');
  };

  return (
    <div className="container animate-fade-in" style={{ padding: '40px 24px' }}>
      
      {/* Action Buttons for Screen (Hidden in print) */}
      <div className="no-print" style={{ display: 'flex', gap: '16px', marginBottom: '32px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} /> Back to Details
        </button>
        
        <button className="btn btn-primary" onClick={handleSendAndPrint} style={{ marginLeft: 'auto' }}>
          <Printer size={16} /> Print / Save as PDF
        </button>

        <button className="btn btn-gold" onClick={handleDone}>
          Submit Quote & Clear basket
        </button>
      </div>

      {/* The Printable Quotation Document */}
      <div className="glass-panel quote-print-document" style={{ background: '#ffffff', color: '#0f172a', padding: '48px', borderRadius: 'var(--border-radius-md)', boxShadow: 'var(--shadow-lg)' }}>
        
        {/* Document Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #0f172a', paddingBottom: '24px', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, color: '#1e293b' }}>
              📱 JAI SHREE SHYAM TRADERS
            </h1>
            <p style={{ margin: '4px 0', fontSize: '0.85rem', color: '#475569' }}>
              Official Mobile Wholesalers & Distributors
            </p>
            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>
              F22 Milap Nagar, Uttam Nagar East, New Delhi - 110059
            </p>
            <p style={{ margin: '2px 0', fontSize: '0.85rem', color: '#64748b' }}>
              GSTIN: 07AAPFJ8822F1ZX | Tel: +91 72062 61583
            </p>
          </div>
          
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'inline-block', padding: '6px 12px', background: '#f1f5f9', fontWeight: 700, fontSize: '0.85rem', borderRadius: '4px', textTransform: 'uppercase', color: '#334155', marginBottom: '12px' }}>
              Proforma Quotation
            </span>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              <strong>Quote No:</strong> {quoteNumber}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              <strong>Date:</strong> {todayDate}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#ef4444', marginTop: '2px', fontWeight: 600 }}>
              <strong>Valid Until:</strong> {validUntilDate}
            </div>
          </div>
        </div>

        {/* Client & Vendor Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '48px', marginBottom: '32px' }}>
          <div>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              QUOTATION PREPARED FOR:
            </h3>
            <div style={{ fontSize: '0.95rem', color: '#1e293b', fontWeight: 'bold' }}>
              {quoteData.companyName}
            </div>
            {quoteData.gstNumber && (
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
                <strong>GSTIN:</strong> {quoteData.gstNumber}
              </div>
            )}
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
              <strong>Contact Person:</strong> {quoteData.contactName}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              <strong>Phone:</strong> {quoteData.phone}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '2px' }}>
              <strong>Email:</strong> {quoteData.email}
            </div>
          </div>

          <div>
            <h3 style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b', marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '4px' }}>
              DELIVERY & LOGISTICS:
            </h3>
            <div style={{ fontSize: '0.85rem', color: '#475569' }}>
              <strong>Preferred Date:</strong> {new Date(quoteData.deliveryDate).toLocaleDateString('en-IN')}
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
              <strong>Shipment Mode:</strong> Insured Surface Carrier
            </div>
            <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '4px' }}>
              <strong>Payment Terms:</strong> 50% Advance with Purchase Order, 50% Cash/UPI on Showroom Pickups or Delivery verification.
            </div>
            {quoteData.comments && (
              <div style={{ fontSize: '0.85rem', color: '#475569', marginTop: '8px', fontStyle: 'italic', background: '#f8fafc', padding: '8px', borderRadius: '4px' }}>
                <strong>Client Remarks:</strong> "{quoteData.comments}"
              </div>
            )}
          </div>
        </div>

        {/* Itemized Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ background: '#0f172a', color: '#ffffff' }}>
              <th style={{ padding: '12px 8px', fontSize: '0.8rem', textAlign: 'center', width: '5%' }}>S.No.</th>
              <th style={{ padding: '12px 12px', fontSize: '0.8rem', textAlign: 'left', width: '40%' }}>Description of Mobiles</th>
              <th style={{ padding: '12px 8px', fontSize: '0.8rem', textAlign: 'center', width: '10%' }}>Qty</th>
              <th style={{ padding: '12px 12px', fontSize: '0.8rem', textAlign: 'right', width: '15%' }}>Retail Price (INR)</th>
              <th style={{ padding: '12px 8px', fontSize: '0.8rem', textAlign: 'center', width: '10%' }}>Discount</th>
              <th style={{ padding: '12px 12px', fontSize: '0.8rem', textAlign: 'right', width: '15%' }}>Net Price (INR)</th>
              <th style={{ padding: '12px 12px', fontSize: '0.8rem', textAlign: 'right', width: '15%' }}>Total (INR)</th>
            </tr>
          </thead>
          <tbody>
            {quoteItems.map((item, idx) => {
              const discount = getDiscountTier(item.quantity);
              const netPrice = item.product.price * (1 - discount / 100);
              const total = netPrice * item.quantity;
              
              return (
                <tr key={item.product.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px 8px', fontSize: '0.85rem', textAlign: 'center' }}>{idx + 1}</td>
                  <td style={{ padding: '12px 12px', fontSize: '0.85rem', textAlign: 'left' }}>
                    <strong>{item.product.name}</strong>
                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                      Specs: {item.product.specs.ram} RAM / {item.product.specs.storage} / {item.product.specs.processor.split(' ')[0]}
                    </div>
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.85rem', textAlign: 'center', fontWeight: 'bold' }}>{item.quantity}</td>
                  <td style={{ padding: '12px 12px', fontSize: '0.85rem', textAlign: 'right', fontFamily: 'monospace' }}>
                    {item.product.price.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 8px', fontSize: '0.85rem', textAlign: 'center', color: '#10b981', fontWeight: 600 }}>
                    {discount}%
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '0.85rem', textAlign: 'right', fontFamily: 'monospace' }}>
                    {netPrice.toLocaleString('en-IN')}
                  </td>
                  <td style={{ padding: '12px 12px', fontSize: '0.85rem', textAlign: 'right', fontFamily: 'monospace', fontWeight: 'bold' }}>
                    {total.toLocaleString('en-IN')}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Pricing Summary Blocks */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '32px' }}>
          {/* Bank details & Terms */}
          <div style={{ fontSize: '0.75rem', color: '#64748b', lineHeight: '1.6' }}>
            <h4 style={{ color: '#334155', fontWeight: 'bold', marginBottom: '6px' }}>BANK PAYMENT DETAILS:</h4>
            <div style={{ margin: '2px 0' }}><strong>Bank:</strong> HDFC Bank Ltd. | Uttam Nagar Branch</div>
            <div style={{ margin: '2px 0' }}><strong>A/C Name:</strong> Jai Shree Shyam Traders B2B Account</div>
            <div style={{ margin: '2px 0' }}><strong>A/C No:</strong> 50200088991122 | <strong>IFSC:</strong> HDFC0000102</div>
            
            <h4 style={{ color: '#334155', fontWeight: 'bold', marginTop: '12px', marginBottom: '6px' }}>TERMS & CONDITIONS:</h4>
            <ol style={{ paddingLeft: '14px', margin: 0 }}>
              <li>Quotes are calculated strictly based on wholesale order volume.</li>
              <li>Goods once dispatched cannot be returned or refunded unless structural brand damage is verified.</li>
              <li>All sales are subject to Delhi jurisdiction courts only.</li>
            </ol>
          </div>

          {/* Totals Table */}
          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '4px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>Taxable Value:</span>
              <span style={{ fontWeight: 550, fontFamily: 'monospace' }}>₹{subtotal.toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>CGST (9.0%):</span>
              <span style={{ fontWeight: 550, fontFamily: 'monospace' }}>₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid #cbd5e1', paddingBottom: '8px' }}>
              <span style={{ color: '#64748b' }}>SGST (9.0%):</span>
              <span style={{ fontWeight: 550, fontFamily: 'monospace' }}>₹{(gstAmount / 2).toLocaleString('en-IN')}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', fontSize: '1.05rem', color: '#0f172a' }}>
              <span>Grand Total (INR):</span>
              <span style={{ fontFamily: 'monospace' }}>₹{Math.round(grandTotal).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Signature Area */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '64px', borderTop: '1px solid #e2e8f0', paddingTop: '24px', fontSize: '0.8rem' }}>
          <div>
            <p style={{ margin: 0, fontStyle: 'italic', color: '#64748b' }}>Accepted & Approved by Customer:</p>
            <div style={{ height: '50px' }}></div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#334155' }}>Authorized Representative Signature</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, color: '#64748b' }}>For JAI SHREE SHYAM TRADERS:</p>
            <div style={{ height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
              <span style={{ display: 'inline-block', border: '2px dashed #94a3b8', padding: '4px 12px', fontSize: '0.65rem', color: '#94a3b8', borderRadius: '4px', fontWeight: 700 }}>
                B2B SALES SEAL
              </span>
            </div>
            <p style={{ margin: 0, fontWeight: 'bold', color: '#334155' }}>Managing Partner Signature</p>
          </div>
        </div>

      </div>
    </div>
  );
}
