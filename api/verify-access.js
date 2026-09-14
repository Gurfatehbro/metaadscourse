const { readOrders, setCors, crypto, RZP_KEY_SECRET } = require('./_common.js');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const order_id = urlObj.searchParams.get('order_id');
  const payment_id = urlObj.searchParams.get('payment_id');
  const token = urlObj.searchParams.get('token');

  if (!order_id || !payment_id || !token) {
    res.writeHead(401, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ valid: false, error: 'Missing security credentials' }));
    return;
  }

  // 1. Verify cryptographic HMAC token
  const expectedToken = crypto.createHmac('sha256', RZP_KEY_SECRET)
    .update(`access:${order_id}:${payment_id}`)
    .digest('hex');

  if (token !== expectedToken) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ valid: false, error: 'Invalid security token' }));
    return;
  }

  // 2. Verify order status in database
  const orders = readOrders();
  const matchedOrder = orders.find(o => 
    (o.order_id === order_id || o.id === order_id) && 
    o.status === 'PAID'
  );

  if (!matchedOrder) {
    res.writeHead(403, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ valid: false, error: 'No confirmed paid order found' }));
    return;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    valid: true,
    order: {
      order_id: matchedOrder.order_id,
      payment_id: matchedOrder.payment_id,
      name: matchedOrder.name,
      amount: matchedOrder.amount,
      paid_date: matchedOrder.paid_date || matchedOrder.date
    }
  }));
};
