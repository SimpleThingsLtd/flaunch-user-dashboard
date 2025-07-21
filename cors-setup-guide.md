# CORS Setup Guide for Your API Server

## For Express.js Server:

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'], // Add your frontend URLs
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Your existing routes...
app.get('/v1/base/users/:wallet/positions/', (req, res) => {
  // Your API logic here
});

app.listen(3003, () => {
  console.log('API server running on port 3003');
});
```

## For Fastify Server:

```javascript
const fastify = require('fastify')({ logger: true });

// Register CORS plugin
fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  credentials: true
});

// Your existing routes...
fastify.get('/v1/base/users/:wallet/positions/', async (request, reply) => {
  // Your API logic here
});

fastify.listen(3003, '0.0.0.0');
```

## Manual CORS Headers (for any server):

Add these headers to your API responses:

```
Access-Control-Allow-Origin: http://localhost:3001
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
Access-Control-Allow-Credentials: true
```

## Quick Test:

After adding CORS headers, test your API:

```bash
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3003/v1/base/users/test/positions/
```

This should return CORS headers if properly configured. 