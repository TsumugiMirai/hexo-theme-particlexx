import { mkdirSync, writeFileSync, readFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import * as solid from '@fortawesome/free-solid-svg-icons';
import * as brands from '@fortawesome/free-brands-svg-icons';
const names = ['house','user','steam','github','tv','bilibili','envelope','link','sun','moon','magnifying-glass','bars','xmark','rss','chevron-down','calendar','bookmark','tags'];
const icons = {};
for (const value of [...Object.values(solid), ...Object.values(brands)]) {
  if (!value?.iconName || !names.includes(value.iconName)) continue;
  const [w,h,,,paths] = value.icon;
  icons[value.iconName] = `<svg class="px-icon" viewBox="0 0 ${w} ${h}" aria-hidden="true" focusable="false">${[paths].flat().map(d=>`<path fill="currentColor" d="${d}"/>`).join('')}</svg>`;
}
mkdirSync('lib', { recursive: true });
writeFileSync('lib/icons.json', JSON.stringify(icons));
const manifest = JSON.parse(readFileSync('source/assets/manifest.json', 'utf8'));
writeFileSync('lib/manifest.json', JSON.stringify(manifest));
// Artalk is kept as a separate, self-hosted optional resource.
for (const [from, ext] of [['node_modules/artalk/dist/Artalk.js','js'],['node_modules/artalk/dist/Artalk.css','css']]) {
  const bytes=readFileSync(from), hash=createHash('sha256').update(bytes).digest('hex').slice(0,12);
  const name=`artalk-${hash}.${ext}`;
  copyFileSync(from, `source/assets/${name}`);
  manifest[`artalk.${ext}`]={file:name};
}
writeFileSync('lib/manifest.json', JSON.stringify(manifest));
