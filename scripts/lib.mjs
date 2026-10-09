// Shared token engine: layer loading, DTCG reference resolution, contrast math, output conversion.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import YAML from 'yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const MODES = ['light', 'dark'];

export const readJSON = (p) => JSON.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
export const readYAML = (p) => YAML.parse(fs.readFileSync(path.join(ROOT, p), 'utf8'));
export const exists = (p) => fs.existsSync(path.join(ROOT, p));
export const listFiles = (dir, ext) =>
  fs.existsSync(path.join(ROOT, dir))
    ? fs.readdirSync(path.join(ROOT, dir)).filter((f) => f.endsWith(ext)).sort()
    : [];

export const isToken = (n) => n && typeof n === 'object' && '$value' in n;

/** Flatten a DTCG tree into Map<path, token>. Tags each token with its source layer. */
export function flatten(tree, layer, into = new Map(), prefix = []) {
  for (const [k, v] of Object.entries(tree)) {
    if (k.startsWith('$')) continue;
    const p = [...prefix, k];
    if (isToken(v)) into.set(p.join('.'), { ...v, $layer: layer });
    else if (v && typeof v === 'object') flatten(v, layer, into, p);
  }
  return into;
}

export function listBrands() {
  return fs.readdirSync(path.join(ROOT, 'brands'), { withFileTypes: true })
    .filter((d) => d.isDirectory() && exists(`brands/${d.name}/brand.yaml`))
    .map((d) => d.name).sort();
}

/** Raw (unresolved) merged token map for one brand + mode. Later layers win. */
export function loadRaw(brand, mode) {
  const flat = new Map();
  const add = (file, layer) => {
    if (!exists(file)) return;
    for (const [k, v] of flatten(readJSON(file), layer)) flat.set(k, v);
  };
  for (const f of listFiles('tokens/primitive', '.json')) add(`tokens/primitive/${f}`, 'primitive');
  add(`brands/${brand}/primitive.json`, 'primitive');
  add('tokens/semantic/typography.json', 'semantic');
  add(`tokens/semantic/${mode}.json`, 'semantic');
  add(`brands/${brand}/typography.json`, 'semantic');
  add(`brands/${brand}/semantic.${mode}.json`, 'semantic');
  for (const f of listFiles('tokens/component', '.json')) add(`tokens/component/${f}`, 'component');
  return flat;
}

const REF = /\{([^{}]+)\}/g;

/** Resolve {references} in strings and in composite (object) values. */
export function resolve(flat) {
  const out = new Map();
  const stack = [];
  const refsOf = new Map();

  const resolveValue = (val, owner) => {
    if (typeof val === 'string') {
      const whole = val.match(/^\{([^{}]+)\}$/);
      if (whole) { noteRef(owner, whole[1]); return resolveToken(whole[1], owner).$value; }
      return val.replace(REF, (_, p) => { noteRef(owner, p); return String(resolveToken(p, owner).$value); });
    }
    if (val && typeof val === 'object') {
      return Object.fromEntries(Object.entries(val).map(([k, v]) => [k, resolveValue(v, owner)]));
    }
    return val;
  };
  const noteRef = (owner, p) => { if (!refsOf.has(owner)) refsOf.set(owner, new Set()); refsOf.get(owner).add(p); };

  const resolveToken = (p, from) => {
    if (out.has(p)) return out.get(p);
    const tok = flat.get(p);
    if (!tok) throw new Error(`Unresolved reference {${p}}${from ? ` (used by ${from})` : ''}`);
    if (stack.includes(p)) throw new Error(`Circular reference: ${[...stack, p].join(' -> ')}`);
    stack.push(p);
    const r = { ...tok, $value: resolveValue(tok.$value, p) };
    stack.pop();
    out.set(p, r);
    return r;
  };
  for (const p of flat.keys()) resolveToken(p);
  for (const [p, t] of out) t.$refs = [...(refsOf.get(p) ?? [])];
  return out;
}

export const loadResolved = (brand, mode) => resolve(loadRaw(brand, mode));

// ---------- value conversion for platform outputs ----------
const num = (s) => parseFloat(s);
export function toPlatformValue(token) {
  const { $type: t, $value: v } = token;
  if (t === 'dimension' && typeof v === 'string') return num(v);
  if (t === 'duration' && typeof v === 'string') return num(v);
  if (t === 'typography') {
    return Object.fromEntries(Object.entries(v).map(([k, x]) =>
      [k, typeof x === 'string' && /^-?\d+(\.\d+)?px$/.test(x) ? num(x) : x]));
  }
  return v;
}
export function toCssValue(token) {
  const { $type: t, $value: v } = token;
  if (t === 'typography') return null;
  if (t === 'fontFamily') return `"${v}"`;
  return String(v);
}

/** Tokens exposed to consumers: everything except raw color/family primitives. */
export const isPublic = (p, tok) =>
  !(tok.$layer === 'primitive' && (p.startsWith('color.') || p.startsWith('font.family.')));

const camel = (s) => s.replace(/-([a-z0-9])/g, (_, c) => c.toUpperCase());

export function toNested(resolved, valueFn = toPlatformValue) {
  const root = {};
  for (const [p, tok] of resolved) {
    if (!isPublic(p, tok)) continue;
    const parts = p.split('.').map(camel);
    let node = root;
    parts.slice(0, -1).forEach((k) => { node = node[k] ??= {}; });
    node[parts.at(-1)] = valueFn(tok);
  }
  return root;
}

// ---------- WCAG contrast (pure math lives in contrast.mjs so the browser can reuse it) ----------
export { parseHex, luminance, contrast } from './contrast.mjs';
