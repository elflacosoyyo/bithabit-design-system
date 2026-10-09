// Design-system linter. Exit code 1 on any error. Warnings (waived contrast debt, open questions) never fail the run.
import fs from 'node:fs';
import path from 'node:path';
import Ajv from 'ajv/dist/2020.js';
import {
  MODES, listBrands, loadRaw, loadResolved, flatten, readJSON, readYAML, exists, contrast, parseHex, listFiles, ROOT,
} from './lib.mjs';
import { loadSpecs } from './specs.mjs';

const errors = [], warnings = [];
const err = (m) => errors.push(m);
const warn = (m) => warnings.push(m);
const ajv = new Ajv({ allErrors: true, strict: false });
const fmt = (e) => (e ?? []).map((x) => `${x.instancePath || '/'} ${x.message}`).join('; ');

const brands = listBrands();
const resolved = {};

// ---- 1. Tokens resolve, modes have parity, component layer uses references only
for (const b of brands) {
  for (const m of MODES) {
    try { resolved[`${b}/${m}`] = loadResolved(b, m); }
    catch (e) { err(`[tokens] ${b}/${m}: ${e.message}`); }
  }
  const [l, d] = [resolved[`${b}/light`], resolved[`${b}/dark`]];
  if (l && d) {
    const lk = new Set(l.keys()), dk = new Set(d.keys());
    for (const k of lk) if (!dk.has(k)) err(`[tokens] ${b}: "${k}" exists in light but not in dark`);
    for (const k of dk) if (!lk.has(k)) err(`[tokens] ${b}: "${k}" exists in dark but not in light`);
  }
  for (const m of MODES) {
    for (const [p, t] of loadRaw(b, m)) {
      if (t.$layer === 'component' && t.$type === 'color' && !/^\{.+\}$/.test(String(t.$value))) {
        err(`[tokens] ${p}: component tokens must reference semantic colors, found literal "${t.$value}"`);
      }
    }
  }
}

// ---- 2. Brand definitions
const brandSchema = ajv.compile(readJSON('schemas/brand.schema.json'));
const pairsDoc = readYAML('tokens/contrast-pairs.yaml');
const pairIds = new Set(pairsDoc.pairs.map((p) => p.id));
for (const b of brands) {
  const meta = readYAML(`brands/${b}/brand.yaml`);
  if (!brandSchema(meta)) err(`[brand] ${b}/brand.yaml: ${fmt(brandSchema.errors)}`);
  if (meta.id !== b) err(`[brand] ${b}: id "${meta.id}" must equal the folder name`);
  if (meta.extends && !brands.includes(meta.extends)) err(`[brand] ${b}: extends unknown brand "${meta.extends}"`);
  for (const f of ['primitive.json', 'typography.json', 'semantic.light.json', 'semantic.dark.json']) {
    if (!exists(`brands/${b}/${f}`)) err(`[brand] ${b}: missing ${f}`);
  }
  for (const v of Object.values(meta.logo ?? {})) {
    if (typeof v === 'string' && v.startsWith('brands/') && !exists(v)) err(`[brand] ${b}: logo file not found: ${v}`);
  }
  for (const w of meta.accessibility?.waivers ?? []) {
    const base = w.pair.replace(/\*$/, '');
    if (![...pairIds].some((id) => id.startsWith(base))) err(`[brand] ${b}: waiver ${w.id} targets unknown pair "${w.pair}"`);
  }
  // Overrides may only touch tokens that exist in the base semantic layer or in the brand's own primitives.
  for (const m of MODES) {
    const known = new Set([
      ...flatten(readJSON('tokens/semantic/typography.json'), 's').keys(),
      ...flatten(readJSON(`tokens/semantic/${m}.json`), 's').keys(),
    ]);
    for (const p of flatten(readJSON(`brands/${b}/semantic.${m}.json`), 's').keys()) {
      if (!known.has(p)) err(`[brand] ${b}: semantic.${m}.json overrides unknown token "${p}"`);
    }
  }
}

// ---- 2b. Compat naming targets exist
const compat = readYAML('tokens/compat.yaml');
for (const [name, target] of [...Object.entries(compat.colors), ...Object.entries(compat.extras)]) {
  for (const b of brands) for (const m of MODES) {
    if (resolved[`${b}/${m}`] && !resolved[`${b}/${m}`].has(target)) err(`[compat] "${name}" maps to missing token "${target}" for ${b}/${m}`);
  }
}

// ---- 3. Contrast
const waived = (brandMeta, id) => (brandMeta.accessibility?.waivers ?? []).find((w) =>
  w.pair.endsWith('*') ? id.startsWith(w.pair.slice(0, -1)) : w.pair === id);
const usedWaivers = new Set();
const rows = [];
for (const b of brands) {
  const meta = readYAML(`brands/${b}/brand.yaml`);
  for (const m of MODES) {
    const map = resolved[`${b}/${m}`]; if (!map) continue;
    for (const p of pairsDoc.pairs) {
      const fg = map.get(p.fg)?.$value, bg = map.get(p.bg)?.$value;
      if (!parseHex(fg) || !parseHex(bg)) { err(`[contrast] ${b}/${m} ${p.id}: tokens must be 6-digit hex (got ${fg}, ${bg})`); continue; }
      const ratio = contrast(fg, bg);
      const ok = ratio >= p.min;
      const w = !ok && waived(meta, p.id);
      if (w) usedWaivers.add(`${b}:${w.id}`);
      rows.push({ b, m, id: p.id, ratio, min: p.min, ok, waiver: w?.id });
      if (!ok && !w) err(`[contrast] ${b}/${m} ${p.id}: ${ratio.toFixed(2)}:1 < ${p.min}:1 (${p.fg} on ${p.bg})`);
      if (!ok && w) warn(`[contrast] ${b}/${m} ${p.id}: ${ratio.toFixed(2)}:1 < ${p.min}:1 waived by ${w.id} (${w.status})`);
    }
  }
}
for (const b of brands) {
  for (const w of readYAML(`brands/${b}/brand.yaml`).accessibility?.waivers ?? []) {
    if (!usedWaivers.has(`${b}:${w.id}`)) warn(`[brand] ${b}: waiver ${w.id} is not needed any more; remove it`);
  }
}

// ---- 4. Component specs
const specSchema = ajv.compile(readJSON('schemas/component.schema.json'));
const specs = loadSpecs();
const specIds = new Set(specs.map((s) => s.spec?.id));
for (const s of specs) {
  if (!s.spec) { err(`[spec] components/${s.dir}: missing ${s.dir}.spec.yaml`); continue; }
  const at = `components/${s.dir}`;
  if (!specSchema(s.spec)) { err(`[spec] ${at}: ${fmt(specSchema.errors)}`); continue; }
  if (s.spec.id !== s.dir) err(`[spec] ${at}: id "${s.spec.id}" must equal the folder name`);
  if (!s.usage) err(`[spec] ${at}: missing ${s.dir}.usage.md`);
  else {
    if (!/^# /m.test(s.usage)) err(`[spec] ${at}: usage.md needs a top-level heading`);
    for (const h of ['When to use', 'When not to use', 'Do', "Don't"]) {
      if (!new RegExp(`^## ${h}\\b`, 'm').test(s.usage)) err(`[spec] ${at}: usage.md is missing the "## ${h}" section`);
    }
  }
  if (s.spec.changelog[0].version !== s.spec.version) err(`[spec] ${at}: changelog[0].version must equal version`);
  if (s.spec.status === 'stable' && s.spec.open_questions.length) err(`[spec] ${at}: stable components cannot have open questions`);
  if (s.spec.status !== 'stable' && s.spec.open_questions.length) warn(`[spec] ${s.spec.id}: ${s.spec.open_questions.length} open question(s)`);
  for (const t of s.spec.tokens) {
    for (const b of brands) for (const m of MODES) {
      if (resolved[`${b}/${m}`] && !resolved[`${b}/${m}`].has(t)) err(`[spec] ${at}: token "${t}" does not exist for ${b}/${m}`);
    }
  }
  for (const r of s.spec.related ?? []) if (!specIds.has(r)) warn(`[spec] ${s.spec.id}: related component "${r}" has no spec yet`);
}

// ---- 5. Inventory consistency
const inv = readYAML('components/inventory.yaml').components;
const seen = new Set();
for (const c of inv) {
  if (seen.has(c.id)) err(`[inventory] duplicate id "${c.id}"`);
  seen.add(c.id);
  if (!['spec-draft', 'spec-stable', 'planned', 'deferred'].includes(c.status)) err(`[inventory] ${c.id}: invalid status "${c.status}"`);
  const hasSpec = specIds.has(c.id);
  if (c.status.startsWith('spec') && !hasSpec) err(`[inventory] ${c.id}: marked ${c.status} but no spec exists`);
  if (!c.status.startsWith('spec') && hasSpec) err(`[inventory] ${c.id}: has a spec but is marked ${c.status}`);
}
for (const id of specIds) if (id && !seen.has(id)) err(`[inventory] spec "${id}" is missing from components/inventory.yaml`);

// ---- 5b. YAML trap: in a plain (unquoted) scalar, " #" starts a comment and silently cuts the text
const yamlFiles = [
  ...specs.map((x) => `components/${x.dir}/${x.dir}.spec.yaml`), 'components/inventory.yaml',
  ...brands.map((b) => `brands/${b}/brand.yaml`), 'integration/connect.template.yaml',
];
for (const f of yamlFiles) {
  let block = null; // indentation of the current block scalar (| or >), whose content may contain '#'
  fs.readFileSync(path.join(ROOT, f), 'utf8').split('\n').forEach((line, i) => {
    const indent = line.length - line.trimStart().length;
    if (block !== null) { if (line.trim() === '' || indent > block) return; block = null; }
    if (/^\s*#/.test(line)) return;
    if (/:\s*[|>][+-]?\s*$/.test(line)) { block = indent; return; }
    const value = /^\s*(?:- )?(?:[\w.-]+:\s+)?(.+)$/.exec(line)?.[1] ?? '';
    if (!/^["'[{]/.test(value) && /\s#\S/.test(value)) err(`[yaml] ${f}:${i + 1}: " #" in an unquoted value starts a comment and cuts the text; put the value in quotes`);
  });
}

// ---- 6. Code Connect: template and examples must satisfy the connect schema and point at real components
const connectSchema = ajv.compile(readJSON('schemas/connect.schema.json'));
const connectFiles = ['integration/connect.template.yaml', ...listFiles('integration/examples', '.yaml').map((f) => `integration/examples/${f}`)];
for (const f of connectFiles) {
  const data = readYAML(f);
  if (!connectSchema(data)) err(`[connect] ${f}: ${fmt(connectSchema.errors)}`);
  for (const id of [...Object.keys(data.mappings ?? {}), ...(data.ignore ?? []).map((i) => i.id)]) {
    if (!specIds.has(id)) err(`[connect] ${f}: "${id}" is not a design-system component`);
  }
  if (!brands.includes(data.brand) && !data.brand.startsWith('your-')) err(`[connect] ${f}: unknown brand "${data.brand}"`);
}

// ---- report
const failing = rows.filter((r) => !r.ok);
console.log(`Brands: ${brands.join(', ')} | Modes: ${MODES.join(', ')} | Specs: ${specs.length} | Inventory: ${inv.length}`);
console.log(`Contrast checks: ${rows.length} (${rows.length - failing.length} pass, ${failing.filter((r) => r.waiver).length} waived, ${failing.filter((r) => !r.waiver).length} failing)`);
if (warnings.length) { console.log(`\nWarnings (${warnings.length}):`); warnings.forEach((w) => console.log(`  - ${w}`)); }
if (errors.length) { console.error(`\nErrors (${errors.length}):`); errors.forEach((e) => console.error(`  x ${e}`)); process.exit(1); }
console.log('\nOK: no errors.');
