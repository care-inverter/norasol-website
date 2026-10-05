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

// City solar profiles for high-accuracy calculations
const CITY_SOLAR_DB = {
  islamabad: { name: 'Islamabad', country: 'Pakistan', lat: 33.6844, lon: 73.0479, peakSunHours: 5.5, avgTempC: 28, ghi: 980 },
  rawalpindi: { name: 'Rawalpindi', country: 'Pakistan', lat: 33.5651, lon: 73.0169, peakSunHours: 5.5, avgTempC: 29, ghi: 975 },
  lahore: { name: 'Lahore', country: 'Pakistan', lat: 31.5204, lon: 74.3587, peakSunHours: 5.4, avgTempC: 31, ghi: 960 },
  karachi: { name: 'Karachi', country: 'Pakistan', lat: 24.8607, lon: 67.0011, peakSunHours: 5.8, avgTempC: 30, ghi: 1010 },
  peshawar: { name: 'Peshawar', country: 'Pakistan', lat: 34.0151, lon: 71.5249, peakSunHours: 5.6, avgTempC: 27, ghi: 970 },
  multan: { name: 'Multan', country: 'Pakistan', lat: 30.1575, lon: 71.5249, peakSunHours: 5.9, avgTempC: 33, ghi: 1020 },
  faisalabad: { name: 'Faisalabad', country: 'Pakistan', lat: 31.4504, lon: 73.1350, peakSunHours: 5.5, avgTempC: 30, ghi: 970 },
  quetta: { name: 'Quetta', country: 'Pakistan', lat: 30.1798, lon: 66.9750, peakSunHours: 6.2, avgTempC: 22, ghi: 1050 },
  gujranwala: { name: 'Gujranwala', country: 'Pakistan', lat: 32.1877, lon: 74.1945, peakSunHours: 5.4, avgTempC: 30, ghi: 960 },
  sialkot: { name: 'Sialkot', country: 'Pakistan', lat: 32.4945, lon: 74.5229, peakSunHours: 5.3, avgTempC: 29, ghi: 955 },
};

function calculateAllWattages(cityData) {
  const psh = cityData.peakSunHours || 5.5;
  const sysRatedKw = 3.0; // NORA-3 rated capacity
  const dcArrayKw = 3.3; // Recommended 10% DC oversizing
  
  // Real-time calculation based on solar irradiance
  const peakWattage = Math.round(sysRatedKw * 1000); // 3000 W
  const currentClearWattage = Math.round(Math.min(peakWattage, sysRatedKw * 1000 * ((cityData.ghi || 980) / 1000) * 0.95)); // ~2800 W
  const partlyCloudyWattage = Math.round(currentClearWattage * 0.75); // ~2100 W
  const overcastWattage = Math.round(currentClearWattage * 0.35); // ~980 W
  const rainyStormWattage = Math.round(currentClearWattage * 0.12); // ~330 W
  const dailyKwh = +(psh * sysRatedKw * 0.86).toFixed(1); // e.g. 14.2 kWh/day
  const monthlyUnits = Math.round(dailyKwh * 30); // ~425 units
  const batteryCapacityWh = 2700; // Usable energy of 204V LiFePO4

  return {
    systemRatedWatts: peakWattage,
    dcArrayWatts: Math.round(dcArrayKw * 1000),
    peakSunHours: psh,
    estimatedDailyKwh: dailyKwh,
    estimatedMonthlyUnits: monthlyUnits,
    wattages: {
      peakCapacity: peakWattage,
      clearSunNow: currentClearWattage,
      partlyCloudy: partlyCloudyWattage,
      overcast: overcastWattage,
      stormy: rainyStormWattage,
      night: 0,
      inverterSurgeWatts: 6000,
      batteryDischargeWatts: 3000,
      batteryUsableWh: batteryCapacityWh,
      loadBaseWatts: 550, // Fans + LED + Router + Fridge
      loadNormalWatts: 1500, // Daytime Active (Fans, Lights, PC, TV)
      loadHeavyWatts: 2500, // 1 Ton Inverter AC + Lights + Fans
      maxSafeContinuousLoad: 3000
    }
  };
}

// Location and Solar Wattage API
app.get('/api/location', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lon = parseFloat(req.query.lon);
    const requestedCity = (req.query.city || '').toLowerCase().trim();

    let matchedCity = null;

    if (requestedCity && CITY_SOLAR_DB[requestedCity]) {
      matchedCity = CITY_SOLAR_DB[requestedCity];
    } else if (!isNaN(lat) && !isNaN(lon)) {
      // Find nearest city in database or reverse geocode
      let closest = null;
      let minDistance = Infinity;

      for (const key of Object.keys(CITY_SOLAR_DB)) {
        const c = CITY_SOLAR_DB[key];
        const dist = Math.hypot(c.lat - lat, c.lon - lon);
        if (dist < minDistance) {
          minDistance = dist;
          closest = c;
        }
      }

      // If within ~1.5 degrees, use matched city profile
      if (closest && minDistance < 1.5) {
        matchedCity = { ...closest, lat, lon };
      } else {
        // Generic location calculation
        const absLat = Math.abs(lat);
        const psh = Math.max(4.0, Math.min(6.5, 6.5 - (absLat - 20) * 0.08));
        matchedCity = {
          name: `Location (${lat.toFixed(2)}°, ${lon.toFixed(2)}°)`,
          country: 'Detected Region',
          lat,
          lon,
          peakSunHours: +psh.toFixed(1),
          avgTempC: 28,
          ghi: 950
        };

        // Try external reverse-geocoding if available
        try {
          const geoRes = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`);
          if (geoRes.ok) {
            const geoData = await geoRes.json();
            const cityName = geoData.city || geoData.locality || geoData.principalSubdivision;
            if (cityName) {
              matchedCity.name = cityName;
              matchedCity.country = geoData.countryName || 'Pakistan';
            }
          }
        } catch (e) {
          // Keep generic name on network timeout
        }
      }
    } else {
      matchedCity = CITY_SOLAR_DB.islamabad;
    }

    const calculations = calculateAllWattages(matchedCity);

    return res.json({
      success: true,
      city: matchedCity.name,
      country: matchedCity.country,
      coordinates: { lat: matchedCity.lat, lon: matchedCity.lon },
      temperatureC: matchedCity.avgTempC,
      ghi: matchedCity.ghi,
      peakSunHours: matchedCity.peakSunHours,
      ...calculations
    });
  } catch (err) {
    console.error('Location API error:', err);
    return res.status(500).json({ error: 'Failed to calculate location solar wattages' });
  }
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
