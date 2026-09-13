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
    console.error('Orders file init note:', err.message);
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

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}

module.exports = {
  ADMIN_PASSWORD,
  RZP_KEY_ID,
  RZP_KEY_SECRET,
  razorpay,
  readOrders,
  saveOrders,
  parseBody,
  setCors,
  crypto
};
