const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const ADMIN_PASSWORD = 'metaadmin';
const RZP_KEY_ID = process.env.RZP_KEY_ID || 'rzp_live_TbXpMHWLFUG29I';
const RZP_KEY_SECRET = process.env.RZP_KEY_SECRET || 'hN7m03Y7tYoJv9EdCS2LByYs';

const razorpay = new Razorpay({
  key_id: RZP_KEY_ID,
  key_secret: RZP_KEY_SECRET
});

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const ORDERS_FILE = isVercel 
  ? path.join('/tmp', 'orders.json') 
  : path.join(__dirname, '..', 'orders.json');

function initOrdersFile() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      const seedFile = path.join(__dirname, '..', 'orders.json');
      if (isVercel && fs.existsSync(seedFile)) {
        try {
          const content = fs.readFileSync(seedFile, 'utf8');
          fs.writeFileSync(ORDERS_FILE, content);
          return;
        } catch (e) {}
      }
      fs.writeFileSync(ORDERS_FILE, JSON.stringify([], null, 2));
    }
  } catch (err) {
    console.error('Orders file initialization note:', err.message);
  }
}
initOrdersFile();

function readOrders() {
  try {
    if (!fs.existsSync(ORDERS_FILE)) {
      initOrdersFile();
    }
    const data = fs.readFileSync(ORDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (e) {
    return [];
  }
}

function saveOrders(orders) {
  try {
    fs.writeFileSync(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (err) {
    console.error('Failed to save orders:', err.message);
  }
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body) {
      if (typeof req.body === 'object') return resolve(req.body);
      if (typeof req.body === 'string') {
        try {
          return resolve(JSON.parse(req.body));
        } catch (e) {
          return resolve({});
        }
      }
    }
    let body = '';
    req.on('data', chunk => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (err) {
        resolve({});
      }
    });
    req.on('error', reject);
  });
}

module.exports = async function handler(req, res) {
  const urlParts = (req.url || '/').split('?');
  const reqPath = urlParts[0];

  // Set standard CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // ==========================================
  // 1. CREATE RAZORPAY ORDER & RECORD PENDING
  // ==========================================
  if (req.method === 'POST' && (reqPath === '/api/create-order' || reqPath.endsWith('/create-order'))) {
    try {
      const { name, number, email } = await parseBody(req);

      const options = {
        amount: 24900, // 249.00 in paise
        currency: 'INR',
        receipt: `rcpt_${Date.now()}`,
        notes: {
          course: 'Mastering Facebook Ads (28-Page PDF Playbook)',
          customer_name: name || '',
          customer_number: number || '',
          customer_email: email || ''
        }
      };

      const order = await razorpay.orders.create(options);

      // Save initial Pending / Abandoned order
      const pendingOrder = {
        id: `ord_${Date.now()}`,
        order_id: order.id,
        amount: 249,
        status: 'PENDING',
        name: (name || '').trim() || 'Anonymous',
        number: (number || '').trim() || 'N/A',
        email: email && email.trim() !== '' ? email.trim() : 'N/A',
        date: new Date().toISOString()
      };

      const orders = readOrders();
      orders.unshift(pendingOrder);
      saveOrders(orders);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        key_id: RZP_KEY_ID
      }));
    } catch (err) {
      console.error('Razorpay Create Order Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        error: err.message || 'Failed to create Razorpay order'
      }));
    }
    return;
  }

  // ==========================================
  // 2. VERIFY PAYMENT & UPDATE TO PAID
  // ==========================================
  if (req.method === 'POST' && (reqPath === '/api/verify-payment' || reqPath.endsWith('/verify-payment'))) {
    try {
      const data = await parseBody(req);
      const {
        razorpay_payment_id,
        razorpay_order_id,
        razorpay_signature,
        name,
        number,
        email
      } = data;

      // Verify Signature
      const hmac = crypto.createHmac('sha256', RZP_KEY_SECRET);
      hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const generatedSignature = hmac.digest('hex');

      const isSignatureValid = generatedSignature === razorpay_signature;

      if (!isSignatureValid) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Payment signature verification failed' }));
        return;
      }

      // Generate Digital License Key
      const license_key = `META-2026-${Math.random().toString(36).substring(2, 7).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Update existing Pending order or create new Paid Order
      const orders = readOrders();
      const existingIndex = orders.findIndex(o => o.order_id === razorpay_order_id);

      let verifiedOrder;
      if (existingIndex !== -1) {
        orders[existingIndex].status = 'PAID';
        orders[existingIndex].payment_id = razorpay_payment_id;
        orders[existingIndex].license_key = license_key;
        orders[existingIndex].paid_date = new Date().toISOString();
        if (name) orders[existingIndex].name = name;
        if (number) orders[existingIndex].number = number;
        if (email && email.trim() !== '') orders[existingIndex].email = email.trim();
        verifiedOrder = orders[existingIndex];
      } else {
        verifiedOrder = {
          id: `ord_${Date.now()}`,
          payment_id: razorpay_payment_id,
          order_id: razorpay_order_id,
          amount: 249,
          status: 'PAID',
          name: name || 'Anonymous',
          number: number || 'N/A',
          email: email && email.trim() !== '' ? email.trim() : 'N/A',
          license_key,
          date: new Date().toISOString()
        };
        orders.unshift(verifiedOrder);
      }

      saveOrders(orders);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: true,
        order: verifiedOrder,
        license_key,
        download_url: 'assets/Mastering_Facebook_Ads.pdf'
      }));
    } catch (err) {
      console.error('Verify Payment Error:', err);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Payment verification failed' }));
    }
    return;
  }

  // ==========================================
  // 3. ADMIN LOGIN
  // ==========================================
  if (req.method === 'POST' && (reqPath === '/api/admin/login' || reqPath.endsWith('/admin/login'))) {
    try {
      const { password } = await parseBody(req);
      if (password === ADMIN_PASSWORD) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          token: `meta_session_${Buffer.from(ADMIN_PASSWORD).toString('base64')}`
        }));
      } else {
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Incorrect password' }));
      }
    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Server error' }));
    }
    return;
  }

  // ==========================================
  // 4. ADMIN GET PAID & ABANDONED ORDERS
  // ==========================================
  if (req.method === 'GET' && (reqPath === '/api/admin/orders' || reqPath.endsWith('/admin/orders'))) {
    const authHeader = req.headers['authorization'] || '';
    const expectedToken = `Bearer meta_session_${Buffer.from(ADMIN_PASSWORD).toString('base64')}`;

    if (authHeader !== expectedToken) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized access to admin portal' }));
      return;
    }

    const allOrders = readOrders();
    const paidOrders = allOrders.filter(o => o.status === 'PAID');
    const abandonedOrders = allOrders.filter(o => o.status === 'PENDING' || o.status === 'ABANDONED');
    const totalRevenue = paidOrders.reduce((sum, o) => sum + (o.amount || 249), 0);
    const abandonedRevenue = abandonedOrders.reduce((sum, o) => sum + (o.amount || 249), 0);

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      orders: paidOrders,
      paid_orders: paidOrders,
      abandoned_orders: abandonedOrders,
      total_orders: paidOrders.length,
      total_paid: paidOrders.length,
      total_abandoned: abandonedOrders.length,
      total_revenue: totalRevenue,
      abandoned_revenue: abandonedRevenue
    }));
    return;
  }

  // Default API 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: `API route ${reqPath} not found` }));
};
