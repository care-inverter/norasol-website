/**
 * LEGACY FILE: Kept for reference only
 * This is the original Node.js Express server.
 * For Cloudflare Workers deployment, use src/index.js instead.
 * 
 * To run this locally for reference:
 * 1. npm install express cors
 * 2. set GROQ_API_KEY=your_key
 * 3. node src/server.js
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_MODEL = process.env.GROQ_MODEL;

if (!GROQ_API_KEY) {
  console.warn('WARNING: GROQ_API_KEY is not set in environment variables.');
}

const SYSTEM_PROMPT = `You are the official AI Assistant for NoraSol, an indigenous solar energy technology company in Pakistan.`;

const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';

app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionMessages } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required' });
    }

    const history = Array.isArray(sessionMessages) ? sessionMessages : [];
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];

    const response = await fetch(groqUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(GROQ_MODEL ? { model: GROQ_MODEL } : {}),
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => '');
      return res.status(response.status).json({ error: 'Groq request failed', details: text });
    }

    const data = await response.json();
    const assistantReply = data?.choices?.[0]?.message?.content;

    return res.json({ reply: assistantReply || '' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`NoraSol chat server running on http://localhost:${port}`);
});
