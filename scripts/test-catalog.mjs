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
const swipe = async (locator, dx) => {
  await locator.scrollIntoViewIfNeeded(); // mouse events outside the viewport are dropped
  const b = await locator.boundingBox();
  const y = b.y + b.height / 2;
  const x0 = b.x + b.width / 2;
  await page.mouse.move(x0, y);
  await page.mouse.down();
  for (let i = 1; i <= 8; i++) { await page.mouse.move(x0 + (dx * i) / 8, y); await page.waitForTimeout(16); }
  await page.mouse.up();
};
await step('icon button: press, then ignored while loading', async () => {
  await go(page, '/components/icon-button', 'bithabit', 'light');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  const button = region.getByRole('button', { name: 'New habit' });
  await button.click();
  await page.waitForFunction(() => /Pressed 1 times/.test(document.querySelector('[data-testid="icon-button-count"]')?.textContent ?? ''), null, { timeout: 4000 });
  assert.equal(await button.getAttribute('aria-busy'), 'true');
  await button.click({ force: true });
  await page.waitForTimeout(200);
  assert.match(await region.getByTestId('icon-button-count').textContent(), /Pressed 1 times/, 'a loading icon button must not fire onPress');
});
await step('habit card: swipe right toggles, swipe left asks to delete', async () => {
  await go(page, '/components/habit-card', 'bithabit', 'light');
  const region = page.getByRole('region', { name: 'Swipeable', exact: true });
  await swipe(region.getByTestId('swipe-0'), 140);
  await page.waitForFunction(() => /Read ten pages: toggled/.test(document.querySelector('[data-testid="swipe-status"]')?.textContent ?? ''), null, { timeout: 4000 });
  await swipe(region.getByTestId('swipe-1'), -140);
  await page.waitForFunction(() => /Drink water: delete requested/.test(document.querySelector('[data-testid="swipe-status"]')?.textContent ?? ''), null, { timeout: 4000 });
  const before = await region.getByTestId('swipe-2').count();
  await swipe(region.getByTestId('swipe-2'), 40); // a short drag springs back and does nothing
  await page.waitForTimeout(350);
  assert.equal(await region.getByTestId('swipe-2').count(), before);
  assert.doesNotMatch(await region.getByTestId('swipe-status').textContent(), /Evening walk/, 'a short drag must not trigger an action');
});
await step('drawer menu: open, pick a section, close', async () => {
  await go(page, '/components/drawer-menu', 'plandevida', 'light');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  assert.equal(await region.getByRole('navigation').count(), 0);
  await region.getByRole('button', { name: 'Open menu' }).click();
  const menu = region.getByRole('navigation', { name: 'Menú' });
  await menu.waitFor({ timeout: 4000 });
  assert.equal(await menu.getByRole('button', { name: 'Plan de Vida' }).getAttribute('aria-current'), 'page');
  await menu.getByRole('button', { name: 'Estadísticas' }).click();
  await menu.waitFor({ state: 'detached', timeout: 4000 });
  assert.match(await region.getByTestId('drawer-current').textContent(), /Estadísticas/);
  await region.getByRole('button', { name: 'Open menu' }).click();
  await menu.waitFor({ timeout: 4000 });
  await region.getByTestId('drawer-overlay').click({ position: { x: 5, y: 200 } });
  await menu.waitFor({ state: 'detached', timeout: 4000 });
});
await step('home screen: complete, swipe, delete with confirmation, open detail', async () => {
  await go(page, '/screens/home', 'bithabit', 'light');
  const phone = page.getByRole('group', { name: 'Home screen' });
  const boxes = phone.getByRole('checkbox');
  assert.equal(await boxes.count(), 4);
  assert.equal(await boxes.nth(1).getAttribute('aria-checked'), 'false');
  await boxes.nth(1).click();
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Home screen"] [role=checkbox]')[1].getAttribute('aria-checked') === 'true', null, { timeout: 4000 });
  await swipe(phone.getByTestId('card-first'), 140); // the first card starts completed, so a swipe right undoes it
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Home screen"] [role=checkbox]')[0].getAttribute('aria-checked') === 'false', null, { timeout: 4000 });
  await swipe(phone.getByTestId('card-1'), -140);
  const alert = page.getByRole('alertdialog');
  await alert.waitFor({ timeout: 4000 });
  assert.match(await alert.textContent(), /Delete habit/);
  await alert.getByRole('button', { name: 'Cancel' }).click();
  assert.equal(await boxes.count(), 4, 'cancel keeps the card');
  await swipe(phone.getByTestId('card-1'), -140);
  await alert.waitFor({ timeout: 4000 });
  await alert.getByRole('button', { name: 'Delete' }).click();
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Home screen"] [role=checkbox]').length === 3, null, { timeout: 4000 });
  await phone.getByRole('button', { name: /^Evening walk,/ }).click({ position: { x: 30, y: 20 } });
  const sheet = phone.getByRole('dialog', { name: 'Habit detail' });
  await sheet.waitFor({ timeout: 4000 });
  assert.match(await sheet.textContent(), /Evening walk/);
  await phone.getByTestId('bottom-sheet-backdrop').click({ position: { x: 20, y: 40 } });
  await sheet.waitFor({ state: 'detached', timeout: 4000 });
});
await step('home screen: the data stays when you leave and come back, and Reset restores it', async () => {
  await page.getByRole('link', { name: 'Menu', exact: true }).click();
  await page.waitForSelector('main[data-route="/screens/menu"]', { timeout: 4000 });
  await page.getByRole('link', { name: 'Home', exact: true }).click();
  await page.waitForSelector('main[data-route="/screens/home"]', { timeout: 4000 });
  assert.equal(await page.getByRole('group', { name: 'Home screen' }).getByRole('checkbox').count(), 3, 'the deleted card is still deleted');
  await page.getByRole('button', { name: 'Reset demo data' }).click();
  await page.getByRole('button', { name: 'Empty', exact: true }).click(); // switching state remounts the phone
  await page.getByRole('button', { name: 'With norms', exact: true }).click();
  await page.waitForFunction(() => document.querySelectorAll('[aria-label="Home screen"] [role=checkbox]').length === 4, null, { timeout: 4000 });
});
await step('home screen: empty and all-completed states', async () => {
  await go(page, '/screens/home', 'plandevida', 'dark');
  await page.getByRole('button', { name: 'Empty', exact: true }).click();
  await page.getByText('No hay normas programadas para hoy').waitFor({ timeout: 4000 });
  await page.getByRole('button', { name: 'All completed', exact: true }).click();
  await page.waitForFunction(() => { const c = [...document.querySelectorAll('[aria-label="Home screen"] [role=checkbox]')]; return c.length === 4 && c.every((x) => x.getAttribute('aria-checked') === 'true'); }, null, { timeout: 4000 });
});
await step('prototype: navigate with the menu, mail alert, new norm sheet', async () => {
  await go(page, '/screens/prototype', 'bithabit', 'light');
  const phone = page.getByRole('group', { name: 'App prototype' });
  await phone.getByRole('button', { name: 'Open menu' }).click();
  const menu = phone.getByRole('navigation', { name: 'Menu' });
  await menu.waitFor({ timeout: 4000 });
  await menu.getByRole('button', { name: 'Contact us' }).click();
  const alert = page.getByRole('alertdialog');
  await alert.waitFor({ timeout: 4000 });
  assert.match(await alert.textContent(), /No mail app is available/);
  await alert.getByRole('button', { name: 'OK' }).click();
  await menu.getByRole('button', { name: 'Stats' }).click();
  await menu.waitFor({ state: 'detached', timeout: 4000 });
  await phone.getByTestId('pending-screen').waitFor({ timeout: 4000 });
  assert.equal(await phone.getByRole('heading', { name: 'Stats' }).count(), 1);
  assert.equal(await page.locator('[data-pin-layer] button').count(), 0, 'a placeholder section has no annotations');
  await phone.getByRole('button', { name: 'Open menu' }).click();
  await menu.waitFor({ timeout: 4000 });
  await menu.getByRole('button', { name: 'My account' }).click();
  await menu.waitFor({ state: 'detached', timeout: 4000 });
  await phone.getByRole('heading', { name: 'My account' }).waitFor({ timeout: 4000 });
  await phone.getByRole('button', { name: 'Open menu' }).click();
  await menu.getByRole('button', { name: 'Home', exact: true }).click();
  await menu.waitFor({ state: 'detached', timeout: 4000 });
  await phone.getByTestId('card-first').waitFor({ timeout: 4000 });
  await phone.getByRole('button', { name: 'New habit' }).click();
  await phone.getByRole('dialog', { name: 'New habit' }).waitFor({ timeout: 4000 });
});
for (const [id, labelsByState] of [['home', ['With norms', 'Empty', 'All completed', 'Detail open', 'Detail history']], ['menu', ['Open', 'Account active']]]) {
  await step(`screen "${id}": every annotation is attached to an element that exists`, async () => {
    await go(page, `/screens/${id}`, 'bithabit', 'light');
    const ids = await page.locator('[data-annotation]').evaluateAll((els) => els.map((e) => e.getAttribute('data-annotation')));
    assert.ok(ids.length >= 5, `${id}: expected annotations, found ${ids.length}`);
    const seen = new Set();
    const collect = async () => { for (const l of await page.locator('[data-pin-layer] button').evaluateAll((els) => els.map((e) => e.textContent.trim()))) seen.add(l); };
    for (const label of labelsByState) {
      await page.getByRole('button', { name: label, exact: true }).click();
      await page.waitForTimeout(700);
      await collect();
      if (id === 'home' && label === 'With norms') { // the delete alert only exists after a swipe
        await swipe(page.getByTestId('card-1'), -140);
        await page.getByRole('alertdialog').waitFor({ timeout: 4000 });
        await page.waitForTimeout(500);
        await collect();
        await page.getByRole('alertdialog').getByRole('button', { name: 'Cancel' }).click();
      }
    }
    const missing = ids.filter((a) => !seen.has(a));
    assert.deepEqual(missing, [], `${id}: annotation(s) ${missing.join(', ')} match no element in any state (check the target ids in screens/${id}/${id}.screen.yaml)`);
  });
}
await step('calendar day: mark days up to today, future days are inert', async () => {
  await go(page, '/components/calendar-day', 'bithabit', 'light');
  const region = page.getByRole('region', { name: 'Interactive week', exact: true });
  const day = region.getByTestId('week-day-6');
  assert.equal(await day.getAttribute('aria-pressed'), 'true');
  await day.click();
  await page.waitForFunction(() => document.querySelector('[aria-label="Interactive week"] [data-testid="week-day-6"]')?.getAttribute('aria-pressed') === 'false', null, { timeout: 4000 });
  const future = region.getByTestId('week-day-10');
  assert.equal(await future.getAttribute('aria-disabled'), 'true');
  assert.match(await region.getByTestId('week-day-9').getAttribute('aria-label'), /Friday, October 9, today, not completed/);
  assert.equal(await region.getByTestId('week-day-9').getAttribute('aria-current'), 'date');
});
await step('month calendar: toggle a past day, today, and not a future day', async () => {
  await go(page, '/components/month-calendar', 'plandevida', 'light');
  const region = page.getByRole('region', { name: 'Interactive', exact: true });
  assert.ok(await region.getByRole('group', { name: 'Octubre de 2026' }).count() === 1, 'month title is localized and capitalized');
  const toggle = async (date, expected) => {
    await region.getByTestId(`day-${date}`).click();
    await page.waitForFunction(([d, v]) => document.querySelector(`[aria-label="Interactive"] [data-testid="day-${d}"]`)?.getAttribute('aria-pressed') === v, [date, expected], { timeout: 4000 });
  };
  assert.equal(await region.getByTestId('day-2026-10-09').getAttribute('aria-pressed'), 'false');
  await toggle('2026-10-09', 'true');
  await toggle('2026-10-04', 'false'); // seeded as done
  const future = region.getByTestId('day-2026-10-15');
  assert.equal(await future.getAttribute('aria-disabled'), 'true');
  await future.click({ force: true });
  await page.waitForTimeout(150);
  assert.equal(await future.getAttribute('aria-pressed'), 'false', 'a future day must not change');
  assert.match(await region.getByTestId('day-2026-10-09').getAttribute('aria-label'), /Viernes, 9 de octubre, hoy, completado/);
});
await step('home screen: the detail sheet is 70% of the screen on every tab', async () => {
  await go(page, '/screens/home', 'bithabit', 'light');
  await page.getByRole('button', { name: 'Detail open', exact: true }).click();
  const phone = page.getByRole('group', { name: 'Home screen' });
  const sheet = phone.getByRole('dialog', { name: 'Habit detail' });
  await sheet.waitFor({ timeout: 4000 });
  await page.waitForTimeout(500);
  const ratio = async () => { const s = await sheet.boundingBox(); const p = await phone.boundingBox(); return s.height / p.height; };
  for (const tab of ['Habit', 'Notes', 'History']) {
    await sheet.getByRole('tab', { name: tab, exact: true }).click();
    await page.waitForTimeout(250);
    const r = await ratio();
    assert.ok(Math.abs(r - 0.7) < 0.01, `tab ${tab}: sheet is ${(r * 100).toFixed(1)}% of the screen, expected 70%`);
  }
});
await step('home screen: the detail sheet shows the history calendar', async () => {
  await go(page, '/screens/home', 'bithabit', 'light');
  await page.getByRole('button', { name: 'Detail history', exact: true }).click();
  const phone = page.getByRole('group', { name: 'Home screen' });
  const sheet = phone.getByRole('dialog', { name: 'Habit detail' });
  await sheet.waitFor({ timeout: 4000 });
  await sheet.getByRole('group', { name: 'October 2026' }).waitFor({ timeout: 4000 });
  await sheet.getByRole('group', { name: 'September 2026' }).waitFor({ timeout: 4000 });
  await sheet.getByTestId('day-2026-10-09').click();
  await page.waitForFunction(() => document.querySelector('[role=dialog] [data-testid="day-2026-10-09"]')?.getAttribute('aria-pressed') === 'true', null, { timeout: 4000 });
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
