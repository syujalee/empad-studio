// Build step after `vite build` + `vite build --ssr`: injects the server-rendered app and the
// URL-dependent <head> tags into dist/index.html, then writes robots.txt and sitemap.xml.
import { readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = path.join(root, 'dist');
const ssrDir = path.join(root, 'dist-ssr');

const { render, renderHead, SITE_URL } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href);

const templatePath = path.join(distDir, 'index.html');
const template = readFileSync(templatePath, 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--app-head-->')) {
  throw new Error('dist/index.html is missing the <!--app-html--> / <!--app-head--> placeholders.');
}

const appHtml = render();
writeFileSync(templatePath, template.replace('<!--app-head-->', renderHead()).replace('<!--app-html-->', appHtml));

const robots = ['User-agent: *', 'Allow: /'];
if (SITE_URL) {
  robots.push('', `Sitemap: ${SITE_URL}/sitemap.xml`);
  const lastmod = new Date().toISOString().slice(0, 10);
  writeFileSync(path.join(distDir, 'sitemap.xml'), [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url><loc>${SITE_URL}/</loc><lastmod>${lastmod}</lastmod></url>`,
    '</urlset>',
    '',
  ].join('\n'));
} else {
  console.warn('[prerender] VITE_SITE_URL is not set: canonical, og:url, og:image and sitemap.xml were skipped.');
}
writeFileSync(path.join(distDir, 'robots.txt'), `${robots.join('\n')}\n`);

rmSync(ssrDir, { recursive: true, force: true });
console.log(`[prerender] dist/index.html rendered (${(appHtml.length / 1024).toFixed(1)} kB of app HTML).`);
