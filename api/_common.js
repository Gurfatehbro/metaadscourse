const fs = require('fs');
const path = require('path');
const https = require('https');
const crypto = require('crypto');
const Razorpay = require('razorpay');

const ADMIN_PASSWORD = 'metaadmin';
const RZP_KEY_ID = process.env.RZP_KEY_ID || 'rzp_live_TbXpMHWLFUG29I';
const RZP_KEY_SECRET = process.env.RZP_KEY_SECRET || 'hN7m03Y7tYoJv9EdCS2LByYs';

const FB_PIXEL_ID = process.env.FB_PIXEL_ID || '1998153387510750';
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN || 'EAAZAiBgzT8CoBSeFB65Vb1nQNzEzC6LgC6jBPrQwDrEqWR1PderomghcEG1AOZAbKvQjFQG9ZAD7OqZAS7m4ObjnFxTYnGtUPn3gHXwX5SLkohlQl7nNsaQZAoF8htva4uuwombDI1rRD2F6Jkww7vfBOQMLJ0p4tnWHk7jZCLJ0Yo4OJuhLcikoMIy8pyOQZDZD';

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

function hashSha256(str) {
  if (!str) return null;
  return crypto.createHash('sha256').update(String(str).trim()).digest('hex');
}

function sendMetaCapiEvent({ eventName, eventId, email, phone, name, amount = 249, currency = 'INR', sourceUrl, customData = {} }, req = null) {
  return new Promise((resolve) => {
    try {
      const userData = {};

      // 1. Hash Email
      if (email && email.includes('@')) {
        userData.em = [hashSha256(email.trim().toLowerCase())];
      }

      // 2. Hash Phone (standardize to 91XXXXXXXXXX if 10 digits)
      if (phone) {
        let cleanPhone = String(phone).replace(/[^0-9]/g, '');
        if (cleanPhone.length === 10) cleanPhone = '91' + cleanPhone;
        userData.ph = [hashSha256(cleanPhone)];
      }

      // 3. Hash First Name
      if (name) {
        const firstName = name.trim().split(' ')[0].toLowerCase();
        userData.fn = [hashSha256(firstName)];
      }

      // 4. IP & User Agent
      if (req && req.headers) {
        const rawIp = req.headers['x-forwarded-for'] || req.headers['x-real-ip'] || (req.socket && req.socket.remoteAddress);
        if (rawIp) {
          userData.client_ip_address = String(rawIp).split(',')[0].trim();
        }
        if (req.headers['user-agent']) {
          userData.client_user_agent = req.headers['user-agent'];
        }
      }

      const eventPayload = {
        data: [
          {
            event_name: eventName || 'Purchase',
            event_time: Math.floor(Date.now() / 1000),
            event_id: eventId || `ev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
            event_source_url: sourceUrl || (req && req.headers && (req.headers.referer || req.headers.origin)) || 'https://metaadscourse.com',
            action_source: 'website',
            user_data: userData,
            custom_data: {
              currency: currency,
              value: Number(amount) || 249.00,
              content_name: 'Mastering Facebook Ads (28-Page PDF Playbook)',
              content_type: 'product',
              ...customData
            }
          }
        ]
      };

      const payloadString = JSON.stringify(eventPayload);
      const postReq = https.request(`https://graph.facebook.com/v19.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payloadString)
        },
        timeout: 4000
      }, (postRes) => {
        let resBody = '';
        postRes.on('data', chunk => (resBody += chunk));
        postRes.on('end', () => {
          try {
            const parsed = JSON.parse(resBody);
            resolve({ success: postRes.statusCode === 200, data: parsed });
          } catch (e) {
            resolve({ success: postRes.statusCode === 200, raw: resBody });
          }
        });
      });

      postReq.on('error', (err) => {
        console.error('Meta CAPI Request Error:', err.message);
        resolve({ success: false, error: err.message });
      });

      postReq.on('timeout', () => {
        postReq.destroy();
        resolve({ success: false, error: 'Meta CAPI Timeout' });
      });

      postReq.write(payloadString);
      postReq.end();
    } catch (err) {
      console.error('sendMetaCapiEvent Exception:', err.message);
      resolve({ success: false, error: err.message });
    }
  });
}

module.exports = {
  ADMIN_PASSWORD,
  RZP_KEY_ID,
  RZP_KEY_SECRET,
  FB_PIXEL_ID,
  FB_ACCESS_TOKEN,
  sendMetaCapiEvent,
  razorpay,
  readOrders,
  saveOrders,
  parseBody,
  setCors,
  crypto
};
