import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { products as initialProducts } from './src/data/products.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import WebSocket from 'ws';

// Polyfill WebSocket for Node.js environments without native support (e.g. Node 20)
if (typeof global.WebSocket === 'undefined') {
  global.WebSocket = WebSocket;
}

// Load local env file if it exists
if (fs.existsSync('.env')) {
  const envContent = fs.readFileSync('.env', 'utf-8');
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const parts = trimmedLine.split('=');
      if (parts.length >= 2) {
        const key = parts[0].trim();
        const value = parts.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
        process.env[key] = value;
      }
    }
  });
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

import Razorpay from 'razorpay';
import crypto from 'crypto';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || '',
  key_secret: process.env.RAZORPAY_KEY_SECRET || ''
});

app.use(cors());
app.use(express.json());

// Initialize Supabase client connection
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
  console.warn('WARNING: Supabase URL or Anon Key is not configured correctly in .env.');
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function initDb() {
  if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('your-project-id')) {
    console.warn('WARNING: Skipping Supabase initialization because credentials are not set.');
    return;
  }

  try {
    // 1. Seed products if empty
    const { data: products, error: prodError } = await supabase.from('products').select('id').limit(1);
    if (prodError) {
      throw new Error(`Failed to query products table: ${prodError.message}. Make sure you have created the tables in your Supabase SQL Editor as specified in the implementation plan.`);
    }

    if (products.length === 0) {
      console.log('Seeding initial products into Supabase database...');
      const seedProducts = initialProducts.map(p => ({
        id: p.id,
        name: p.name,
        brand: p.brand,
        category: p.category,
        price: Number(p.price),
        mrp: Number(p.mrp),
        rating: Number(p.rating || 4.5),
        reviewsCount: Number(p.reviewsCount || 100),
        imageColor: p.imageColor,
        display: p.specs.display || '',
        processor: p.specs.processor || '',
        ram: p.specs.ram || '',
        storage: p.specs.storage || '',
        backCamera: p.specs.backCamera || '',
        frontCamera: p.specs.frontCamera || '',
        battery: p.specs.battery || '',
        os: p.specs.os || '',
        network: p.specs.network || '5G Supported',
        weight: p.specs.weight || '',
        features: p.features || [],
        inStock: !!p.inStock
      }));

      const { error: insertProdError } = await supabase.from('products').insert(seedProducts);
      if (insertProdError) console.error('Error seeding products:', insertProdError.message);
    }

    // 2. Seed coupons if empty
    const { data: coupons, error: coupError } = await supabase.from('coupons').select('code').limit(1);
    if (coupError) console.error('Error querying coupons:', coupError.message);
    else if (coupons.length === 0) {
      console.log('Seeding initial coupons...');
      const initialCoupons = [
        { code: 'SHREESHYAM', type: 'flat', value: 2500, minSubtotal: 50000, description: 'Flat ₹2,500 Off on orders above ₹50,000' },
        { code: 'JSS10', type: 'percent', value: 10, minSubtotal: 0, description: '10% Off on all orders' },
        { code: 'FIRSTBUY', type: 'flat', value: 1000, minSubtotal: 10000, description: 'Flat ₹1,000 Off on orders above ₹10,000' }
      ];
      const { error: insertCoupError } = await supabase.from('coupons').insert(initialCoupons);
      if (insertCoupError) console.error('Error seeding coupons:', insertCoupError.message);
    }

    // 3. Seed bank offers if empty
    const { data: bankOffers, error: bankError } = await supabase.from('bank_offers').select('id').limit(1);
    if (bankError) console.error('Error querying bank offers:', bankError.message);
    else if (bankOffers.length === 0) {
      console.log('Seeding initial bank offers...');
      const initialBankOffers = [
        { id: 'HDFC', bank: 'HDFC Card EMI', desc: 'Flat ₹3,000 Instant Off', type: 'flat', value: 3000, maxDiscount: 3000 },
        { id: 'ICICI', bank: 'ICICI Card', desc: '10% Cashback up to ₹2,500', type: 'percent', value: 10, maxDiscount: 2500 },
        { id: 'SBI', bank: 'SBI Card', desc: 'Flat ₹1,500 Instant Discount', type: 'flat', value: 1500, maxDiscount: 1500 }
      ];
      const { error: insertBankError } = await supabase.from('bank_offers').insert(initialBankOffers);
      if (insertBankError) console.error('Error seeding bank offers:', insertBankError.message);
    }

    // 4. Seed flash deal if empty
    const { data: flashDeals, error: flashError } = await supabase.from('flash_deal').select('id').limit(1);
    if (flashError) console.error('Error querying flash deal:', flashError.message);
    else if (flashDeals.length === 0) {
      console.log('Seeding initial flash deal...');
      const { error: insertFlashError } = await supabase.from('flash_deal').insert([{
        id: 'active',
        product_id: 'xiaomi-14',
        discount: 3500,
        description: 'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
      }]);
      if (insertFlashError) console.error('Error seeding flash deal:', insertFlashError.message);
    }

    console.log('Supabase tables initialized and verified successfully.');
  } catch (err) {
    console.error('DATABASE INITIALIZATION ERROR:', err.message);
  }
}

// Start database
initDb().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Helper: map database row to client product object structure
function mapProduct(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    category: row.category,
    price: row.price,
    mrp: row.mrp,
    rating: row.rating,
    reviewsCount: row.reviewsCount,
    imageColor: row.imageColor,
    specs: {
      display: row.display,
      processor: row.processor,
      ram: row.ram,
      storage: row.storage,
      backCamera: row.backCamera,
      frontCamera: row.frontCamera,
      battery: row.battery,
      os: row.os,
      network: row.network,
      weight: row.weight
    },
    features: typeof row.features === 'string' ? JSON.parse(row.features) : row.features,
    inStock: !!row.inStock
  };
}

// --- API ROUTES ---

// 1. PRODUCTS ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('products')
      .select('*');
    if (error) throw error;
    const products = rows.map(mapProduct);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products', async (req, res) => {
  try {
    const p = req.body;
    const specs = p.specs || {};
    const productData = {
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: Number(p.price),
      mrp: Number(p.mrp),
      rating: Number(p.rating || 4.5),
      reviewsCount: Number(p.reviewsCount || 100),
      imageColor: p.imageColor,
      display: specs.display || '',
      processor: specs.processor || '',
      ram: specs.ram || '',
      storage: specs.storage || '',
      backCamera: specs.backCamera || '',
      frontCamera: specs.frontCamera || '',
      battery: specs.battery || '',
      os: specs.os || '',
      network: specs.network || '5G Supported',
      weight: specs.weight || '',
      features: p.features || [],
      inStock: !!p.inStock
    };

    const { data, error } = await supabase
      .from('products')
      .insert([productData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(mapProduct(data));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data: existing, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const body = req.body;
    const updated = {
      name: body.name !== undefined ? body.name : existing.name,
      brand: body.brand !== undefined ? body.brand : existing.brand,
      category: body.category !== undefined ? body.category : existing.category,
      price: body.price !== undefined ? Number(body.price) : existing.price,
      mrp: body.mrp !== undefined ? Number(body.mrp) : existing.mrp,
      rating: body.rating !== undefined ? Number(body.rating) : existing.rating,
      reviewsCount: body.reviewsCount !== undefined ? Number(body.reviewsCount) : existing.reviewsCount,
      imageColor: body.imageColor !== undefined ? body.imageColor : existing.imageColor,
      display: (body.specs && body.specs.display !== undefined) ? body.specs.display : existing.display,
      processor: (body.specs && body.specs.processor !== undefined) ? body.specs.processor : existing.processor,
      ram: (body.specs && body.specs.ram !== undefined) ? body.specs.ram : existing.ram,
      storage: (body.specs && body.specs.storage !== undefined) ? body.specs.storage : existing.storage,
      backCamera: (body.specs && body.specs.backCamera !== undefined) ? body.specs.backCamera : existing.backCamera,
      frontCamera: (body.specs && body.specs.frontCamera !== undefined) ? body.specs.frontCamera : existing.frontCamera,
      battery: (body.specs && body.specs.battery !== undefined) ? body.specs.battery : existing.battery,
      os: (body.specs && body.specs.os !== undefined) ? body.specs.os : existing.os,
      network: (body.specs && body.specs.network !== undefined) ? body.specs.network : existing.network,
      weight: (body.specs && body.specs.weight !== undefined) ? body.specs.weight : existing.weight,
      features: body.features !== undefined ? body.features : existing.features,
      inStock: body.inStock !== undefined ? !!body.inStock : !!existing.inStock
    };

    const { data: result, error: updateError } = await supabase
      .from('products')
      .update(updated)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(mapProduct(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: `Product ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/reset', async (req, res) => {
  try {
    const { error: deleteError } = await supabase
      .from('products')
      .delete()
      .neq('id', '');
    if (deleteError) throw deleteError;

    const seedProducts = initialProducts.map(p => ({
      id: p.id,
      name: p.name,
      brand: p.brand,
      category: p.category,
      price: Number(p.price),
      mrp: Number(p.mrp),
      rating: Number(p.rating || 4.5),
      reviewsCount: Number(p.reviewsCount || 100),
      imageColor: p.imageColor,
      display: p.specs.display || '',
      processor: p.specs.processor || '',
      ram: p.specs.ram || '',
      storage: p.specs.storage || '',
      backCamera: p.specs.backCamera || '',
      frontCamera: p.specs.frontCamera || '',
      battery: p.specs.battery || '',
      os: p.specs.os || '',
      network: p.specs.network || '5G Supported',
      weight: p.specs.weight || '',
      features: p.features || [],
      inStock: !!p.inStock
    }));

    const { data, error: insertError } = await supabase
      .from('products')
      .insert(seedProducts)
      .select();

    if (insertError) throw insertError;
    res.json(data.map(mapProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. COUPONS ENDPOINTS
app.get('/api/coupons', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('coupons')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, type, value, minSubtotal, description } = req.body;
    const upperCode = code.toUpperCase();
    const couponData = {
      code: upperCode,
      type,
      value: Number(value),
      minSubtotal: Number(minSubtotal || 0),
      description
    };
    const { data, error } = await supabase
      .from('coupons')
      .insert([couponData])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const { error } = await supabase
      .from('coupons')
      .delete()
      .eq('code', code.toUpperCase());
    if (error) throw error;
    res.json({ success: true, message: `Coupon ${code} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons/reset', async (req, res) => {
  try {
    const { error: deleteError } = await supabase
      .from('coupons')
      .delete()
      .neq('code', '');
    if (deleteError) throw deleteError;

    const initialCoupons = [
      { code: 'SHREESHYAM', type: 'flat', value: 2500, minSubtotal: 50000, description: 'Flat ₹2,500 Off on orders above ₹50,000' },
      { code: 'JSS10', type: 'percent', value: 10, minSubtotal: 0, description: '10% Off on all orders' },
      { code: 'FIRSTBUY', type: 'flat', value: 1000, minSubtotal: 10000, description: 'Flat ₹1,000 Off on orders above ₹10,000' }
    ];

    const { data, error: insertError } = await supabase
      .from('coupons')
      .insert(initialCoupons)
      .select();
    if (insertError) throw insertError;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. BANK OFFERS ENDPOINTS
app.get('/api/bank-offers', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('bank_offers')
      .select('*');
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank-offers', async (req, res) => {
  try {
    const { id, bank, desc, type, value, maxDiscount } = req.body;
    const upperId = id.toUpperCase();
    const offerData = {
      id: upperId,
      bank,
      desc,
      type,
      value: Number(value),
      maxDiscount: maxDiscount ? Number(maxDiscount) : null
    };
    const { data, error } = await supabase
      .from('bank_offers')
      .insert([offerData])
      .select()
      .single();
    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bank-offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('bank_offers')
      .delete()
      .eq('id', id.toUpperCase());
    if (error) throw error;
    res.json({ success: true, message: `Bank offer ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bank-offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const upperId = id.toUpperCase();
    const { data: existing, error: fetchError } = await supabase
      .from('bank_offers')
      .select('*')
      .eq('id', upperId)
      .single();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'Bank offer not found' });
    }

    const body = req.body;
    const updated = {
      bank: body.bank !== undefined ? body.bank : existing.bank,
      desc: body.desc !== undefined ? body.desc : existing.desc,
      type: body.type !== undefined ? body.type : existing.type,
      value: body.value !== undefined ? Number(body.value) : existing.value,
      maxDiscount: body.maxDiscount !== undefined ? (body.maxDiscount ? Number(body.maxDiscount) : null) : existing.maxDiscount
    };

    const { data: result, error: updateError } = await supabase
      .from('bank_offers')
      .update(updated)
      .eq('id', upperId)
      .select()
      .single();

    if (updateError) throw updateError;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank-offers/reset', async (req, res) => {
  try {
    const { error: deleteError } = await supabase
      .from('bank_offers')
      .delete()
      .neq('id', '');
    if (deleteError) throw deleteError;

    const initialBankOffers = [
      { id: 'HDFC', bank: 'HDFC Card EMI', desc: 'Flat ₹3,000 Instant Off', type: 'flat', value: 3000, maxDiscount: 3000 },
      { id: 'ICICI', bank: 'ICICI Card', desc: '10% Cashback up to ₹2,500', type: 'percent', value: 10, maxDiscount: 2500 },
      { id: 'SBI', bank: 'SBI Card', desc: 'Flat ₹1,500 Instant Discount', type: 'flat', value: 1500, maxDiscount: 1500 }
    ];

    const { data, error: insertError } = await supabase
      .from('bank_offers')
      .insert(initialBankOffers)
      .select();
    if (insertError) throw insertError;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3.5 FLASH DEAL ENDPOINTS
app.get('/api/flash-deal', async (req, res) => {
  try {
    const { data: deal, error } = await supabase
      .from('flash_deal')
      .select('*')
      .eq('id', 'active')
      .maybeSingle();

    if (error) throw error;

    if (!deal) {
      return res.json({
        id: 'active',
        product_id: 'xiaomi-14',
        discount: 3500,
        description: 'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
      });
    }
    res.json(deal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/flash-deal', async (req, res) => {
  try {
    const { product_id, discount, description } = req.body;
    const { data: updated, error } = await supabase
      .from('flash_deal')
      .update({ product_id, discount: Number(discount), description })
      .eq('id', 'active')
      .select()
      .single();

    if (error) throw error;
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flash-deal/reset', async (req, res) => {
  try {
    const { error: deleteError } = await supabase
      .from('flash_deal')
      .delete()
      .eq('id', 'active');
    if (deleteError) throw deleteError;

    const { data: resetDeal, error: insertError } = await supabase
      .from('flash_deal')
      .insert([{
        id: 'active',
        product_id: 'xiaomi-14',
        discount: 3500,
        description: 'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
      }])
      .select()
      .single();

    if (insertError) throw insertError;
    res.json(resetDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. QUERIES (CALLBACKS & B2B QUOTES) ENDPOINTS
app.get('/api/queries', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('queries')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queries', async (req, res) => {
  try {
    const q = req.body;
    const queryData = {
      id: q.id,
      type: q.type,
      date: q.date,
      contactName: q.contactName,
      phone: q.phone,
      email: q.email,
      subject: q.subject || null,
      message: q.message || null,
      companyName: q.companyName || null,
      gstNumber: q.gstNumber || null,
      deliveryDate: q.deliveryDate || null,
      comments: q.comments || null,
      items: q.items || null,
      totalVolume: Number(q.totalVolume || 0),
      netTotal: Number(q.netTotal || 0.0),
      status: q.status || 'Pending'
    };

    const { data, error } = await supabase
      .from('queries')
      .insert([queryData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/queries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('queries')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: `Query ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queries/reset', async (req, res) => {
  try {
    const { error } = await supabase
      .from('queries')
      .delete()
      .neq('id', '');
    if (error) throw error;
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. ORDERS ENDPOINTS
app.get('/api/orders', async (req, res) => {
  try {
    const { data: rows, error } = await supabase
      .from('orders')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/orders', async (req, res) => {
  try {
    const o = req.body;
    const customerName = o.customerName || (o.customer && o.customer.name) || 'Guest Customer';
    const customerPhone = o.customerPhone || (o.customer && o.customer.phone) || '';
    const customerEmail = o.customerEmail || (o.customer && o.customer.email) || null;
    const customerAddress = o.customerAddress || (o.customer && o.customer.address) || '';
    const customerPincode = o.customerPincode || (o.customer && o.customer.pincode) || '';

    const orderData = {
      id: o.id,
      date: o.date,
      items: o.items,
      subtotal: Number(o.subtotal),
      couponDiscount: Number(o.couponDiscount || 0),
      bankDiscount: Number(o.bankDiscount || 0),
      total: Number(o.total),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerPincode,
      paymentMethod: o.paymentMethod,
      status: o.status || 'Placed'
    };

    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. STRIPE PAYMENT INTENT ENDPOINT (SIMULATION / SANDBOX PRE-REQUISITE)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const clientSecret = `pi_mock_${Date.now()}_secret_${Math.random().toString(36).substring(2, 15)}`;
    res.status(200).send({
      clientSecret: clientSecret
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6.5. RAZORPAY PAYMENT ENDPOINTS
app.get('/api/razorpay/config', (req, res) => {
  res.json({
    keyId: process.env.RAZORPAY_KEY_ID || ''
  });
});

app.post('/api/razorpay/create-order', async (req, res) => {
  try {
    const { amount, receipt } = req.body;
    if (!amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }
    const options = {
      amount: Math.round(Number(amount) * 100), // convert to paise
      currency: "INR",
      receipt: receipt || `rcpt_${Date.now()}`
    };
    
    const rzpOrder = await razorpay.orders.create(options);
    res.status(201).json(rzpOrder);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/razorpay/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, order } = req.body;
    
    // If no keys configured or sandbox bypass requested, verify mock signatures
    if (!process.env.RAZORPAY_KEY_SECRET || razorpay_payment_id.startsWith('pay_mock_')) {
      // Mock validation succeeds automatically for sandbox testing
      await saveVerifiedOrder(order, `RAZORPAY (MOCK_${razorpay_payment_id})`);
      return res.json({ success: true, orderId: order.id, mock: true });
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || '')
      .update(body.toString())
      .digest('hex');
      
    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Invalid payment signature verification' });
    }
    
    // Save verified order to DB
    await saveVerifiedOrder(order, `RAZORPAY (${razorpay_payment_id})`);
    res.json({ success: true, orderId: order.id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Helper function to save orders inside Supabase
async function saveVerifiedOrder(order, paymentMethod) {
  const customerName = order.customerName || (order.customer && order.customer.name) || 'Guest Customer';
  const customerPhone = order.customerPhone || (order.customer && order.customer.phone) || '';
  const customerEmail = order.customerEmail || (order.customer && order.customer.email) || null;
  const customerAddress = order.customerAddress || (order.customer && order.customer.address) || '';
  const customerPincode = order.customerPincode || (order.customer && order.customer.pincode) || '';
  
  const orderData = {
    id: order.id,
    date: order.date,
    items: order.items,
    subtotal: Number(order.subtotal),
    couponDiscount: Number(order.couponDiscount || 0),
    bankDiscount: Number(order.bankDiscount || 0),
    total: Number(order.total),
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    customerPincode,
    paymentMethod,
    status: 'Paid'
  };

  const { error } = await supabase
    .from('orders')
    .insert([orderData]);

  if (error) throw error;
}

// 7. USER AUTHENTICATION & PROFILE ENDPOINTS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, pincode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    
    const { data: existing, error: searchError } = await supabase
      .from('users')
      .select('email')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (searchError) throw searchError;
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    const userId = `user-${Date.now()}`;
    const userData = {
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      password,
      address: address ? address.trim() : null,
      pincode: pincode ? pincode.trim() : null
    };

    const { data: created, error: insertError } = await supabase
      .from('users')
      .insert([userData])
      .select('id, name, email, phone, address, pincode')
      .single();

    if (insertError) throw insertError;
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .maybeSingle();

    if (error) throw error;
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const safeUser = { ...user };
    delete safeUser.password;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, pincode } = req.body;
    
    const { data: existing, error: fetchError } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (fetchError || !existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updated = {
      name: name !== undefined ? name.trim() : existing.name,
      phone: phone !== undefined ? phone.trim() : existing.phone,
      address: address !== undefined ? address.trim() : existing.address,
      pincode: pincode !== undefined ? pincode.trim() : existing.pincode
    };

    const { data: result, error: updateError } = await supabase
      .from('users')
      .update(updated)
      .eq('id', id)
      .select('id, name, email, phone, address, pincode')
      .single();

    if (updateError) throw updateError;
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:email/orders', async (req, res) => {
  try {
    const { email } = req.params;
    const { data: rows, error } = await supabase
      .from('orders')
      .select('*')
      .ilike('customerEmail', email.trim().toLowerCase())
      .order('date', { ascending: false });

    if (error) throw error;
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-facing order management (update status, delete order)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const { data: updated, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: `Order ${id} deleted successfully.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve static frontend files in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Fallback for Single Page Application routing (SPA)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Not Found');
    }
  });
});

app.listen(PORT, () => {
  console.log(`Backend server is running on http://localhost:${PORT}`);
});
