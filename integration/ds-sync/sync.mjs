#!/usr/bin/env node
// ds-sync: compares an app with the BITHABIT design system and SUGGESTS what to update. It never edits app code.
//
//   ds-sync check [--json] [--strict]     report (default command)
//   ds-sync init  [--write] [--force]     draft .bithabit/connect.yaml by matching the app's files to design-system components
//   ds-sync bump <id...> | --all          record that the app is now aligned (updates syncedVersion/syncedHash in connect.yaml)
//   ds-sync list                          design-system components and their status
//
// Options: --app <dir> (default cwd)  --ds <dir> (default <app>/node_modules/@bakia/bithabit-design-system)
//          --connect <file> (default <app>/.bithabit/connect.yaml)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import Ajv from 'ajv/dist/2020.js';
import YAML from 'yaml';

const PKG_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const DEFAULT_DS = 'node_modules/@bakia/bithabit-design-system';
const DEFAULT_CONNECT = '.bithabit/connect.yaml';

// ---------- small helpers ----------
// Hashes are hex, so YAML would read '0000000000000000' or '12e4567890123456' as numbers. Always write them quoted.
const quoted = (v) => { const n = new YAML.Scalar(String(v)); n.type = 'QUOTE_DOUBLE'; return n; };
const read = (p) => fs.readFileSync(p, 'utf8');
export const cmpSemver = (a, b) => {
  const [x, y] = [a, b].map((v) => v.split('.').map(Number));
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
  return 0;
};

export function loadDs(dsDir) {
  const manifestPath = path.join(dsDir, 'dist/manifest.json');
  if (!fs.existsSync(manifestPath)) throw new Error(`Design system manifest not found at ${manifestPath}. Install the package or pass --ds <dir>.`);
  return { dir: dsDir, manifest: JSON.parse(read(manifestPath)) };
}

export function loadConnect(file) {
  if (!fs.existsSync(file)) return { exists: false, data: null, errors: [] };
  const doc = YAML.parseDocument(read(file));
  const data = doc.toJS();
  const validate = new Ajv({ allErrors: true, strict: false }).compile(JSON.parse(read(path.join(PKG_ROOT, 'schemas/connect.schema.json'))));
  const errors = validate(data) ? [] : validate.errors.map((e) => `${e.instancePath || '/'} ${e.message}`);
  return { exists: true, doc, data, errors };
}

// ---------- static reading of app files (facts only; nothing is executed) ----------
/** Names of the top-level props of a props type, including those of base types it extends or intersects (same file). Null if not found. */
export function propsOfType(source, typeName, seen = new Set()) {
  if (seen.has(typeName)) return null;
  seen.add(typeName);
  const m = new RegExp(`(?:type|interface)\\s+${typeName}\\b([^{;]*)\\{`).exec(source);
  if (!m) return null;
  const names = [];
  // Base types named in the header: "= ButtonProps & {" or "extends BaseProps {"
  for (const base of m[1].matchAll(/\b([A-Z]\w*)\b/g)) names.push(...(propsOfType(source, base[1], seen) ?? [])); // utility types (Omit, Pick...) have no declaration here and are skipped
  let depth = 1;
  let i = m.index + m[0].length;
  let lineStart = i;
  let lineDepth = depth; // brace depth where the current line starts: a prop that opens an object type still belongs to depth 1
  for (; i < source.length && depth > 0; i++) {
    const c = source[i];
    if (c === '{') depth++;
    else if (c === '}') depth--;
    if (c === '\n' || i === source.length - 1 || depth === 0) {
      const line = source.slice(lineStart, c === '\n' ? i : i + 1);
      const pm = lineDepth === 1 && /^\s*([A-Za-z_]\w*)\??\s*:/.exec(line);
      if (pm) names.push(pm[1]);
      lineStart = i + 1;
      lineDepth = depth;
    }
  }
  return [...new Set(names)];
}
/** Props of `<Export>Props`. */
export const propsOf = (source, exportName) => propsOfType(source, `${exportName}Props`);
/** The props type named in a component signature: `export const Foo = ({ a, b }: SomeProps) =>`. */
export function inferPropsType(source, exportName) {
  const m = new RegExp(`export\\s+const\\s+${exportName}\\s*=\\s*\\(\\s*\\{[\\s\\S]*?\\}\\s*:\\s*(\\w+)\\s*\\)`).exec(source);
  return m ? m[1] : null;
}
export const hasExport = (source, name) => new RegExp(`export\\s+(?:const|function|default function)\\s+${name}\\b`).test(source);
const pascal = (s) => s.charAt(0).toUpperCase() + s.slice(1);

const stripComments = (s) => s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' ')).replace(/(^|[^:])\/\/.*$/gm, '$1');

/** Hard-coded colors that bypass tokens. Returns line numbers only, never code. */
export function hardcodedColors(source) {
  const lines = stripComments(source).split('\n');
  const out = [];
  lines.forEach((line, idx) => {
    if (/#[0-9a-fA-F]{3,8}\b/.test(line) || /\brgba?\(/.test(line) || /\b(?:text|bg|border)-(?:white|black)\b/.test(line)) out.push(idx + 1);
  });
  return out;
}

export const accessibilityHints = (source) => ({
  role: /accessibilityRole|\brole=/.test(source),
  label: /accessibilityLabel|aria-label/.test(source),
});

// ---------- CSS variables ----------
const normColor = (v) => {
  v = v.toLowerCase().replace(/\s+/g, '');
  let m = /^#([0-9a-f]{8})$/.exec(v);
  if (m) { const h = m[1]; const [r, g, b, a] = [0, 2, 4, 6].map((i) => parseInt(h.slice(i, i + 2), 16)); return `rgba(${r},${g},${b},${Math.round((a / 255) * 10) / 10})`; }
  m = /^rgba\((\d+),(\d+),(\d+),([\d.]+)\)$/.exec(v);
  if (m) return `rgba(${m[1]},${m[2]},${m[3]},${Math.round(parseFloat(m[4]) * 10) / 10})`;
  return v;
};
export function parseColorVars(css) {
  const out = new Map();
  for (const m of css.matchAll(/(:root|\.dark:root)\s*\{([^}]*)\}/g)) {
    for (const [, name, value] of m[2].matchAll(/--color-([\w-]+)\s*:\s*([^;]+);/g)) out.set(`${m[1]}|${name}`, normColor(value));
  }
  return out;
}
export function compareStyling(appCss, dsCss) {
  const app = parseColorVars(appCss), ds = parseColorVars(dsCss);
  const differs = [], missing = [], extra = [];
  for (const [k, v] of ds) {
    const [sel, name] = k.split('|');
    if (!app.has(k)) missing.push({ selector: sel, name, expected: v });
    else if (app.get(k) !== v) differs.push({ selector: sel, name, app: app.get(k), expected: v });
  }
  for (const k of app.keys()) if (!ds.has(k)) { const [sel, name] = k.split('|'); extra.push({ selector: sel, name }); }
  return { compared: ds.size, differs, missing, extra };
}

// ---------- check ----------
export function check({ appDir, ds, connect, connectFile }) {
  const { manifest } = ds;
  const mappings = connect.data?.mappings ?? {};
  const ignored = new Map((connect.data?.ignore ?? []).map((i) => [i.id, i.reason]));
  const brand = connect.data?.brand;
  const components = [];

  for (const [id, c] of Object.entries(manifest.components)) {
    const entry = { id, name: c.name, version: c.version, status: c.status, findings: [], gaps: [], changelog: [] };
    if (ignored.has(id)) { entry.state = 'ignored'; entry.note = ignored.get(id); components.push(entry); continue; }
    const map = mappings[id];
    if (!map) { entry.state = 'unmapped'; components.push(entry); continue; }
    entry.state = 'mapped';
    entry.file = map.component;
    const add = (severity, code, message) => entry.findings.push({ severity, code, message });

    const file = path.join(appDir, map.component);
    if (!fs.existsSync(file)) { add('error', 'file-missing', `${map.component} does not exist.`); components.push(entry); continue; }
    const source = read(file);

    // 1. Version drift
    entry.syncedVersion = map.syncedVersion;
    const behind = cmpSemver(map.syncedVersion, c.version);
    if (behind < 0) {
      entry.updateAvailable = true;
      entry.changelog = c.changelog.filter((l) => cmpSemver(l.version, map.syncedVersion) > 0);
      add('warn', 'update-available', `Contract moved from ${map.syncedVersion} to ${c.version}.`);
    } else if (behind > 0) {
      add('warn', 'ahead-of-design-system', `connect.yaml says ${map.syncedVersion} but the installed design system has ${c.version}. Upgrade the package.`);
    } else if (map.syncedHash && String(map.syncedHash) !== c.contentHash) {
      add('warn', 'content-changed', `The spec or usage guide changed without a version bump (hash ${map.syncedHash} to ${c.contentHash}). Read it again.`);
    }

    // 2. Props (one export, or several exports when the app implements the component as variants)
    const propMap = map.props ?? {};
    let appProps = null;
    let propsLabel = `${map.export ?? c.name}Props`;
    if (map.variants) {
      const union = new Set();
      let readable = false;
      for (const [variant, v] of Object.entries(map.variants)) {
        if (!(c.variants ?? []).includes(variant)) add('warn', 'variant-unknown', `connect.yaml maps variant "${variant}", which the design system does not define for ${c.name}.`);
        if (!hasExport(source, v.export)) { add('error', 'export-missing', `${map.component} does not export "${v.export}" (variant "${variant}").`); continue; }
        const names = propsOfType(source, v.propsType ?? inferPropsType(source, v.export) ?? `${v.export}Props`);
        if (names) { readable = true; names.forEach((n) => union.add(n)); } else add('info', 'props-unreadable', `Could not read the props type of ${v.export}; its prop checks were skipped.`);
      }
      for (const dsVariant of c.variants ?? []) if (!(dsVariant in map.variants)) add('info', 'variant-not-mapped', `Design-system variant "${dsVariant}" is not mapped to an app export.`);
      appProps = readable ? [...union] : null;
      propsLabel = 'the mapped components\' props';
    } else {
      const exportName = map.export ?? c.name;
      appProps = propsOf(source, exportName) ?? propsOfType(source, inferPropsType(source, exportName) ?? '');
    }
    if (!appProps) {
      if (!map.variants) add('info', 'props-unreadable', `Could not read the props type of ${map.export ?? c.name} in ${map.component}; prop checks skipped.`);
    } else {
      for (const p of c.props) {
        if (!(p.name in propMap)) { add(p.required ? 'warn' : 'info', 'prop-not-mapped', `Design-system prop "${p.name}"${p.required ? ' (required)' : ''} is not in connect.yaml. Map it to an app prop or to null.`); continue; }
        const appName = propMap[p.name];
        if (appName === null) { if (p.required) add('warn', 'required-prop-absent', `Required design-system prop "${p.name}" has no equivalent in the app.`); continue; }
        if (!appProps.includes(appName)) add('error', 'mapped-prop-missing', `connect.yaml maps "${p.name}" to "${appName}" but ${propsLabel} has no such prop.`);
      }
      const mapped = new Set(Object.values(propMap).filter(Boolean));
      const appOnly = appProps.filter((n) => !mapped.has(n));
      if (appOnly.length) add('info', 'app-only-props', `App-only props (not in the contract): ${appOnly.join(', ')}.`);
    }

    // 3. Hard-coded colors
    const lits = hardcodedColors(source);
    if (lits.length) add('warn', 'hardcoded-color', `${lits.length} line(s) use a hard-coded color instead of a token (lines ${lits.slice(0, 8).join(', ')}${lits.length > 8 ? ', ...' : ''}).`);

    // 4. Accessibility contract
    const a11y = accessibilityHints(source);
    if (c.accessibilityRole && !a11y.role && !a11y.label) add('warn', 'a11y-missing', `The contract requires role "${c.accessibilityRole}" and an accessible label; neither was found.`);
    else if (c.accessibilityRole && !a11y.role) add('warn', 'a11y-role-missing', `The contract requires role "${c.accessibilityRole}"; no accessibilityRole/role found.`);
    else if (c.accessibilityRole && !a11y.label) add('warn', 'a11y-label-missing', 'No accessibilityLabel/aria-label found; the contract requires an accessible name.');

    // 5. Known gaps from the contract, minus the ones the team accepted
    const accepted = (map.acceptedGaps ?? []).map((g) => g.gap);
    entry.gaps = c.codeGaps.filter((g) => !accepted.some((a) => g.includes(a) || a.includes(g)));
    entry.acceptedGaps = (map.acceptedGaps ?? []);
    components.push(entry);
  }

  // Styling (CSS variables) drift
  let styling = null;
  const cssPath = connect.data?.styling?.globalCss;
  const brandInfo = brand && manifest.brands[brand];
  if (cssPath && brandInfo) {
    const appCssFile = path.join(appDir, cssPath);
    const dsCssFile = path.join(ds.dir, brandInfo.compatCss);
    if (fs.existsSync(appCssFile) && fs.existsSync(dsCssFile)) styling = { file: cssPath, ...compareStyling(read(appCssFile), read(dsCssFile)) };
    else styling = { file: cssPath, error: `Could not read ${!fs.existsSync(appCssFile) ? cssPath : brandInfo.compatCss}.` };
  }

  const count = (f) => components.filter(f).length;
  const sev = (s) => components.reduce((n, c) => n + c.findings.filter((x) => x.severity === s).length, 0);
  const stylingProblems = styling ? (styling.differs?.length ?? 0) + (styling.missing?.length ?? 0) + (styling.error ? 1 : 0) : 0;
  return {
    designSystem: { version: manifest.designSystem, brand: brand ?? null, brandKnown: !!brandInfo },
    summary: {
      components: components.length,
      mapped: count((c) => c.state === 'mapped'),
      unmapped: count((c) => c.state === 'unmapped'),
      ignored: count((c) => c.state === 'ignored'),
      updatesAvailable: count((c) => c.updateAvailable),
      errors: sev('error') + (connect.errors?.length ?? 0),
      warnings: sev('warn') + stylingProblems,
    },
    connectFile,
    connectErrors: connect.errors ?? [],
    components,
    styling,
  };
}

// ---------- init ----------
export function init({ appDir, ds }) {
  const { manifest } = ds;
  const mappings = {};
  const unmatched = [];
  for (const [id, c] of Object.entries(manifest.components)) {
    const candidates = [...c.codeSources.map((s) => s.path), `src/components/${id}.tsx`, `components/${id}.tsx`];
    const found = candidates.find((p) => /\.(tsx?|jsx?)$/.test(p) && fs.existsSync(path.join(appDir, p)));
    if (!found) { unmatched.push(id); continue; }
    const source = read(path.join(appDir, found));
    const mapProps = (appProps) => {
      const props = {};
      for (const p of c.props) props[p.name] = appProps ? (appProps.includes(p.name) ? p.name : appProps.includes(`${p.name}Name`) ? `${p.name}Name` : null) : p.name; // identity when unreadable: review it
      return props;
    };
    if (hasExport(source, c.name)) {
      mappings[id] = { component: found, export: c.name, syncedVersion: c.version, syncedHash: c.contentHash, props: mapProps(propsOf(source, c.name)), acceptedGaps: [] };
      continue;
    }
    // Not exported under its own name: the app may implement it as one component per variant (Button -> ButtonPrimary, ButtonOutline...).
    const variants = {};
    for (const v of c.variants ?? []) {
      const exp = `${c.name}${pascal(v.split('-')[0])}`;
      if (hasExport(source, exp)) variants[v] = { export: exp };
    }
    if (Object.keys(variants).length) {
      const union = new Set();
      for (const { export: exp } of Object.values(variants)) (propsOfType(source, inferPropsType(source, exp) ?? `${exp}Props`) ?? []).forEach((n) => union.add(n));
      mappings[id] = { component: found, variants, syncedVersion: c.version, syncedHash: c.contentHash, props: mapProps([...union]), acceptedGaps: [] };
      continue;
    }
    // The file exists but exports nothing that matches: inline markup (or it lives elsewhere), so there is nothing to map yet.
    unmatched.push(`${id} (looks inline in ${found}; a standalone component is suggested)`);
  }
  return { mappings, unmatched };
}

export function renderConnectYaml({ designSystem, brand, globalCss, tailwindConfig, mappings, unmatched }) {
  const doc = new YAML.Document({
    designSystem,
    brand,
    styling: { ...(globalCss ? { globalCss } : {}), ...(tailwindConfig ? { tailwindConfig } : {}) },
    mappings,
    ignore: [],
  });
  doc.commentBefore = ` BITHABIT connect file. Maps design-system components to this app's components.\n Draft generated by ds-sync init: review every mapping, then commit it.\n syncedVersion/syncedHash record the contract version this app was aligned with at generation time:\n run \`ds-sync check\` to see what has moved since, and \`ds-sync bump <id>\` after you align a component.\n Props: design-system prop -> app prop, or null when the app has no equivalent.` +
    (unmatched.length ? `\n Design-system components with no matching file found: ${unmatched.join(', ')}.` : '');
  for (const id of Object.keys(mappings)) doc.setIn(['mappings', id, 'syncedHash'], quoted(mappings[id].syncedHash));
  return String(doc);
}

// ---------- bump ----------
export function bump({ ds, connect, connectFile, ids }) {
  if (!connect.exists) throw new Error(`${connectFile} not found. Run "ds-sync init --write" first.`);
  const targets = ids.length ? ids : Object.keys(connect.data.mappings);
  const bumped = [];
  for (const id of targets) {
    const c = ds.manifest.components[id];
    if (!c || !connect.data.mappings[id]) throw new Error(`"${id}" is not mapped in ${connectFile}.`);
    connect.doc.setIn(['mappings', id, 'syncedVersion'], c.version);
    connect.doc.setIn(['mappings', id, 'syncedHash'], quoted(c.contentHash));
    bumped.push(`${id} -> ${c.version}`);
  }
  fs.writeFileSync(connectFile, String(connect.doc));
  return bumped;
}

// ---------- markdown report ----------
export function renderMarkdown(r, appDir) {
  const L = [];
  const s = r.summary;
  L.push(`# ds-sync report`, '');
  L.push(`Design system **${r.designSystem.version}** · brand **${r.designSystem.brand ?? 'n/a'}** · app \`${path.basename(appDir)}\``, '');
  L.push(`| Components | Mapped | Unmapped | Ignored | Updates available | Errors | Warnings |`, `|---|---|---|---|---|---|---|`);
  L.push(`| ${s.components} | ${s.mapped} | ${s.unmapped} | ${s.ignored} | ${s.updatesAvailable} | ${s.errors} | ${s.warnings} |`, '');
  L.push('_ds-sync only suggests. Nothing was changed in the app._', '');
  if (r.connectErrors.length) { L.push('## connect.yaml is invalid', ...r.connectErrors.map((e) => `- ${e}`), ''); }

  const mapped = r.components.filter((c) => c.state === 'mapped');
  const attention = mapped.filter((c) => c.findings.some((f) => f.severity !== 'info') || c.gaps.length);
  const clean = mapped.filter((c) => !attention.includes(c));
  if (attention.length) {
    L.push('## Needs attention', '');
    for (const c of attention) {
      L.push(`### ${c.name} (\`${c.id}\`) · ${c.file}`);
      for (const f of c.findings) L.push(`- **${f.severity}** [${f.code}] ${f.message}`);
      if (c.changelog.length) { L.push('- What changed in the contract:'); for (const l of c.changelog) L.push(`  - v${l.version} (${l.date}): ${l.changes.join(' ')}`); }
      if (c.gaps.length) { L.push('- Differences from the contract (suggestions, not blockers):'); for (const g of c.gaps) L.push(`  - ${g}`); }
      if (c.acceptedGaps.length) L.push(`- ${c.acceptedGaps.length} gap(s) accepted by the team (not reported).`);
      L.push('');
    }
  }
  if (clean.length) L.push('## Up to date', '', ...clean.map((c) => `- ${c.name} (v${c.version})`), '');
  const un = r.components.filter((c) => c.state === 'unmapped');
  if (un.length) L.push('## Design-system components with no mapping', '', ...un.map((c) => `- ${c.name} (\`${c.id}\`, v${c.version}): map it in connect.yaml, or add it to \`ignore\` with a reason.`), '');
  const ig = r.components.filter((c) => c.state === 'ignored');
  if (ig.length) L.push('## Ignored on purpose', '', ...ig.map((c) => `- ${c.name}: ${c.note}`), '');
  if (r.styling) {
    L.push(`## Styling: \`${r.styling.file}\` vs the design system's compat CSS`, '');
    if (r.styling.error) L.push(`- ${r.styling.error}`);
    else if (!r.styling.differs.length && !r.styling.missing.length) L.push(`- All ${r.styling.compared} color variables match.`);
    for (const d of r.styling.differs ?? []) L.push(`- **differs** \`${d.selector}\` --color-${d.name}: app ${d.app}, design system ${d.expected}`);
    for (const d of r.styling.missing ?? []) L.push(`- **missing** \`${d.selector}\` --color-${d.name} (design system: ${d.expected})`);
    if (r.styling.extra?.length) L.push(`- App-only variables (fine): ${r.styling.extra.map((e) => `--color-${e.name}`).join(', ')}`);
    L.push('');
  }
  return L.join('\n');
}

// ---------- CLI ----------
function parseArgs(argv) {
  const o = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) { const k = a.slice(2); const next = argv[i + 1]; if (['app', 'ds', 'connect'].includes(k)) { o[k] = next; i++; } else o[k] = true; }
    else o._.push(a);
  }
  return o;
}

async function main() {
  const o = parseArgs(process.argv.slice(2));
  const cmd = o._[0] ?? 'check';
  const appDir = path.resolve(o.app ?? process.cwd());
  const dsDir = path.resolve(o.ds ?? path.join(appDir, DEFAULT_DS));
  const connectFile = path.resolve(o.connect ?? path.join(appDir, DEFAULT_CONNECT));
  const ds = loadDs(dsDir);

  if (cmd === 'list') {
    for (const [id, c] of Object.entries(ds.manifest.components)) console.log(`${id.padEnd(20)} v${c.version.padEnd(7)} ${c.status.padEnd(10)} ${c.category}`);
    return;
  }
  if (cmd === 'init') {
    const brandIds = Object.keys(ds.manifest.brands);
    const brand = o.brand && o.brand !== true ? o.brand : brandIds.find((b) => b !== 'bithabit') ?? brandIds[0];
    const css = ['global.css', 'src/global.css'].find((p) => fs.existsSync(path.join(appDir, p)));
    const tw = ['tailwind.config.js', 'tailwind.config.ts'].find((p) => fs.existsSync(path.join(appDir, p)));
    const { mappings, unmatched } = init({ appDir, ds });
    const yaml = renderConnectYaml({ designSystem: '@bakia/bithabit-design-system', brand, globalCss: css, tailwindConfig: tw, mappings, unmatched });
    if (!o.write) { process.stdout.write(yaml); return; }
    if (fs.existsSync(connectFile) && !o.force) throw new Error(`${connectFile} already exists. Use --force to overwrite.`);
    fs.mkdirSync(path.dirname(connectFile), { recursive: true });
    fs.writeFileSync(connectFile, yaml);
    console.log(`Wrote ${path.relative(appDir, connectFile)} with ${Object.keys(mappings).length} mapping(s). Review it before committing.`);
    return;
  }
  const connect = loadConnect(connectFile);
  if (cmd === 'bump') {
    const bumped = bump({ ds, connect, connectFile, ids: o.all ? [] : o._.slice(1) });
    console.log(`Updated ${path.relative(appDir, connectFile)}: ${bumped.join(', ')}`);
    return;
  }
  if (cmd !== 'check') throw new Error(`Unknown command "${cmd}". Use check, init, bump or list.`);
  if (!connect.exists) { console.error(`${path.relative(appDir, connectFile)} not found. Run "ds-sync init --write" to draft it.`); process.exit(2); }
  const report = check({ appDir, ds, connect, connectFile });
  if (o.json) console.log(JSON.stringify(report, null, 2)); else console.log(renderMarkdown(report, appDir));
  if (o.strict && report.summary.errors > 0) process.exit(1);
}

// Compare real paths: when run through node_modules/.bin (npx ds-sync) argv[1] is a symlink to this file.
if (process.argv[1] && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))) {
  main().catch((e) => { console.error(`ds-sync: ${e.message}`); process.exit(2); });
}
