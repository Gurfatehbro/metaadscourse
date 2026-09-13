const http = require('http');
const fs = require('fs');
const path = require('path');
const apiHandler = require('./api/index.js');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain',
  '.pdf': 'application/pdf',
  '.webp': 'image/webp'
};

async function serverHandler(req, res) {
  const urlParts = (req.url || '/').split('?');
  const reqPath = urlParts[0];

  // Route API endpoints to api/index.js
  if (reqPath.startsWith('/api/')) {
    return apiHandler(req, res);
  }

  // Static File Serving (for local development)
  let targetPath = reqPath;
  if (targetPath === '/' || targetPath === '') {
    targetPath = '/index.html';
  } else if (targetPath === '/adminai' || targetPath === '/adminai/') {
    targetPath = '/adminai.html';
  }

  const filePath = path.join(__dirname, targetPath);
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      if (err.code === 'ENOENT') {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('404 Not Found');
      } else {
        res.writeHead(500);
        res.end('500 Server Error: ' + err.code);
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content);
    }
  });
}

const server = http.createServer(serverHandler);

if (require.main === module && !process.env.VERCEL) {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log(`Admin portal available at http://localhost:${PORT}/adminai`);
  });
}

module.exports = serverHandler;
