// Opens catalog/index.html as a FILE (file://, no server, network blocked) in headless Chromium.
// Fails on any console/page error, any network request, a wrongly themed page, or a failing interaction.
// Usage: npm run build-catalog && npm run test:catalog   (SNAPSHOTS=1 also writes PNGs to catalog-snapshots/)
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { chromium } from 'playwright-core';
import { ROOT } from './lib.mjs';

const FILE = path.join(ROOT, 'catalog/index.html');
if (!fs.existsSync(FILE)) { console.error('catalog/index.html not found. Run `npm run build-catalog` first.'); process.exit(1); }
const URL_BASE = pathToFileURL(FILE).href;
const SNAP = path.join(ROOT, 'catalog-snapshots');
if (process.env.SNAPSHOTS) fs.mkdirSync(SNAP, { recursive: true });

const executablePath = process.env.CHROMIUM_PATH
  ?? ['/opt/pw-browsers/chromium', ...(fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers').filter((d) => d.startsWith('chromium-')).map((d) => `/opt/pw-browsers/${d}/chrome-linux/chrome`) : [])]
    .find((p) => fs.existsSync(p) && fs.statSync(p).isFile());
const browser = await chromium.launch({ executablePath, args: ['--no-sandbox'] });

const failures = [];
const fail = (where, msg) => failures.push(`${where}: ${msg}`);
const rgb = (hex) => { const n = parseInt(hex.slice(1), 16); return `rgb(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255})`; };
const CANVAS = { 'bithabit/light': rgb('#FFFFFF'), 'bithabit/dark': rgb('#030712'), 'plandevida/light': rgb('#FFFFFF'), 'plandevida/dark': rgb('#131210') };

async function openPage() {
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();
  const problems = [];
  const external = [];
  // The catalog must be self-contained: any request to the network is a failure.
  await context.route(/^https?:/, (route) => { external.push(route.request().url()); route.abort(); });
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));
  page.on('console', (m) => { if (m.type() === 'error') problems.push(`console: ${m.text().slice(0, 300)}`); });
  return { page, problems, external, context };
}

const go = async (page, route, brand, mode) => {
  await page.goto(`${URL_BASE}#${route}?brand=${brand}&mode=${mode}`);
  await page.reload(); // a hash-only change would not reload; reload proves a cold load of every route
  await page.waitForSelector(`main[data-route="${route}"]`, { timeout: 8000 }).catch(() => { throw new Error(`page ${route} never rendered`); });
};

// ---------- 1. every page, two brand/mode combinations, cold load ----------
const first = await openPage();
await first.page.goto(URL_BASE);
await first.page.waitForSelector('main[data-route]');
const { routes, brands } = await first.page.evaluate(() => window.__CATALOG__);
assert.ok(routes.length >= 15, `expected at least 15 routes, found ${routes.length}`);
assert.ok(brands.includes('bithabit') && brands.includes('plandevida'));
await first.context.close();

const combos = [['bithabit', 'light'], ['plandevida', 'dark']];
let loads = 0;
for (const [brand, mode] of combos) {
  const { page, problems, external, context } = await openPage();
  for (const route of routes) {
    problems.length = 0;
    try { await go(page, route, brand, mode); } catch (e) { fail(`${route} [${brand}/${mode}]`, `${e.message}${problems.length ? ' | ' + problems.join(' | ') : ''}`); continue; }
    if (/bottom-sheet/.test(route)) await page.waitForTimeout(900); else await page.waitForTimeout(120);
    const bg = await page.evaluate(() => getComputedStyle(document.querySelector('.content')).backgroundColor);
    if (bg !== CANVAS[`${brand}/${mode}`]) fail(`${route} [${brand}/${mode}]`, `canvas is ${bg}, expected ${CANVAS[`${brand}/${mode}`]}`);
    const empty = await page.evaluate(() => document.querySelector('main .content').textContent.trim().length < 20);
    if (empty) fail(`${route} [${brand}/${mode}]`, 'page rendered (almost) no text');
    problems.forEach((p) => fail(`${route} [${brand}/${mode}]`, p));
    if (process.env.SNAPSHOTS) await page.screenshot({ path: path.join(SNAP, `${route.replace(/^\//, '').replace(/\//g, '--') || 'home'}__${brand}-${mode}.png`), fullPage: true });
    loads++;
  }
  external.forEach((u) => fail(`[${brand}/${mode}]`, `network request to ${u}`));
  await context.close();
}

// ---------- 2. interactions ----------
const { page, problems, external, context } = await openPage();
const step = async (name, fn) => {
  problems.length = 0;
  try { await fn(); } catch (e) { fail(`interaction "${name}"`, e.message.split('\n')[0]); }
  await page.waitForTimeout(150);
  problems.forEach((p) => fail(`interaction "${name}"`, p)); // errors are attributed to the step that caused them
};
const expectAttr = async (loc, attr, value) => {
  await page.waitForFunction(([sel, a, v]) => document.querySelector(sel)?.getAttribute(a) === v, [loc.__sel, attr, value], { timeout: 4000 }).catch(() => { throw new Error(`${loc.__name} did not get ${attr}="${value}"`); });
};
void expectAttr;

await step('button: press, disabled and loading', async () => {
  await go(page, '/components/button', 'bithabit', 'light');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  const status = region.locator('p[aria-live]');
  assert.match(await status.textContent(), /Added 0 times\. Not saved yet\./);
  await region.getByRole('button', { name: 'Add norm', exact: true }).click();
  await page.waitForFunction(() => /Added 1 time\./.test(document.querySelector('[aria-label="Interactive"] p[aria-live]')?.textContent ?? ''), null, { timeout: 4000 });
  const disabled = region.getByRole('button', { name: 'Add norm (disabled)' });
  assert.equal(await disabled.getAttribute('aria-disabled'), 'true');
  await disabled.click({ force: true });
  await page.waitForTimeout(150);
  assert.match(await status.textContent(), /Added 1 time\./, 'a disabled button must not fire onPress');
  await region.getByRole('button', { name: 'Save changes' }).click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Interactive"] [aria-label="Save changes"]')?.getAttribute('aria-busy') === 'true', null, { timeout: 2000 });
  await page.waitForFunction(() => /Saved\./.test(document.querySelector('[aria-label="Interactive"] p[aria-live]')?.textContent ?? ''), null, { timeout: 4000 });
  assert.equal(await region.getByRole('button', { name: 'Save changes' }).getAttribute('aria-busy'), 'false');
});
await step('habit card: complete a habit', async () => {
  await go(page, '/components/habit-card', 'plandevida', 'light');
  const list = page.getByRole('region', { name: 'Interactive list' });
  const boxes = list.getByRole('checkbox');
  assert.equal(await boxes.nth(1).getAttribute('aria-checked'), 'false');
  await boxes.nth(1).click();
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Interactive list"] [role=checkbox][aria-checked=true]').length === 2, null, { timeout: 4000 });
  assert.ok(await list.getByRole('button', { name: /Evangelio del día, completed today$/ }).count() >= 1, 'card name did not change to completed');
});
await step('checkbox: toggle and disabled', async () => {
  await go(page, '/components/checkbox', 'bithabit', 'light');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  const first = region.getByRole('checkbox', { name: 'Unchecked example' });
  await first.click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Interactive"] [aria-label="Unchecked example"]')?.getAttribute('aria-checked') === 'true', null, { timeout: 4000 });
  assert.equal(await region.getByRole('checkbox', { name: 'Disabled example' }).getAttribute('aria-disabled'), 'true');
});
await step('segmented control: switch tab', async () => {
  await go(page, '/components/segmented-control', 'bithabit', 'dark');
  const tabs = page.getByRole('region', { name: 'Interactive', exact: true }).getByRole('tablist').first().getByRole('tab');
  assert.equal(await tabs.nth(0).getAttribute('aria-selected'), 'true');
  await tabs.nth(1).click();
  await page.waitForFunction(() => { const t = document.querySelectorAll('[aria-label="Interactive"] [role=tablist]')[0].querySelectorAll('[role=tab]'); return t[1].getAttribute('aria-selected') === 'true' && t[0].getAttribute('aria-selected') === 'false'; }, null, { timeout: 4000 });
});
await step('bottom sheet: open and close with the backdrop', async () => {
  await go(page, '/components/bottom-sheet', 'plandevida', 'dark');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  assert.equal(await region.getByRole('dialog').count(), 0);
  await region.getByRole('button', { name: 'Open sheet' }).click();
  await region.getByRole('dialog').waitFor({ timeout: 4000 });
  assert.equal(await region.getByRole('dialog').getAttribute('aria-modal'), 'true');
  await region.getByTestId('bottom-sheet-backdrop').click({ position: { x: 10, y: 10 } });
  await region.getByRole('dialog').waitFor({ state: 'detached', timeout: 4000 });
});
await step('toolbar: switching brand and mode re-themes the page and keeps the route', async () => {
  await go(page, '/foundations/colors', 'bithabit', 'light');
  await page.getByLabel('Brand').selectOption('plandevida');
  await page.getByRole('button', { name: 'Dark' }).click();
  await page.waitForFunction((c) => getComputedStyle(document.querySelector('.content')).backgroundColor === c, CANVAS['plandevida/dark'], { timeout: 4000 });
  const hash = await page.evaluate(() => location.hash);
  assert.match(hash, /^#\/foundations\/colors\?/);
  assert.match(hash, /brand=plandevida/);
  assert.match(hash, /mode=dark/);
  await page.getByRole('link', { name: 'Typography' }).click();
  await page.waitForSelector('main[data-route="/foundations/typography"]');
  assert.match(await page.evaluate(() => location.hash), /brand=plandevida.*mode=dark|mode=dark.*brand=plandevida/, 'brand and mode survive navigation');
});
await step('spec page: links between guides navigate inside the catalog', async () => {
  await go(page, '/components/habit-card/spec', 'bithabit', 'light');
  await page.locator('.usage-md').getByRole('link', { name: 'Checkbox' }).first().click();
  await page.waitForSelector('main[data-route="/components/checkbox/spec"]', { timeout: 4000 });
  assert.match(await page.evaluate(() => location.hash), /brand=bithabit/);
});
await step('display font follows the brand (Yrsa for Plan de Vida)', async () => {
  await go(page, '/foundations/typography', 'plandevida', 'light');
  const fam = await page.evaluate(() => getComputedStyle(document.querySelector('.content h1')).fontFamily);
  assert.match(fam, /Yrsa/);
  const loaded = await page.evaluate(async () => { await document.fonts.ready; return document.fonts.check('500 20px Yrsa'); });
  assert.ok(loaded, 'Yrsa is not loaded (the font must be embedded in the file)');
});
external.forEach((u) => fail('interactions', `network request to ${u}`));
await context.close();
await browser.close();

console.log(`Opened catalog/index.html as a file: ${routes.length} pages x ${combos.length} brand/mode combinations (${loads} cold loads), network blocked.`);
if (failures.length) {
  console.error(`\n${failures.length} failure(s):`);
  failures.forEach((f) => console.error(`  x ${f}`));
  process.exit(1);
}
console.log('OK: every page renders without errors, the file needs no network, and the interactions work.');
