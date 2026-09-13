const { razorpay, readOrders, saveOrders, parseBody, setCors, RZP_KEY_ID } = require('./_common.js');

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

    // Save initial Pending/Abandoned order
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
};
