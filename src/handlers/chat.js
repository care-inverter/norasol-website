/**
 * Chat API handler for Groq AI integration
 */

import { SYSTEM_PROMPT } from '../config/system-prompt.js';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

export async function handleChatAPI(request, env, ctx) {
  // Validate request method
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  try {
    // Parse request body
    const body = await request.json().catch(() => ({}));
    const { message, sessionMessages } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: 'message is required and must be a string' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Validate API key
    const GROQ_API_KEY = env.GROQ_API_KEY;
    if (!GROQ_API_KEY) {
      console.warn('WARNING: GROQ_API_KEY is not set in environment variables.');
      return new Response(
        JSON.stringify({ error: 'API key not configured' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Build message history
    const history = Array.isArray(sessionMessages) ? sessionMessages : [];
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history,
      { role: 'user', content: message },
    ];

    // Call Groq API
    const groqResponse = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: env.GROQ_MODEL || 'mixtral-8x7b-32768',
        messages,
        temperature: 0.3,
        max_tokens: 800,
      }),
    });

    // Handle Groq response
    if (!groqResponse.ok) {
      const errorText = await groqResponse.text().catch(() => 'Unknown error');
      console.error('Groq API error:', groqResponse.status, errorText);
      return new Response(
        JSON.stringify({
          error: 'Groq API request failed',
          details: errorText,
        }),
        {
          status: groqResponse.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const groqData = await groqResponse.json();
    const assistantReply = groqData?.choices?.[0]?.message?.content || '';

    return new Response(JSON.stringify({ reply: assistantReply }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('Chat handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
