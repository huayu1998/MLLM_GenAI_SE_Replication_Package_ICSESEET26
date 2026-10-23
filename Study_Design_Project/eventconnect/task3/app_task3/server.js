/**
 * Minimal static file server for the EventConnect app — Node built-ins only
 * (node:http / node:fs / node:path), no Express, no npm install, no
 * node_modules. Run it with:
 *
 *   node server.js
 *
 * then open the printed URL. On GitHub Codespaces the port is forwarded
 * automatically and VS Code offers an "Open in Browser" button.
 *
 * The server is deliberately dumb: it knows nothing about events or
 * registrations. All app data still lives in the browser's localStorage
 * (see js/services/EventStore.js and js/services/RegistrationStore.js), so
 * none of the app files needed to change. Opening index.html directly via
 * file:// also still works.
 *
 * No SPA fallback rewrite is needed either — js/Router.js is hash-based, so
 * routes like #/event/3 never reach the server; every request is just a file.
 */

const http = require('node:http');
const fs   = require('node:fs');
const path = require('node:path');

const ROOT = __dirname;
// Codespaces sets PORT in some configurations; 3002 keeps node3 and node2
// (which defaults to 3001) runnable side by side.
const PORT = Number(process.env.PORT) || 3002;
// 0.0.0.0 rather than 127.0.0.1 — Codespaces can only forward a port that is
// bound on all interfaces.
const HOST = '0.0.0.0';

// Browsers reject a stylesheet served as text/plain and refuse to execute a
// script with a non-JS type, so every extension the app ships must be mapped.
const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg':  'image/svg+xml',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.webp': 'image/webp',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt':  'text/plain; charset=utf-8',
};

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Length': Buffer.byteLength(body), ...headers });
  res.end(body);
}

/**
 * Map a request URL to a file inside ROOT, or null if it escapes ROOT.
 * Returning null (rather than the resolved path) is what stops "../../"
 * traversal from reaching files outside the app folder.
 */
function resolvePath(requestUrl) {
  // Strip the query string and hash, then decode %20 etc.
  const { pathname } = new URL(requestUrl, 'http://localhost');
  let decoded;
  try {
    decoded = decodeURIComponent(pathname);
  } catch {
    return null; // malformed percent-encoding
  }

  const relative = decoded === '/' ? 'index.html' : decoded.replace(/^\/+/, '');
  const resolved = path.resolve(ROOT, relative);

  if (resolved !== ROOT && !resolved.startsWith(ROOT + path.sep)) return null;
  return resolved;
}

const server = http.createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    send(res, 405, 'Method Not Allowed', { 'Content-Type': 'text/plain; charset=utf-8', 'Allow': 'GET, HEAD' });
    return;
  }

  const filePath = resolvePath(req.url);
  if (!filePath) {
    send(res, 403, 'Forbidden', { 'Content-Type': 'text/plain; charset=utf-8' });
    return;
  }

  fs.stat(filePath, (err, stats) => {
    // A directory request ("/foo/") serves that directory's index.html, which
    // keeps relative <link>/<script> hrefs in the HTML resolving correctly.
    const target = !err && stats.isDirectory() ? path.join(filePath, 'index.html') : filePath;

    fs.readFile(target, (readErr, data) => {
      if (readErr) {
        console.log(`${req.method} ${req.url} -> 404`);
        send(res, 404, 'Not Found', { 'Content-Type': 'text/plain; charset=utf-8' });
        return;
      }

      const type = MIME_TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream';
      res.writeHead(200, {
        'Content-Type': type,
        'Content-Length': data.length,
        // The study apps are edited between runs; never let a stale cached
        // copy hide a change.
        'Cache-Control': 'no-cache',
      });
      res.end(req.method === 'HEAD' ? undefined : data);
    });
  });
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Start on another port with:  PORT=3002 node server.js`);
    process.exit(1);
  }
  throw err;
});

server.listen(PORT, HOST, () => {
  console.log(`EventConnect (node3) is running.`);
  console.log(`  Open  http://localhost:${PORT}/`);
  console.log(`  (On Codespaces, use the forwarded URL from the Ports panel.)`);
  console.log(`  Press Ctrl+C to stop.`);
});
