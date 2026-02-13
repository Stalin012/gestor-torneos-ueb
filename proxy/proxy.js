const http = require('http');
const httpProxy = require('http-proxy');

const API_PORT = 8000;
const FRONTEND_PORT = 5173;
const PROXY_PORT = 3000;

const proxy = httpProxy.createProxyServer({});

// Manejo de errores del proxy
proxy.on('error', function (err, req, res) {
  console.error('Proxy error:', err);
  res.writeHead(500, {
    'Content-Type': 'text/plain'
  });
  res.end('Something went wrong with the proxy.');
});

const server = http.createServer(function(req, res) {
  if (req.url.startsWith('/api')) {
    console.log(`Proxying API request: ${req.url} to http://localhost:${API_PORT}`);
    proxy.web(req, res, { target: `http://localhost:${API_PORT}` });
  } else {
    console.log(`Proxying Frontend request: ${req.url} to http://localhost:${FRONTEND_PORT}`);
    proxy.web(req, res, { target: `http://localhost:${FRONTEND_PORT}` });
  }
});

console.log(`Proxy server listening on port ${PROXY_PORT}`);
server.listen(PROXY_PORT);
