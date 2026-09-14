const { ADMIN_PASSWORD, readOrders, setCors, razorpay } = require('../_common.js');

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

  try {
    // 1. Fetch live orders directly from Razorpay Cloud API (100% persistent across Vercel lambdas)
    const rzpOrdersRes = await razorpay.orders.all({ count: 100 });
    const rzpItems = rzpOrdersRes.items || [];

    // Filter for course orders (amount 100 or 24900 or customer notes present)
    const courseOrders = rzpItems.filter(item => {
      const isCourseNote = item.notes && (item.notes.course || item.notes.customer_name);
      return isCourseNote || item.amount === 100 || item.amount === 24900;
    });

    // 2. Read local orders (for payment_id, license keys, or offline entries)
    const localOrders = readOrders();

    const paidOrders = [];
    const abandonedOrders = [];

    // Map all course orders
    courseOrders.forEach(item => {
      const localMatch = localOrders.find(l => l.order_id === item.id);
      const isPaid = item.status === 'paid' || (localMatch && localMatch.status === 'PAID');

      const orderObj = {
        id: item.id,
        order_id: item.id,
        payment_id: (localMatch && localMatch.payment_id) ? localMatch.payment_id : (isPaid ? 'RZP_PAID' : ''),
        amount: item.amount ? (item.amount / 100) : (localMatch ? localMatch.amount : 249),
        status: isPaid ? 'PAID' : 'PENDING',
        name: (item.notes && item.notes.customer_name) ? item.notes.customer_name : ((localMatch && localMatch.name) ? localMatch.name : 'Customer'),
        number: (item.notes && item.notes.customer_number) ? item.notes.customer_number : ((localMatch && localMatch.number) ? localMatch.number : 'N/A'),
        email: (item.notes && item.notes.customer_email && item.notes.customer_email.trim()) ? item.notes.customer_email.trim() : ((localMatch && localMatch.email) ? localMatch.email : 'N/A'),
        license_key: (localMatch && localMatch.license_key) ? localMatch.license_key : '',
        date: new Date((item.created_at || Math.floor(Date.now() / 1000)) * 1000).toISOString()
      };

      if (isPaid) {
        paidOrders.push(orderObj);
      } else {
        abandonedOrders.push(orderObj);
      }
    });

    // Also include any local orders that might not be in Razorpay response
    localOrders.forEach(lo => {
      if (!courseOrders.some(co => co.id === lo.order_id)) {
        if (lo.status === 'PAID') {
          paidOrders.push(lo);
        } else {
          abandonedOrders.push(lo);
        }
      }
    });

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
  } catch (err) {
    console.error('Error fetching admin orders from Razorpay:', err);
    // Fallback to local storage if Razorpay API fails
    const localOrders = readOrders();
    const paidOrders = localOrders.filter(o => o.status === 'PAID');
    const abandonedOrders = localOrders.filter(o => o.status === 'PENDING');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      orders: paidOrders,
      paid_orders: paidOrders,
      abandoned_orders: abandonedOrders,
      total_orders: paidOrders.length,
      total_paid: paidOrders.length,
      total_abandoned: abandonedOrders.length,
      total_revenue: paidOrders.reduce((s, o) => s + (o.amount || 249), 0),
      abandoned_revenue: abandonedOrders.reduce((s, o) => s + (o.amount || 249), 0)
    }));
  }
};
