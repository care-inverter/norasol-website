import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';
import { SYSTEM_PROMPT } from './src/config/system-prompt.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors({ origin: true }));
app.use(express.json({ limit: '1mb' }));

// Serve Images directory (both /Images and /images for case insensitivity)
const imagesDir = path.join(__dirname, 'Images');
app.use('/Images', express.static(imagesDir));
app.use('/images', express.static(imagesDir));

// Serve root static files (css, js, html, media)
app.use(express.static(__dirname));

// HTML Page Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/Norasol.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'Norasol.html'));
});

app.get('/ai', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai.html'));
});

app.get('/ai.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'ai.html'));
});

// Fallback rule-based generator for NoraSol inquiries when external AI keys are not configured
function generateLocalReply(query) {
  const q = (query || '').toLowerCase();

  if (q.includes('price') || q.includes('cost') || q.includes('rate') || q.includes('roi') || q.includes('saving')) {
    return 'Our systems typically achieve full return on investment (ROI) within 2 to 3 years through immediate grid electricity bill reductions. A 3 kW solar PV system produces ~13.5 kWh daily (~405 units/month), saving ~PKR 12,600 monthly (~PKR 150,000 annually) at utility rates of PKR 35/unit. For exact system pricing and quotes, please contact us on WhatsApp at +92 322 8650402.';
  }

  if (q.includes('nora-3') || q.includes('nora3') || q.includes('inverter') || q.includes('hybrid')) {
    return 'The NORA-3 is an indigenously engineered 3.0 kW single-phase hybrid solar inverter with an integrated 204V LiFePO4 battery pack (3.06 kWh total / 2.7 kWh usable). It features whisper-quiet acoustic thermal design up to 60°C, zero-export protection via an integrated Current Transformer (CT) sensor without requiring a green net meter, and an integrated BMS with >= 6,000 cycle life.';
  }

  if (q.includes('norastore') || q.includes('battery') || q.includes('batteries') || q.includes('storage') || q.includes('lifepo4')) {
    return 'Our NoraStore series includes scalable LiFePO4 battery storage solutions: NoraStore-5 (51.2V, 100Ah, 5.12 kWh, parallel expandable up to 16 units / 81.92 kWh), NoraStore-12 (51.2V, 230Ah, ~12 kWh), and NoraStore-16 (51.2V, 314Ah, 16 kWh with CAN/RS485 and Wi-Fi). Each unit provides >= 6,000 cycles for 12-15 years of daily use.';
  }

  if (q.includes('contact') || q.includes('whatsapp') || q.includes('phone') || q.includes('email') || q.includes('address') || q.includes('office')) {
    return 'You can reach NoraSol directly via WhatsApp at +92 322 8650402, email at info@norasol.net, or visit our office at Plot 424, Service Road E, I-9/3, Islamabad, Pakistan.';
  }

  if (q.includes('compete') || q.includes('growatt') || q.includes('inverex') || q.includes('tesla') || q.includes('huawei')) {
    return "I can only speak explicitly to NoraSol systems. Unlike generic imported brands, our NORA-3 system is indigenously engineered specifically for Pakistan's thermal profile, operates with whisper-quiet low-acoustic cooling, and possesses an integrated CT sensor for zero-export protection without requiring a green meter connection.";
  }

  return 'NoraSol is an indigenous solar energy technology company in Pakistan, developed as a subsidiary of CARE Pvt. Ltd. We design robust hybrid inverters and LiFePO4 batteries engineered specifically to withstand extreme heat, dust, and frequent load-shedding. How can we assist you with our solar or storage setups today?';
}

// Chat API Endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, sessionMessages } = req.body || {};

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'message is required and must be a string' });
    }

    const history = Array.isArray(sessionMessages) ? sessionMessages : [];
    const groqKey = process.env.GROQ_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    // 1. Try Groq API if key is available
    if (groqKey) {
      try {
        const groqUrl = 'https://api.groq.com/openai/v1/chat/completions';
        const groqModel = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
        const messages = [
          { role: 'system', content: SYSTEM_PROMPT },
          ...history,
          { role: 'user', content: message },
        ];

        const response = await fetch(groqUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${groqKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: groqModel,
            messages,
            temperature: 0.3,
            max_tokens: 800,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const assistantReply = data?.choices?.[0]?.message?.content;
          if (assistantReply) {
            return res.json({ reply: assistantReply });
          }
        } else {
          console.warn('Groq API request responded with status:', response.status);
        }
      } catch (groqErr) {
        console.warn('Groq API call error:', groqErr.message);
      }
    }

    // 2. Try Gemini API if key is available
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const contents = [];
        for (const msg of history) {
          if (msg.role === 'user') {
            contents.push({ role: 'user', parts: [{ text: msg.content }] });
          } else if (msg.role === 'assistant') {
            contents.push({ role: 'model', parts: [{ text: msg.content }] });
          }
        }
        contents.push({ role: 'user', parts: [{ text: message }] });

        const result = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
            temperature: 0.3,
          },
        });

        if (result && result.text) {
          return res.json({ reply: result.text });
        }
      } catch (geminiErr) {
        console.warn('Gemini API call error:', geminiErr.message);
      }
    }

    // 3. Fallback to NoraSol local knowledge base if external LLM keys are absent/unavailable
    const fallbackReply = generateLocalReply(message);
    return res.json({ reply: fallbackReply });
  } catch (err) {
    console.error('Chat endpoint error:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.listen(port, host, () => {
  console.log(`NoraSol website and chat server running at http://${host}:${port}`);
});
