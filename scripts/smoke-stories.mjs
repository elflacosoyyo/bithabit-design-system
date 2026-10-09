// Smoke test: opens every story of the static Storybook in headless Chromium and fails on any page error or console error.
// Usage: npm run build-storybook && npm run test:stories   (SNAPSHOTS=1 also writes PNGs to storybook-snapshots/)
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';
import { ROOT } from './lib.mjs';

const DIR = path.join(ROOT, 'storybook-static');
const SNAP = path.join(ROOT, 'storybook-snapshots');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.ico': 'image/x-icon' };

if (!fs.existsSync(path.join(DIR, 'index.json'))) { console.error('storybook-static/index.json not found. Run `npm run build-storybook` first.'); process.exit(1); }

const server = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  let file = path.join(DIR, decodeURIComponent(url.pathname));
  if (!file.startsWith(DIR)) { res.writeHead(403).end(); return; }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) { res.writeHead(404).end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[path.extname(file)] ?? 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const executablePath = process.env.CHROMIUM_PATH
  ?? ['/opt/pw-browsers/chromium', ...fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`)]
    .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });
const index = JSON.parse(fs.readFileSync(path.join(DIR, 'index.json'), 'utf8'));
const stories = Object.values(index.entries).filter((e) => e.type === 'story');
const combos = [['bithabit', 'light'], ['plandevida', 'dark']];
if (process.env.SNAPSHOTS) fs.mkdirSync(SNAP, { recursive: true });

const failures = [];
let n = 0;
const page = await (await browser.newContext({ viewport: { width: 1280, height: 900 } })).newPage();
// Storybook reports render and play-function failures on its preview channel, not as console errors, so subscribe to it.
await page.addInitScript(() => {
  window.__sb = { events: [] };
  const attach = () => {
    const ch = window.__STORYBOOK_ADDONS_CHANNEL__;
    if (!ch) { setTimeout(attach, 10); return; }
    for (const ev of ['storyRendered', 'storyErrored', 'storyThrewException', 'playFunctionThrewException', 'storyMissing']) {
      ch.on(ev, (payload) => window.__sb.events.push({ ev, message: String((payload && (payload.message || payload.title)) || '') }));
    }
  };
  attach();
});
for (const story of stories) {
  for (const [brand, mode] of combos) {
    const problems = [];
    const onErr = (e) => problems.push(`pageerror: ${e.message}`);
    const onCons = (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) problems.push(`console: ${m.text().slice(0, 300)}`); };
    page.on('pageerror', onErr); page.on('console', onCons);
    await page.goto(`${base}/iframe.html?id=${story.id}&viewMode=story&globals=brand:${brand};mode:${mode}`, { waitUntil: 'load' });
    await page.waitForSelector('#storybook-root > *', { timeout: 15000 }).catch(() => problems.push('nothing rendered in #storybook-root'));
    // Wait for the story (and its play function) to finish: a success or a failure event, whichever comes first.
    await page.waitForFunction(() => window.__sb.events.length > 0, null, { timeout: 20000 }).catch(() => problems.push('story never reported rendered or errored'));
    await page.waitForTimeout(/bottom-sheet/.test(story.id) ? 1100 : 300);
    const events = await page.evaluate(() => window.__sb.events);
    for (const e of events.filter((x) => x.ev !== 'storyRendered')) problems.push(`${e.ev}: ${e.message.slice(0, 300)}`);
    const err = await page.$('.sb-errordisplay.sb-show-errordisplay');
    if (err) problems.push(`storybook error display: ${(await err.innerText()).slice(0, 300).replace(/\s+/g, ' ')}`);
    if (process.env.SNAPSHOTS && (mode === 'dark' || brand === 'bithabit')) await page.screenshot({ path: path.join(SNAP, `${story.id}__${brand}-${mode}.png`), fullPage: true });
    page.off('pageerror', onErr); page.off('console', onCons);
    n++;
    if (problems.length) failures.push({ id: `${story.id} [${brand}/${mode}]`, problems });
  }
}
await browser.close(); server.close();
console.log(`Rendered ${stories.length} stories x ${combos.length} brand/mode combinations (${n} page loads).`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  for (const f of failures) { console.error(`  x ${f.id}`); f.problems.forEach((p) => console.error(`      ${p}`)); }
  process.exit(1);
}
console.log('OK: every story rendered without errors.');
