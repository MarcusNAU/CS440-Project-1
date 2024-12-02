const express = require('express');
const proxy = require('http-proxy-middleware').createProxyMiddleware;

const app = express();

// Proxy Routes
app.use('/auth', proxy({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/journal', proxy({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/', proxy({ target: 'http://localhost:3003', changeOrigin: true }));

app.listen(8080, () => console.log('Gateway running on port 8080'));