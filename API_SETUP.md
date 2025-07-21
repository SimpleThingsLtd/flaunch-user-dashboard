# API Setup Guide

## 🔧 Direct API Connection Setup

Your app is now configured to make direct API calls to your live API server.

### 1. Environment Configuration

Create a `.env.local` file in your project root:

```bash
# API Server Configuration
NEXT_PUBLIC_API_URL=http://localhost:3003
```

### 2. Start Your API Server

Make sure your API server is running on port 3003:

```bash
# Example commands (adjust based on your setup)
cd /path/to/your/api-server
npm start
# OR
docker-compose up
# OR
yarn start
```

### 3. Enable CORS on Your API Server

Since you're making cross-origin requests, your API server needs CORS headers.

**For Express.js:**
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3001', // Your frontend URL
  credentials: true
}));
```

**For Fastify:**
```javascript
await fastify.register(require('@fastify/cors'), {
  origin: 'http://localhost:3001'
});
```

**Manual CORS Headers:**
```javascript
res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
```

### 4. API Endpoint Requirements

Your API server should respond to:
- **GET** `/v1/base/users/{walletAddress}/positions`
- **Return JSON** in this format:

```json
{
  "data": [
    {
      "tokenAddress": "0x...",
      "symbol": "TOKEN",
      "name": "Token Name",
      "balanceFormatted": "100.5",
      "positionSizePercentage": "0.1",
      "pnl": {
        "currentValueUSDC": "100.50",
        "percentageReturn": "10.5",
        "isProfit": true
      }
    }
  ],
  "pagination": { "limit": 50, "offset": 0 },
  "meta": { "network": "mainnet", "timestamp": 123456789 }
}
```

### 5. Testing

Test your API directly:
```bash
curl http://localhost:3003/v1/base/users/0x1234567890abcdef1234567890abcdef12345678/positions
```

### 6. Common Issues

**Connection Refused:**
- Make sure your API server is running on port 3003
- Check if another service is using that port

**CORS Errors:**
- Add CORS headers to your API server (see step 3)
- Make sure the origin matches your frontend URL

**404 Errors:**
- Verify the endpoint path matches exactly
- Check if your API expects trailing slashes or not

### 7. Alternative Ports

If your API server runs on a different port, update your `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:YOUR_PORT
``` 