// Writes one static HTML document per page, so every URL has its own content,
// title, description, canonical and Open Graph data without running JavaScript.
// Runs after `vite build` (client) and `vite build --ssr` (dist-ssr/entry-server.js).
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ssr = join(root, 'dist-ssr');
const { render, pages, siteUrl, structuredData } = await import(pathToFileURL(join(ssr, 'entry-server.js')).href);

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const attr = (s) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// JSON inside <script> must not be able to close the element.
const json = (o) => JSON.stringify(o).replace(/</g, '\\u003c');

const written = [];
for (const [path, meta] of Object.entries(pages)) {
  const notFound = path === '/404';
  const url = `${siteUrl}${path === '/' ? '/' : path}`;
  const head = [
    `<meta name="description" content="${attr(meta.description)}" />`,
    notFound ? '<meta name="robots" content="noindex" />' : `<link rel="canonical" href="${url}" />`,
    '<meta property="og:type" content="website" />',
    '<meta property="og:site_name" content="Qsofte" />',
    `<meta property="og:title" content="${attr(meta.title)}" />`,
    `<meta property="og:description" content="${attr(meta.description)}" />`,
    notFound ? '' : `<meta property="og:url" content="${url}" />`,
    '<meta name="twitter:card" content="summary" />',
    structuredData[path] ? `<script type="application/ld+json">${json(structuredData[path])}</script>` : '',
  ]
    .filter(Boolean)
    .join('\n    ');

  const body = render(notFound ? '/__not-found__' : path);
  const html = template
    .replace(/<title>[^<]*<\/title>/, `<title>${attr(meta.title)}</title>`)
    .replace('<!--page-meta-->', head)
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`);
  if (!html.includes('<h1')) throw new Error(`prerender: ${path} rendered no <h1>`);

  const file = path === '/' ? 'index.html' : notFound ? '404.html' : `${path.slice(1)}/index.html`;
  mkdirSync(dirname(join(dist, file)), { recursive: true });
  writeFileSync(join(dist, file), html);
  if (!meta.noindex) written.push(url);
}

writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${written
    .map((u) => `  <url><loc>${u}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
rmSync(ssr, { recursive: true, force: true });
console.log(`prerendered ${Object.keys(pages).length} pages; sitemap lists ${written.length}`);
