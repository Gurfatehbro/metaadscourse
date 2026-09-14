const fs = require('fs');
const path = require('path');
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
  const viewOnly = urlObj.searchParams.get('view') === '1';

  if (!order_id || !payment_id || !token) {
    res.writeHead(401, { 'Content-Type': 'text/plain' });
    res.end('Unauthorized: Missing payment verification parameters.');
    return;
  }

  // 1. Verify HMAC Token
  const expectedToken = crypto.createHmac('sha256', RZP_KEY_SECRET)
    .update(`access:${order_id}:${payment_id}`)
    .digest('hex');

  if (token !== expectedToken) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden: Invalid access token.');
    return;
  }

  // 2. Verify Order in records
  const orders = readOrders();
  const matchedOrder = orders.find(o => 
    (o.order_id === order_id || o.id === order_id) && 
    o.status === 'PAID'
  );

  if (!matchedOrder) {
    res.writeHead(403, { 'Content-Type': 'text/plain' });
    res.end('Forbidden: No verified paid order found.');
    return;
  }

  // 3. Serve the PDF
  const pdfPath = path.join(__dirname, '..', 'assets', 'Mastering_Facebook_Ads.pdf');
  if (!fs.existsSync(pdfPath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Error: PDF file not found on server.');
    return;
  }

  const stat = fs.statSync(pdfPath);
  const disposition = viewOnly 
    ? 'inline; filename="Mastering_Facebook_Ads.pdf"'
    : 'attachment; filename="Mastering_Facebook_Ads.pdf"';

  res.writeHead(200, {
    'Content-Type': 'application/pdf',
    'Content-Length': stat.size,
    'Content-Disposition': disposition,
    'Cache-Control': 'private, no-cache, no-store, must-revalidate'
  });

  const readStream = fs.createReadStream(pdfPath);
  readStream.pipe(res);
};
