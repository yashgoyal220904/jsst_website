import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import { products as initialProducts } from './src/data/products.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

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

// Initialize SQLite database connection
let db;
async function initDb() {
  db = await open({
    filename: process.env.DATABASE_PATH || './database.sqlite',
    driver: sqlite3.Database
  });

  // Create products table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT NOT NULL,
      price REAL NOT NULL,
      mrp REAL NOT NULL,
      rating REAL DEFAULT 4.5,
      reviewsCount INTEGER DEFAULT 100,
      imageColor TEXT NOT NULL,
      display TEXT NOT NULL,
      processor TEXT NOT NULL,
      ram TEXT NOT NULL,
      storage TEXT NOT NULL,
      backCamera TEXT NOT NULL,
      frontCamera TEXT NOT NULL,
      battery TEXT NOT NULL,
      os TEXT NOT NULL,
      network TEXT NOT NULL,
      weight TEXT NOT NULL,
      features TEXT NOT NULL,
      inStock INTEGER NOT NULL DEFAULT 1
    )
  `);

  // Create coupons table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS coupons (
      code TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      minSubtotal REAL NOT NULL DEFAULT 0,
      description TEXT NOT NULL
    )
  `);

  // Create bank_offers table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS bank_offers (
      id TEXT PRIMARY KEY,
      bank TEXT NOT NULL,
      desc TEXT NOT NULL,
      type TEXT NOT NULL,
      value REAL NOT NULL,
      maxDiscount REAL
    )
  `);

  // Create flash_deal table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS flash_deal (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      discount REAL NOT NULL,
      description TEXT NOT NULL
    )
  `);

  // Create queries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS queries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      contactName TEXT NOT NULL,
      phone TEXT NOT NULL,
      email TEXT NOT NULL,
      subject TEXT,
      message TEXT,
      companyName TEXT,
      gstNumber TEXT,
      deliveryDate TEXT,
      comments TEXT,
      items TEXT,
      totalVolume INTEGER DEFAULT 0,
      netTotal REAL DEFAULT 0.0,
      status TEXT NOT NULL DEFAULT 'Pending'
    )
  `);

  // Create users table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      phone TEXT NOT NULL,
      password TEXT NOT NULL,
      address TEXT,
      pincode TEXT
    )
  `);

  // Create orders table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      subtotal REAL NOT NULL,
      couponDiscount REAL NOT NULL DEFAULT 0,
      bankDiscount REAL NOT NULL DEFAULT 0,
      total REAL NOT NULL,
      customerName TEXT NOT NULL,
      customerPhone TEXT NOT NULL,
      customerEmail TEXT,
      customerAddress TEXT NOT NULL,
      customerPincode TEXT NOT NULL,
      paymentMethod TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Placed'
    )
  `);

  // Ensure status column exists in orders table (for existing databases)
  try {
    await db.exec(`ALTER TABLE orders ADD COLUMN status TEXT NOT NULL DEFAULT 'Placed'`);
  } catch (err) {
    // Column already exists or table doesn't exist yet
  }

  // Seed products table if empty
  const productCount = await db.get('SELECT COUNT(*) as count FROM products');
  if (productCount.count === 0) {
    console.log('Seeding initial products into SQLite database...');
    for (const p of initialProducts) {
      await db.run(`
        INSERT INTO products (
          id, name, brand, category, price, mrp, rating, reviewsCount, imageColor,
          display, processor, ram, storage, backCamera, frontCamera, battery, os, network, weight,
          features, inStock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id,
        p.name,
        p.brand,
        p.category,
        p.price,
        p.mrp,
        p.rating || 4.5,
        p.reviewsCount || 100,
        p.imageColor,
        p.specs.display || '',
        p.specs.processor || '',
        p.specs.ram || '',
        p.specs.storage || '',
        p.specs.backCamera || '',
        p.specs.frontCamera || '',
        p.specs.battery || '',
        p.specs.os || '',
        p.specs.network || '5G Supported',
        p.specs.weight || '',
        JSON.stringify(p.features || []),
        p.inStock ? 1 : 0
      ]);
    }
  }

  // Seed coupons table if empty
  const couponCount = await db.get('SELECT COUNT(*) as count FROM coupons');
  if (couponCount.count === 0) {
    console.log('Seeding initial coupons...');
    const initialCoupons = [
      { code: 'SHREESHYAM', type: 'flat', value: 2500, minSubtotal: 50000, description: 'Flat ₹2,500 Off on orders above ₹50,000' },
      { code: 'JSS10', type: 'percent', value: 10, minSubtotal: 0, description: '10% Off on all orders' },
      { code: 'FIRSTBUY', type: 'flat', value: 1000, minSubtotal: 10000, description: 'Flat ₹1,000 Off on orders above ₹10,000' }
    ];
    for (const c of initialCoupons) {
      await db.run(`
        INSERT INTO coupons (code, type, value, minSubtotal, description)
        VALUES (?, ?, ?, ?, ?)
      `, [c.code, c.type, c.value, c.minSubtotal, c.description]);
    }
  }

  // Seed bank_offers table if empty
  const bankOfferCount = await db.get('SELECT COUNT(*) as count FROM bank_offers');
  if (bankOfferCount.count === 0) {
    console.log('Seeding initial bank offers...');
    const initialBankOffers = [
      { id: 'HDFC', bank: 'HDFC Card EMI', desc: 'Flat ₹3,000 Instant Off', type: 'flat', value: 3000, maxDiscount: 3000 },
      { id: 'ICICI', bank: 'ICICI Card', desc: '10% Cashback up to ₹2,500', type: 'percent', value: 10, maxDiscount: 2500 },
      { id: 'SBI', bank: 'SBI Card', desc: 'Flat ₹1,500 Instant Discount', type: 'flat', value: 1500, maxDiscount: 1500 }
    ];
    for (const b of initialBankOffers) {
      await db.run(`
        INSERT INTO bank_offers (id, bank, desc, type, value, maxDiscount)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [b.id, b.bank, b.desc, b.type, b.value, b.maxDiscount]);
    }
  }

  // Seed flash_deal table if empty
  const flashDealCount = await db.get('SELECT COUNT(*) as count FROM flash_deal');
  if (flashDealCount.count === 0) {
    console.log('Seeding initial flash deal of the week...');
    await db.run(`
      INSERT INTO flash_deal (id, product_id, discount, description)
      VALUES (?, ?, ?, ?)
    `, [
      'active',
      'xiaomi-14',
      3500,
      'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
    ]);
  }

  console.log('SQLite database initialized and seeded successfully.');
}

// Start database
initDb().catch(err => {
  console.error('Failed to initialize database:', err);
});

// Helper: map database row to client product object structure
function mapProduct(row) {
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
    features: JSON.parse(row.features),
    inStock: row.inStock === 1
  };
}

// --- API ROUTES ---

// 1. PRODUCTS ENDPOINTS
app.get('/api/products', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM products');
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
    await db.run(`
      INSERT INTO products (
        id, name, brand, category, price, mrp, rating, reviewsCount, imageColor,
        display, processor, ram, storage, backCamera, frontCamera, battery, os, network, weight,
        features, inStock
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      p.id,
      p.name,
      p.brand,
      p.category,
      Number(p.price),
      Number(p.mrp),
      Number(p.rating || 4.5),
      Number(p.reviewsCount || 100),
      p.imageColor,
      specs.display || '',
      specs.processor || '',
      specs.ram || '',
      specs.storage || '',
      specs.backCamera || '',
      specs.frontCamera || '',
      specs.battery || '',
      specs.os || '',
      specs.network || '5G Supported',
      specs.weight || '',
      JSON.stringify(p.features || []),
      p.inStock ? 1 : 0
    ]);

    const created = await db.get('SELECT * FROM products WHERE id = ?', [p.id]);
    res.status(201).json(mapProduct(created));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing) {
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
      // specs fields
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
      // features & stock
      features: body.features !== undefined ? JSON.stringify(body.features) : existing.features,
      inStock: body.inStock !== undefined ? (body.inStock ? 1 : 0) : existing.inStock
    };

    await db.run(`
      UPDATE products SET
        name = ?, brand = ?, category = ?, price = ?, mrp = ?, rating = ?, reviewsCount = ?, imageColor = ?,
        display = ?, processor = ?, ram = ?, storage = ?, backCamera = ?, frontCamera = ?, battery = ?, os = ?, network = ?, weight = ?,
        features = ?, inStock = ?
      WHERE id = ?
    `, [
      updated.name, updated.brand, updated.category, updated.price, updated.mrp, updated.rating, updated.reviewsCount, updated.imageColor,
      updated.display, updated.processor, updated.ram, updated.storage, updated.backCamera, updated.frontCamera, updated.battery, updated.os, updated.network, updated.weight,
      updated.features, updated.inStock, id
    ]);

    const result = await db.get('SELECT * FROM products WHERE id = ?', [id]);
    res.json(mapProduct(result));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM products WHERE id = ?', [id]);
    res.json({ success: true, message: `Product ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/products/reset', async (req, res) => {
  try {
    await db.run('DELETE FROM products');
    for (const p of initialProducts) {
      await db.run(`
        INSERT INTO products (
          id, name, brand, category, price, mrp, rating, reviewsCount, imageColor,
          display, processor, ram, storage, backCamera, frontCamera, battery, os, network, weight,
          features, inStock
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        p.id,
        p.name,
        p.brand,
        p.category,
        p.price,
        p.mrp,
        p.rating || 4.5,
        p.reviewsCount || 100,
        p.imageColor,
        p.specs.display || '',
        p.specs.processor || '',
        p.specs.ram || '',
        p.specs.storage || '',
        p.specs.backCamera || '',
        p.specs.frontCamera || '',
        p.specs.battery || '',
        p.specs.os || '',
        p.specs.network || '5G Supported',
        p.specs.weight || '',
        JSON.stringify(p.features || []),
        p.inStock ? 1 : 0
      ]);
    }
    const rows = await db.all('SELECT * FROM products');
    res.json(rows.map(mapProduct));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 2. COUPONS ENDPOINTS
app.get('/api/coupons', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM coupons');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons', async (req, res) => {
  try {
    const { code, type, value, minSubtotal, description } = req.body;
    const upperCode = code.toUpperCase();
    await db.run(`
      INSERT INTO coupons (code, type, value, minSubtotal, description)
      VALUES (?, ?, ?, ?, ?)
    `, [upperCode, type, Number(value), Number(minSubtotal || 0), description]);
    const created = await db.get('SELECT * FROM coupons WHERE code = ?', [upperCode]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/coupons/:code', async (req, res) => {
  try {
    const { code } = req.params;
    await db.run('DELETE FROM coupons WHERE code = ?', [code.toUpperCase()]);
    res.json({ success: true, message: `Coupon ${code} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/coupons/reset', async (req, res) => {
  try {
    await db.run('DELETE FROM coupons');
    const initialCoupons = [
      { code: 'SHREESHYAM', type: 'flat', value: 2500, minSubtotal: 50000, description: 'Flat ₹2,500 Off on orders above ₹50,000' },
      { code: 'JSS10', type: 'percent', value: 10, minSubtotal: 0, description: '10% Off on all orders' },
      { code: 'FIRSTBUY', type: 'flat', value: 1000, minSubtotal: 10000, description: 'Flat ₹1,000 Off on orders above ₹10,000' }
    ];
    for (const c of initialCoupons) {
      await db.run(`
        INSERT INTO coupons (code, type, value, minSubtotal, description)
        VALUES (?, ?, ?, ?, ?)
      `, [c.code, c.type, c.value, c.minSubtotal, c.description]);
    }
    const rows = await db.all('SELECT * FROM coupons');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3. BANK OFFERS ENDPOINTS
app.get('/api/bank-offers', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM bank_offers');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank-offers', async (req, res) => {
  try {
    const { id, bank, desc, type, value, maxDiscount } = req.body;
    const upperId = id.toUpperCase();
    await db.run(`
      INSERT INTO bank_offers (id, bank, desc, type, value, maxDiscount)
      VALUES (?, ?, ?, ?, ?, ?)
    `, [upperId, bank, desc, type, Number(value), maxDiscount ? Number(maxDiscount) : null]);
    const created = await db.get('SELECT * FROM bank_offers WHERE id = ?', [upperId]);
    res.status(201).json(created);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/bank-offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM bank_offers WHERE id = ?', [id.toUpperCase()]);
    res.json({ success: true, message: `Bank offer ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/bank-offers/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const existing = await db.get('SELECT * FROM bank_offers WHERE id = ?', [id.toUpperCase()]);
    if (!existing) {
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

    await db.run(`
      UPDATE bank_offers SET
        bank = ?, desc = ?, type = ?, value = ?, maxDiscount = ?
      WHERE id = ?
    `, [updated.bank, updated.desc, updated.type, updated.value, updated.maxDiscount, id.toUpperCase()]);

    const result = await db.get('SELECT * FROM bank_offers WHERE id = ?', [id.toUpperCase()]);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/bank-offers/reset', async (req, res) => {
  try {
    await db.run('DELETE FROM bank_offers');
    const initialBankOffers = [
      { id: 'HDFC', bank: 'HDFC Card EMI', desc: 'Flat ₹3,000 Instant Off', type: 'flat', value: 3000, maxDiscount: 3000 },
      { id: 'ICICI', bank: 'ICICI Card', desc: '10% Cashback up to ₹2,500', type: 'percent', value: 10, maxDiscount: 2500 },
      { id: 'SBI', bank: 'SBI Card', desc: 'Flat ₹1,500 Instant Discount', type: 'flat', value: 1500, maxDiscount: 1500 }
    ];
    for (const b of initialBankOffers) {
      await db.run(`
        INSERT INTO bank_offers (id, bank, desc, type, value, maxDiscount)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [b.id, b.bank, b.desc, b.type, b.value, b.maxDiscount]);
    }
    const rows = await db.all('SELECT * FROM bank_offers');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 3.5 FLASH DEAL ENDPOINTS
app.get('/api/flash-deal', async (req, res) => {
  try {
    const deal = await db.get('SELECT * FROM flash_deal WHERE id = ?', ['active']);
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
    await db.run(`
      UPDATE flash_deal SET product_id = ?, discount = ?, description = ?
      WHERE id = ?
    `, [product_id, Number(discount), description, 'active']);
    const updated = await db.get('SELECT * FROM flash_deal WHERE id = ?', ['active']);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/flash-deal/reset', async (req, res) => {
  try {
    await db.run('DELETE FROM flash_deal');
    await db.run(`
      INSERT INTO flash_deal (id, product_id, discount, description)
      VALUES (?, ?, ?, ?)
    `, [
      'active',
      'xiaomi-14',
      3500,
      'Take an extra ₹3,500 direct checkout discount on the acclaimed Xiaomi 14. Features the Leica professional optics system, Snapdragon 8 Gen 3 powerhouse chip, and lightning fast 90W charging.'
    ]);
    const resetDeal = await db.get('SELECT * FROM flash_deal WHERE id = ?', ['active']);
    res.json(resetDeal);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. QUERIES (CALLBACKS & B2B QUOTES) ENDPOINTS
app.get('/api/queries', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM queries ORDER BY date DESC');
    const queries = rows.map(r => ({
      ...r,
      items: r.items ? JSON.parse(r.items) : null
    }));
    res.json(queries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queries', async (req, res) => {
  try {
    const q = req.body;
    await db.run(`
      INSERT INTO queries (
        id, type, date, contactName, phone, email, subject, message,
        companyName, gstNumber, deliveryDate, comments, items, totalVolume, netTotal, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      q.id,
      q.type,
      q.date,
      q.contactName,
      q.phone,
      q.email,
      q.subject || null,
      q.message || null,
      q.companyName || null,
      q.gstNumber || null,
      q.deliveryDate || null,
      q.comments || null,
      q.items ? JSON.stringify(q.items) : null,
      Number(q.totalVolume || 0),
      Number(q.netTotal || 0.0),
      q.status || 'Pending'
    ]);

    const created = await db.get('SELECT * FROM queries WHERE id = ?', [q.id]);
    res.status(201).json({
      ...created,
      items: created.items ? JSON.parse(created.items) : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/queries/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM queries WHERE id = ?', [id]);
    res.json({ success: true, message: `Query ${id} deleted.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/queries/reset', async (req, res) => {
  try {
    await db.run('DELETE FROM queries');
    res.json([]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 5. ORDERS ENDPOINTS
app.get('/api/orders', async (req, res) => {
  try {
    const rows = await db.all('SELECT * FROM orders ORDER BY date DESC');
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
    res.json(orders);
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

    await db.run(`
      INSERT INTO orders (
        id, date, items, subtotal, couponDiscount, bankDiscount, total,
        customerName, customerPhone, customerEmail, customerAddress, customerPincode, paymentMethod, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      o.id,
      o.date,
      JSON.stringify(o.items),
      Number(o.subtotal),
      Number(o.couponDiscount || 0),
      Number(o.bankDiscount || 0),
      Number(o.total),
      customerName,
      customerPhone,
      customerEmail,
      customerAddress,
      customerPincode,
      o.paymentMethod,
      o.status || 'Placed'
    ]);

    const created = await db.get('SELECT * FROM orders WHERE id = ?', [o.id]);
    res.status(201).json({
      ...created,
      items: JSON.parse(created.items)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 6. STRIPE PAYMENT INTENT ENDPOINT (SIMULATION / SANDBOX PRE-REQUISITE)
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency, metadata } = req.body;
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

// Helper function to save orders inside SQLite
async function saveVerifiedOrder(order, paymentMethod) {
  const customerName = order.customerName || (order.customer && order.customer.name) || 'Guest Customer';
  const customerPhone = order.customerPhone || (order.customer && order.customer.phone) || '';
  const customerEmail = order.customerEmail || (order.customer && order.customer.email) || null;
  const customerAddress = order.customerAddress || (order.customer && order.customer.address) || '';
  const customerPincode = order.customerPincode || (order.customer && order.customer.pincode) || '';
  
  await db.run(`
    INSERT INTO orders (
      id, date, items, subtotal, couponDiscount, bankDiscount, total,
      customerName, customerPhone, customerEmail, customerAddress, customerPincode, paymentMethod, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    order.id,
    order.date,
    JSON.stringify(order.items),
    Number(order.subtotal),
    Number(order.couponDiscount || 0),
    Number(order.bankDiscount || 0),
    Number(order.total),
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    customerPincode,
    paymentMethod,
    'Paid'
  ]);
}

// 7. USER AUTHENTICATION & PROFILE ENDPOINTS
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, phone, password, address, pincode } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ error: 'Name, email, phone, and password are required.' });
    }
    const normalizedEmail = email.trim().toLowerCase();
    const existing = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (existing) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }
    const userId = `user-${Date.now()}`;
    await db.run(`
      INSERT INTO users (id, name, email, phone, password, address, pincode)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `, [userId, name.trim(), normalizedEmail, phone.trim(), password, address ? address.trim() : null, pincode ? pincode.trim() : null]);
    const created = await db.get('SELECT id, name, email, phone, address, pincode FROM users WHERE id = ?', [userId]);
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
    const user = await db.get('SELECT * FROM users WHERE email = ?', [normalizedEmail]);
    if (!user || user.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const { password: _, ...safeUser } = user;
    res.json(safeUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/users/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone, address, pincode } = req.body;
    const existing = await db.get('SELECT * FROM users WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }
    await db.run(`
      UPDATE users SET name = ?, phone = ?, address = ?, pincode = ?
      WHERE id = ?
    `, [
      name !== undefined ? name.trim() : existing.name,
      phone !== undefined ? phone.trim() : existing.phone,
      address !== undefined ? address.trim() : existing.address,
      pincode !== undefined ? pincode.trim() : existing.pincode,
      id
    ]);
    const updated = await db.get('SELECT id, name, email, phone, address, pincode FROM users WHERE id = ?', [id]);
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/users/:email/orders', async (req, res) => {
  try {
    const { email } = req.params;
    const rows = await db.all('SELECT * FROM orders WHERE LOWER(customerEmail) = ? ORDER BY date DESC', [email.trim().toLowerCase()]);
    const orders = rows.map(r => ({
      ...r,
      items: JSON.parse(r.items)
    }));
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin-facing order management (update status, delete order)
app.put('/api/orders/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const existing = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (!existing) {
      return res.status(404).json({ error: 'Order not found.' });
    }
    await db.run('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    const updated = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    res.json({
      ...updated,
      items: JSON.parse(updated.items)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/orders/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.run('DELETE FROM orders WHERE id = ?', [id]);
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
