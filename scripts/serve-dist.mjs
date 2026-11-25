// Serves dist/ the way production nginx does (deploy/nginx/*.conf.template), so
// end-to-end tests see the same behaviour: each page's own prerendered HTML, real
// 404s, the same 301s. `vite preview` cannot do this: it falls back to the home
// page's HTML for every route. No dependencies.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const dist = fileURLToPath(new URL('../dist', import.meta.url));
const port = Number(process.env.PORT ?? 4173);
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.webp': 'image/webp', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml',
  '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain',
};
const redirects = { '/services': '/engineering', '/industries': '/engineering', '/Connect': '/contact', '/connect': '/contact' };

const file = (p) => existsSync(p) && statSync(p).isFile() && p;

createServer((req, res) => {
  const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  if (redirects[path]) return res.writeHead(301, { Location: redirects[path] }).end();
  if (path.length > 1 && path.endsWith('/')) return res.writeHead(301, { Location: path.slice(0, -1) }).end();
  const base = normalize(join(dist, path));
  if (!base.startsWith(dist)) return res.writeHead(400).end();
  const hit = file(base) || file(join(base, 'index.html'));
  if (hit) return res.writeHead(200, { 'Content-Type': types[extname(hit)] ?? 'application/octet-stream' }).end(readFileSync(hit));
  res.writeHead(404, { 'Content-Type': types['.html'] }).end(readFileSync(join(dist, '404.html')));
}).listen(port, () => console.log(`serving dist on http://localhost:${port}`));
