# NoraSol Website - Cloudflare Workers

**Global edge-computing deployment for the NoraSol solar energy website with AI chat integration.**

## ⚡ Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Authenticate with Cloudflare
```bash
npx wrangler login
```

### 3. Get Groq API Key
- Visit [console.groq.com](https://console.groq.com)
- Create an API key
- Copy the key

### 4. Set Environment Variables
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Select **Workers & Pages** → **norasol-website**
3. Go to **Settings** → **Environment Variables**
4. Add these variables:
   - `GROQ_API_KEY`: Your Groq API key
   - `GROQ_MODEL`: `mixtral-8x7b-32768`

### 5. Deploy
```bash
npm run deploy
```

### 6. Test
```bash
curl -X POST https://norasol-website.workers.dev/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "What is NoraSol?", "sessionMessages": []}'
```

## 📁 Project Structure

```
norasol-website/
├── wrangler.toml              # Cloudflare Workers config
├── package.json               # Dependencies
├── src/
│   ├── index.js              # Main worker entry point
│   ├── handlers/
│   │   ├── chat.js           # Groq AI chat API
│   │   └── static.js         # Static file serving
│   ├── config/
│   │   └── system-prompt.js  # AI system prompt
│   └── server.js             # Legacy Express (reference)
├── Norasol.html              # Main website
├── ai.html                   # AI chat interface
└── DEPLOYMENT.md             # Detailed deployment guide
```

## 🎯 Architecture

- **Workers**: Global edge computing (100,000 requests/day free)
- **Groq API**: Fast LLM inference for NoraSol AI assistant
- **Static Files**: Served from GitHub via CDN
- **Optional KV**: Cloudflare KV for caching
- **Optional R2**: Cloudflare R2 for large assets

## 🚀 Features

✅ **Zero Cold Starts** - Always ready to respond  
✅ **Global Distribution** - Served from 200+ Cloudflare edge locations  
✅ **Cost Effective** - $0.50 per 10M requests  
✅ **Secure** - Server-side API key management  
✅ **Scalable** - Handle millions of requests/month  

## 📖 Full Documentation

See [DEPLOYMENT.md](DEPLOYMENT.md) for:
- Local development setup
- Production optimization
- Monitoring and logs
- Troubleshooting
- Cost estimation

## 🔧 Local Development

```bash
npm run start
```

This starts the development server on `http://localhost:8787`

## 🚢 Production Deployment

```bash
npm run deploy
```

## 📞 Support

- **Email**: info@norasol.net
- **Phone**: +92-51-2200000
- **Website**: www.norasol.net
- **Issues**: [GitHub Issues](https://github.com/care-inverter/norasol-website/issues)

## 📝 License

Private - NoraSol/CARE Pvt. Ltd.

---

**Last Updated**: 2026-07-22
