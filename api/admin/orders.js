const { ADMIN_PASSWORD, readOrders, setCors } = require('../_common.js');

module.exports = async function handler(req, res) {
  setCors(res);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  if (req.method !== 'GET') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    return;
  }

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
};
