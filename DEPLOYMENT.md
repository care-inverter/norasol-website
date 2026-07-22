# NoraSol Website - Cloudflare Workers Deployment Guide

This repository has been configured for deployment on **Cloudflare Workers**, providing global edge computing, automatic scaling, and zero cold-start latency.

## Architecture Overview

```
┌─────────────────────────────────────┐
│   Cloudflare Workers (src/index.js) │
├─────────────────────────────────────┤
│  ✓ Static file serving              │
│  ✓ API routing (/api/chat)          │
│  ✓ Groq AI integration              │
│  ✓ Global edge distribution         │
└─────────────────────────────────────┘
```

## Project Structure

```
norasol-website/
├── wrangler.toml              # Cloudflare Workers configuration
├── package.json               # Updated for Workers (ES modules)
├── src/
│   ├── index.js              # Main worker entry point
│   ├── handlers/
│   │   ├── chat.js           # Chat API handler
│   │   └── static.js         # Static file serving
│   ├── config/
│   │   └── system-prompt.js  # NoraSol AI system prompt
│   └── server.js             # Legacy Express (reference only)
├── Norasol.html              # Main website
├── ai.html                   # AI chat interface
├── images/                   # Assets directory
└── DEPLOYMENT.md             # This file
```

## Prerequisites

1. **Cloudflare Account** - Sign up at [cloudflare.com](https://cloudflare.com)
2. **Node.js 16+** - Download from [nodejs.org](https://nodejs.org)
3. **Groq API Key** - Get from [console.groq.com](https://console.groq.com)
4. **Wrangler CLI** - Installed via npm (included in package.json)

## Local Development

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create a `.env.local` file from the template:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Groq API key:

```env
GROQ_API_KEY=gsk_your_actual_api_key_here
GROQ_MODEL=mixtral-8x7b-32768
```

### 3. Start Local Development Server

```bash
npm run start
```

This launches `wrangler dev` on `http://localhost:8787`

### 4. Test the API

```bash
curl -X POST http://localhost:8787/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "Tell me about NoraSol", "sessionMessages": []}'
```

## Deployment to Cloudflare

### Step 1: Authenticate with Cloudflare

```bash
npx wrangler login
```

This opens your browser to authorize the Wrangler CLI.

### Step 2: Set Environment Variables in Cloudflare Dashboard

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers** → **Your Worker** (after first deploy)
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

| Variable Name | Value |
|---|---|
| `GROQ_API_KEY` | Your Groq API key |
| `GROQ_MODEL` | `mixtral-8x7b-32768` (or your preferred model) |

### Step 3: Deploy

```bash
npm run deploy
```

The worker will be deployed to:
- **URL**: `https://norasol-website.workers.dev`
- **Custom Domain** (optional): Configure in Cloudflare Dashboard

### Step 4: Verify Deployment

```bash
curl -X POST https://norasol-website.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is NoraSol?", "sessionMessages": []}'
```

## Production Optimizations

### 1. Enable Caching for Static Assets

Static files are cached for 1 hour locally and 24 hours after CDN cache, reducing bandwidth usage.

### 2. Store Files in Cloudflare KV (Optional)

For even faster serving, upload static files to Cloudflare KV:

```bash
npx wrangler kv:key put --binding=KV_STORE --path Norasol.html
```

### 3. Use Cloudflare R2 for Large Assets (Optional)

For images and PDFs, use R2 storage:

1. Create an R2 bucket in Cloudflare Dashboard
2. Update `wrangler.toml` with your R2 bucket details
3. Upload assets via the Cloudflare Dashboard or API

## Monitoring & Logs

### View Live Logs

```bash
npx wrangler tail
```

### Monitor Errors in Dashboard

1. Go to Cloudflare Dashboard → Workers
2. Click your worker name
3. View **Logs** or **Analytics**

## API Endpoints

### POST `/api/chat`

Send a message to the NoraSol AI assistant.

**Request:**
```json
{
  "message": "What is NoraSol?",
  "sessionMessages": [
    {
      "role": "assistant",
      "content": "NoraSol is..."
    }
  ]
}
```

**Response:**
```json
{
  "reply": "NoraSol is an indigenous solar energy technology company..."
}
```

### GET `/`

Returns the main website (Norasol.html)

### GET `/ai`

Returns the AI chat interface (ai.html)

## Troubleshooting

### Issue: "GROQ_API_KEY not found"

**Solution**: Set the environment variable in Cloudflare Dashboard → Settings → Environment Variables

### Issue: Static files returning 404

**Solution**: Upload files to Cloudflare KV using:
```bash
npx wrangler kv:key put --binding=KV_STORE --path Norasol.html
```

### Issue: CORS errors from browser

**Solution**: The API handler includes CORS headers. Check that:
1. The request is to `/api/chat`
2. Content-Type is `application/json`
3. Method is `POST`

### Issue: Rate limiting from Groq API

**Solution**: 
- Upgrade your Groq plan
- Implement request caching
- Reduce `max_tokens` in the prompt

## Cost Estimation

**Cloudflare Workers**: 
- Free tier: 100,000 requests/day
- Paid: $0.50 per 10 million requests (after free tier)

**Groq API** (depends on your plan):
- Check [groq.com pricing](https://groq.com)

**Total**: Very cost-effective for small to medium traffic

## Next Steps

1. ✅ Deploy the worker
2. ✅ Set up custom domain (optional)
3. ✅ Monitor performance
4. ✅ Optimize static file delivery
5. ✅ Scale to production

## Support

For issues or questions:
- Email: info@norasol.net
- Phone: +92-51-2200000
- GitHub Issues: [care-inverter/norasol-website/issues](https://github.com/care-inverter/norasol-website/issues)

---

**Last Updated**: 2026-07-22
