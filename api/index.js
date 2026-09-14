const createOrder = require('./create-order.js');
const verifyPayment = require('./verify-payment.js');
const verifyAccess = require('./verify-access.js');
const downloadPdf = require('./download.js');
const adminLogin = require('./admin/login.js');
const adminOrders = require('./admin/orders.js');
const { setCors } = require('./_common.js');

module.exports = async function handler(req, res) {
  setCors(res);
  const urlParts = (req.url || '/').split('?');
  const reqPath = urlParts[0];

  if (reqPath.endsWith('/create-order')) {
    return createOrder(req, res);
  }
  if (reqPath.endsWith('/verify-payment')) {
    return verifyPayment(req, res);
  }
  if (reqPath.endsWith('/verify-access')) {
    return verifyAccess(req, res);
  }
  if (reqPath.endsWith('/download')) {
    return downloadPdf(req, res);
  }
  if (reqPath.endsWith('/admin/login')) {
    return adminLogin(req, res);
  }
  if (reqPath.endsWith('/admin/orders')) {
    return adminOrders(req, res);
  }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ success: false, error: 'Route not found' }));
};
