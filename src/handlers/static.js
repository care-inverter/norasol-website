/**
 * Static file handler
 * Serves HTML and other static assets
 */

// MIME type mapping
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export async function handleStaticFile(filepath, env, ctx) {
  try {
    // Get the file extension
    const ext = filepath.substring(filepath.lastIndexOf('.')).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    // Try to get file from Cloudflare KV store if available
    if (env.KV_STORE) {
      try {
        const fileContent = await env.KV_STORE.get(filepath);
        if (fileContent) {
          return new Response(fileContent, {
            status: 200,
            headers: {
              'Content-Type': contentType,
              'Cache-Control': 'public, max-age=3600',
            },
          });
        }
      } catch (kvError) {
        console.warn('KV lookup failed, falling back to GitHub:', kvError);
      }
    }

    // Fallback: Fetch from GitHub raw content
    // This is the primary delivery method until files are uploaded to KV or R2
    const githubUrl = `https://raw.githubusercontent.com/care-inverter/norasol-website/main/${filepath}`;
    const response = await fetch(githubUrl);

    if (response.ok) {
      const content = await response.arrayBuffer();
      return new Response(content, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
        },
      });
    }

    return new Response('File not found', { status: 404 });
  } catch (error) {
    console.error('Static file handler error:', error);
    return new Response('Internal server error', { status: 500 });
  }
}
