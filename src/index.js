/**
 * Cloudflare Workers handler for NoraSol website
 * Routes static files and API requests
 */

import { handleStaticFile } from './handlers/static.js';
import { handleChatAPI } from './handlers/chat.js';

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const pathname = url.pathname;

    try {
      // API routes
      if (pathname === '/api/chat' && request.method === 'POST') {
        return await handleChatAPI(request, env, ctx);
      }

      // Handle OPTIONS for CORS preflight
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });
      }

      // Static file routes
      if (pathname === '/' || pathname === '/index.html') {
        return await handleStaticFile('Norasol.html', env, ctx);
      }

      if (pathname === '/ai' || pathname === '/ai.html') {
        return await handleStaticFile('ai.html', env, ctx);
      }

      // Serve other files from images directory
      if (pathname.startsWith('/images/')) {
        const filename = pathname.slice(1);
        return await handleStaticFile(filename, env, ctx);
      }

      // Default 404
      return new Response('Not Found', { status: 404 });
    } catch (error) {
      console.error('Worker error:', error);
      return new Response('Internal Server Error', { status: 500 });
    }
  },
};
