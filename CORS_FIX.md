# CORS Fix Guide

## 🚨 **Current Issue:**
Your frontend (port 3002) is trying to access your API server (port 3003), but the API server doesn't allow cross-origin requests.

## 🔧 **Solution: Add CORS Headers to Your API Server**

### **For Express.js API Server:**

```javascript
const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for your frontend
app.use(cors({
  origin: ['http://localhost:3002', 'http://localhost:3001'], // Allow both ports
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Handle preflight OPTIONS requests
app.options('*', cors());

// Your existing routes
app.get('/v1/base/users/:wallet/positions', (req, res) => {
  // Your API logic here
});

app.listen(3003, () => {
  console.log('API server running on port 3003 with CORS enabled');
});
```

### **For Fastify API Server:**

```javascript
const fastify = require('fastify')({ logger: true });

// Register CORS plugin
await fastify.register(require('@fastify/cors'), {
  origin: ['http://localhost:3002', 'http://localhost:3001'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Your existing routes
fastify.get('/v1/base/users/:wallet/positions', async (request, reply) => {
  // Your API logic here
});

fastify.listen({ port: 3003, host: '0.0.0.0' });
```

### **Manual CORS Headers (Any Framework):**

Add these headers to ALL responses from your API server:

```javascript
// Before sending any response, add these headers:
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3002');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
res.setHeader('Access-Control-Allow-Credentials', 'true');

// Handle OPTIONS preflight requests specifically
if (req.method === 'OPTIONS') {
  res.status(200).end();
  return;
}
```

## 🧪 **Test Your Fix:**

1. **Restart your API server** after adding CORS headers

2. **Test the OPTIONS request:**
   ```bash
   curl -X OPTIONS http://localhost:3003/v1/base/users/test/positions \
     -H "Origin: http://localhost:3002" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: content-type" \
     -v
   ```

3. **Look for these headers in the response:**
   ```
   Access-Control-Allow-Origin: http://localhost:3002
   Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
   Access-Control-Allow-Headers: content-type
   ```

4. **Test your app** - CORS errors should be gone!

## 🔄 **Alternative: Update Frontend Port**

If you want your frontend to run on port 3001 instead of 3002:

1. **Stop your Next.js dev server**
2. **Update your package.json:**
   ```json
   {
     "scripts": {
       "dev": "next dev -p 3001"
     }
   }
   ```
3. **Restart:** `npm run dev`

## ⚡ **Quick Docker Fix:**

If your API server runs in Docker, make sure it's exposed properly:

```dockerfile
# In your Dockerfile
EXPOSE 3003

# In docker-compose.yml
ports:
  - "3003:3003"
```

## 🎯 **Expected Result:**

After fixing CORS, your API calls should work without errors and you'll see live data from your API server on port 3003! 