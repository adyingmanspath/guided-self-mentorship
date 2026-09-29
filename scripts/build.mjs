import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const output = join(root, 'dist');

const pages = [
  'index.html',
  '404.html',
  'styles.css',
  'site.js',
  'stories.js',
  'robots.txt',
  'sitemap.xml',
  'assets',
  'about',
  'contact',
  'costs',
  'donate',
  'faqs',
  'graduation-stories',
  'home',
  'how-it-works',
  'the-selfmentorship-blog',
];

rmSync(output, { recursive: true, force: true });
mkdirSync(output, { recursive: true });

for (const page of pages) {
  cpSync(join(root, page), join(output, page), { recursive: true });
}

console.log('Cloudflare Pages output is ready in dist/');
