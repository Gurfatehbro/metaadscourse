const { readOrders, saveOrders, parseBody, setCors, crypto, RZP_KEY_SECRET } = require('./_common.js');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

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

    // Generate Secure Access Token (HMAC signed)
    const access_token = crypto.createHmac('sha256', RZP_KEY_SECRET)
      .update(`access:${razorpay_order_id}:${razorpay_payment_id}`)
      .digest('hex');

    // Update existing Pending order or create new Paid Order
    const orders = readOrders();
    const existingIndex = orders.findIndex(o => o.order_id === razorpay_order_id);

    let verifiedOrder;
    if (existingIndex !== -1) {
      orders[existingIndex].status = 'PAID';
      orders[existingIndex].payment_id = razorpay_payment_id;
      orders[existingIndex].license_key = license_key;
      orders[existingIndex].access_token = access_token;
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
        access_token,
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
      access_token,
      download_url: `/api/download?order_id=${encodeURIComponent(razorpay_order_id)}&payment_id=${encodeURIComponent(razorpay_payment_id)}&token=${encodeURIComponent(access_token)}`
    }));
  } catch (err) {
    console.error('Verify Payment Error:', err);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Payment verification failed' }));
  }
};
