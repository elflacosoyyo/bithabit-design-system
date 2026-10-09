import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  cmpSemver, propsOf, propsOfType, inferPropsType, hardcodedColors, accessibilityHints, compareStyling, parseColorVars,
  loadDs, loadConnect, check, init, bump, renderMarkdown, renderConnectYaml,
} from '../integration/ds-sync/sync.mjs';

const write = (root, rel, text) => { fs.mkdirSync(path.dirname(path.join(root, rel)), { recursive: true }); fs.writeFileSync(path.join(root, rel), text); };

/** A tiny design system + app on disk. */
function world() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-sync-'));
  const dsDir = path.join(root, 'ds'), appDir = path.join(root, 'app');
  const comp = (name, version, extra = {}) => ({
    name, version, status: 'draft', category: 'x', contentHash: `hash-${name}-${version}`,
    props: [{ name: 'title', required: true }, { name: 'onPress', required: true }, { name: 'disabled', required: false }],
    accessibilityRole: 'button', codeGaps: [], codeSources: [], changelog: [{ version, date: '2026-01-01', changes: [`${name} ${version} change`] }], ...extra,
  });
  write(dsDir, 'dist/manifest.json', JSON.stringify({
    designSystem: '1.0.0',
    brands: { acme: { compatCss: 'dist/acme/bithabit-compat.css' } },
    components: {
      alpha: comp('Alpha', '1.2.0', {
        codeGaps: ['No accessibilityRole on the card.', 'Pressed opacity is 0.2, contract uses 0.7.'],
        changelog: [{ version: '1.2.0', date: '2026-02-01', changes: ['New disabled state.'] }, { version: '1.1.0', date: '2026-01-15', changes: ['Old change.'] }],
        codeSources: [{ path: 'src/components/alpha.tsx' }],
      }),
      beta: comp('Beta', '1.0.0'),
      gamma: comp('Gamma', '1.0.0', { codeSources: [{ path: 'src/components/gamma.tsx' }] }),
    },
  }));
  write(dsDir, 'dist/acme/bithabit-compat.css', '@layer base { :root { --color-accent: #eda96d; --color-border: rgba(0, 0, 0, 0.1); } .dark:root { --color-accent: #eda96d; } }');
  write(appDir, 'global.css', '@layer base { :root { --color-accent: #ff0000; --color-border: #0000001a; --color-extra: #111; } .dark:root { --color-accent: #eda96d; } }');
  write(appDir, 'src/components/alpha.tsx', [
    "export type AlphaProps = {", "  title: string;", "  onPress: () => void;", "  style?: { color: string };", "  extraOnly?: boolean;", "};",
    "// color: #123456 in a comment must not count", "export const Alpha = (p: AlphaProps) => <View style={{ backgroundColor: '#ff00ff' }} />;",
  ].join('\n'));
  write(appDir, 'src/components/gamma.tsx', "export const Other = () => null;\n");
  write(appDir, '.bithabit/connect.yaml', [
    '# keep this comment', 'designSystem: "@bakia/bithabit-design-system"', 'brand: acme', 'styling:', '  globalCss: global.css',
    'mappings:', '  alpha:', '    component: src/components/alpha.tsx', '    export: Alpha', '    syncedVersion: 1.1.0', '    syncedHash: old',
    '    props:', '      title: title', '      onPress: onClick', '      disabled: null',
    '    acceptedGaps:', '      - gap: Pressed opacity', '        reason: We keep the native default for now.',
    'ignore:', '  - id: beta', '    reason: Not used in this app.',
  ].join('\n'));
  const ds = loadDs(dsDir);
  const connectFile = path.join(appDir, '.bithabit/connect.yaml');
  return { root, dsDir, appDir, ds, connectFile, connect: loadConnect(connectFile) };
}

test('cmpSemver orders versions', () => {
  assert.equal(cmpSemver('1.2.0', '1.10.0'), -1);
  assert.equal(cmpSemver('2.0.0', '1.99.99'), 1);
  assert.equal(cmpSemver('1.0.0', '1.0.0'), 0);
});

test('propsOf reads top-level props only and returns null when absent', () => {
  const src = 'export type CardProps = {\n  title: string;\n  style?: {\n    color: string;\n  };\n  onPress: () => void;\n};';
  assert.deepEqual(propsOf(src, 'Card'), ['title', 'style', 'onPress']);
  assert.equal(propsOf(src, 'Other'), null);
  assert.deepEqual(propsOf('interface BoxProps extends Base {\n  size: number;\n}', 'Box'), ['size']);
});

test('hardcodedColors reports lines, ignores comments, never returns code', () => {
  const src = "const a = 1;\n// #123456 comment\nconst b = '#ff00ff';\n/* rgba(0,0,0,1) */\nclassName='bg-white p-md'\nconst c = rgb(1,2,3);";
  assert.deepEqual(hardcodedColors(src), [3, 5, 6], 'hex, tailwind white/black and rgb() are all hard-coded colors');
});

test('accessibilityHints detects role and label usage', () => {
  assert.deepEqual(accessibilityHints('<View role="button" aria-label="x" />'), { role: true, label: true });
  assert.deepEqual(accessibilityHints('<View />'), { role: false, label: false });
});

test('compareStyling normalizes hex8 and rgba and reports drift', () => {
  const ds = ':root { --color-a: #FFFFFF; --color-b: rgba(0, 0, 0, 0.1); --color-c: #000; }';
  const app = ':root { --color-a: #ffffff; --color-b: #0000001a; --color-d: #123; }';
  const r = compareStyling(app, ds);
  assert.equal(r.differs.length, 0);
  assert.deepEqual(r.missing.map((m) => m.name), ['c']);
  assert.deepEqual(r.extra.map((m) => m.name), ['d']);
  assert.equal(parseColorVars(ds).get(':root|b'), 'rgba(0,0,0,0.1)');
});

test('check reports updates, prop errors, colors, accessibility, accepted gaps, unmapped, ignored and styling drift', () => {
  const { ds, connect, appDir, connectFile } = world();
  const r = check({ appDir, ds, connect, connectFile });
  const alpha = r.components.find((c) => c.id === 'alpha');
  const codes = alpha.findings.map((f) => f.code);
  assert.ok(codes.includes('update-available'));
  assert.deepEqual(alpha.changelog.map((l) => l.version), ['1.2.0'], 'only entries newer than syncedVersion');
  assert.ok(alpha.findings.some((f) => f.code === 'mapped-prop-missing' && /onClick/.test(f.message)), 'mapped prop that the app does not have');
  assert.ok(codes.includes('hardcoded-color'));
  assert.ok(codes.includes('a11y-missing'));
  assert.ok(alpha.findings.some((f) => f.code === 'app-only-props' && /extraOnly/.test(f.message)));
  assert.deepEqual(alpha.gaps, ['No accessibilityRole on the card.'], 'accepted gap is filtered out');
  assert.equal(r.components.find((c) => c.id === 'beta').state, 'ignored');
  assert.equal(r.components.find((c) => c.id === 'gamma').state, 'unmapped');
  assert.equal(r.styling.differs.length, 1);
  assert.equal(r.styling.differs[0].name, 'accent');
  assert.equal(r.summary.errors, 1);
  assert.ok(renderMarkdown(r, appDir).includes('Nothing was changed in the app'));
});

test('check flags a missing file and an invalid connect.yaml', () => {
  const w = world();
  fs.unlinkSync(path.join(w.appDir, 'src/components/alpha.tsx'));
  const r = check({ appDir: w.appDir, ds: w.ds, connect: w.connect, connectFile: w.connectFile });
  assert.ok(r.components.find((c) => c.id === 'alpha').findings.some((f) => f.code === 'file-missing'));
  write(w.appDir, '.bithabit/bad.yaml', 'brand: acme\nmappings: {}\n');
  assert.ok(loadConnect(path.join(w.appDir, '.bithabit/bad.yaml')).errors.length > 0, 'designSystem is required');
});

test('check detects content changed without a version bump', () => {
  const w = world();
  w.connect.data.mappings.alpha.syncedVersion = '1.2.0';
  w.connect.data.mappings.alpha.syncedHash = 'stale';
  const r = check({ appDir: w.appDir, ds: w.ds, connect: w.connect, connectFile: w.connectFile });
  assert.ok(r.components.find((c) => c.id === 'alpha').findings.some((f) => f.code === 'content-changed'));
});

test('init maps exported components and leaves inline ones unmatched', () => {
  const w = world();
  const { mappings, unmatched } = init({ appDir: w.appDir, ds: w.ds });
  assert.deepEqual(Object.keys(mappings), ['alpha']);
  assert.equal(mappings.alpha.props.onPress, 'onPress');
  assert.equal(mappings.alpha.props.disabled, null, 'prop the app lacks maps to null');
  assert.ok(unmatched.some((u) => u.startsWith('gamma (looks inline')));
  assert.ok(unmatched.includes('beta'));
});

test('bump records the current version and hash and keeps comments', () => {
  const w = world();
  bump({ ds: w.ds, connect: w.connect, connectFile: w.connectFile, ids: ['alpha'] });
  const text = fs.readFileSync(w.connectFile, 'utf8');
  assert.match(text, /# keep this comment/);
  const reloaded = loadConnect(w.connectFile);
  assert.equal(reloaded.data.mappings.alpha.syncedVersion, '1.2.0');
  assert.equal(reloaded.data.mappings.alpha.syncedHash, 'hash-Alpha-1.2.0');
  assert.throws(() => bump({ ds: w.ds, connect: w.connect, connectFile: w.connectFile, ids: ['nope'] }), /not mapped/);
});

test('hashes that look like numbers are written quoted and survive a round trip', () => {
  const w = world();
  w.ds.manifest.components.alpha.contentHash = '12345678e0123456';
  bump({ ds: w.ds, connect: w.connect, connectFile: w.connectFile, ids: ['alpha'] });
  assert.match(fs.readFileSync(w.connectFile, 'utf8'), /syncedHash: "12345678e0123456"/);
  const again = loadConnect(w.connectFile);
  assert.equal(again.errors.length, 0);
  assert.equal(again.data.mappings.alpha.syncedHash, '12345678e0123456');
  const r = check({ appDir: w.appDir, ds: w.ds, connect: again, connectFile: w.connectFile });
  assert.ok(!r.components.find((c) => c.id === 'alpha').findings.some((f) => f.code === 'content-changed'));
  const gen = init({ appDir: w.appDir, ds: w.ds });
  assert.match(renderConnectYaml({ designSystem: 'x', brand: 'acme', mappings: gen.mappings, unmatched: gen.unmatched }), /syncedHash: "12345678e0123456"/);
});

test('the CLI runs when started through a symlink (node_modules/.bin, npx ds-sync)', async () => {
  const { execFileSync } = await import('node:child_process');
  const w = world();
  const link = path.join(w.root, 'ds-sync-link.mjs');
  fs.symlinkSync(path.resolve('integration/ds-sync/sync.mjs'), link);
  const out = execFileSync('node', [link, 'list', '--ds', w.dsDir], { encoding: 'utf8' });
  assert.match(out, /alpha\s+v1\.2\.0/);
  const report = execFileSync('node', [link, 'check', '--app', w.appDir, '--ds', w.dsDir], { encoding: 'utf8' });
  assert.match(report, /# ds-sync report/);
});

// ---------- components the app implements as one component per variant (Button) ----------
const BUTTONS = [
  'export type ButtonProps = {', '  label: string;', '  onPress: () => void;', '  disabled?: boolean;', '  loading?: boolean;', '};',
  'export type ButtonOutlineProps = ButtonProps & {', '  iconName?: string;', '};',
  'export type ButtonTextProps = ButtonProps & {', "  variant?: 'default' | 'link';", '};',
  'export const ButtonPrimary = ({ label, onPress, disabled, loading, iconName }: ButtonOutlineProps) => null;',
  'export const ButtonOutline = ({', '  label,', '  onPress,', '}: ButtonOutlineProps) => null;',
  'export const ButtonText = ({ label, onPress, variant = "default" }: ButtonTextProps) => null;',
].join('\n');

function buttonWorld() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'ds-sync-btn-'));
  const dsDir = path.join(root, 'ds'), appDir = path.join(root, 'app');
  write(dsDir, 'dist/manifest.json', JSON.stringify({
    designSystem: '1.0.0', brands: {},
    components: {
      button: {
        name: 'Button', version: '0.1.0', status: 'draft', category: 'action', contentHash: 'hbtn',
        variants: ['primary', 'outline', 'text', 'text-link'],
        props: [{ name: 'label', required: true }, { name: 'onPress', required: true }, { name: 'variant', required: false }, { name: 'icon', required: false }, { name: 'disabled', required: false }, { name: 'loading', required: false }],
        accessibilityRole: 'button', codeGaps: [], codeSources: [{ path: 'src/components/buttons.tsx' }], changelog: [{ version: '0.1.0', date: '2026-01-01', changes: ['first'] }],
      },
    },
  }));
  write(appDir, 'src/components/buttons.tsx', BUTTONS);
  return { root, dsDir, appDir, ds: loadDs(dsDir) };
}

test('propsOfType includes props of the base types it intersects or extends', () => {
  assert.deepEqual(propsOfType(BUTTONS, 'ButtonOutlineProps').sort(), ['disabled', 'iconName', 'label', 'loading', 'onPress']);
  assert.deepEqual(propsOfType('interface A { a: string }\ninterface B extends A {\n  b: number;\n}', 'B').sort(), ['a', 'b']);
  assert.equal(propsOfType('type X = Pick<Y, "a">;', 'X'), null);
});

test('inferPropsType reads the props type from a (multi-line) component signature', () => {
  assert.equal(inferPropsType(BUTTONS, 'ButtonPrimary'), 'ButtonOutlineProps');
  assert.equal(inferPropsType(BUTTONS, 'ButtonOutline'), 'ButtonOutlineProps');
  assert.equal(inferPropsType(BUTTONS, 'Missing'), null);
});

test('init maps a component implemented as one export per variant', () => {
  const w = buttonWorld();
  const { mappings, unmatched } = init({ appDir: w.appDir, ds: w.ds });
  assert.deepEqual(unmatched, []);
  assert.deepEqual(mappings.button.variants, {
    primary: { export: 'ButtonPrimary' }, outline: { export: 'ButtonOutline' }, text: { export: 'ButtonText' }, 'text-link': { export: 'ButtonText' },
  });
  assert.equal(mappings.button.export, undefined);
  assert.equal(mappings.button.props.icon, 'iconName', 'icon maps to the app iconName');
  assert.equal(mappings.button.props.variant, 'variant');
  const yaml = renderConnectYaml({ designSystem: 'x', brand: 'acme', mappings, unmatched });
  const file = path.join(w.appDir, '.bithabit/connect.yaml');
  write(w.appDir, '.bithabit/connect.yaml', yaml);
  assert.equal(loadConnect(file).errors.length, 0, 'the generated file satisfies the schema');
});

test('check validates every mapped variant and the union of their props', () => {
  const w = buttonWorld();
  const { mappings } = init({ appDir: w.appDir, ds: w.ds });
  const file = path.join(w.appDir, '.bithabit/connect.yaml');
  write(w.appDir, '.bithabit/connect.yaml', renderConnectYaml({ designSystem: 'x', brand: 'acme', mappings, unmatched: [] }));
  const ok = check({ appDir: w.appDir, ds: w.ds, connect: loadConnect(file), connectFile: file });
  assert.equal(ok.summary.errors, 0);
  assert.ok(!ok.components[0].findings.some((f) => f.code === 'mapped-prop-missing' || f.code === 'export-missing'));

  // a mapped export that does not exist, and a prop that no variant has
  mappings.button.variants.outline.export = 'ButtonGhost';
  mappings.button.props.disabled = 'enabled';
  write(w.appDir, '.bithabit/connect.yaml', renderConnectYaml({ designSystem: 'x', brand: 'acme', mappings, unmatched: [] }));
  const bad = check({ appDir: w.appDir, ds: w.ds, connect: loadConnect(file), connectFile: file });
  const codes = bad.components[0].findings.map((f) => f.code);
  assert.ok(codes.includes('export-missing'));
  assert.ok(bad.components[0].findings.some((f) => f.code === 'mapped-prop-missing' && /enabled/.test(f.message)));
  assert.equal(bad.summary.errors, 2);
});

test('check notes design-system variants that are not mapped', () => {
  const w = buttonWorld();
  const { mappings } = init({ appDir: w.appDir, ds: w.ds });
  delete mappings.button.variants['text-link'];
  const file = path.join(w.appDir, '.bithabit/connect.yaml');
  write(w.appDir, '.bithabit/connect.yaml', renderConnectYaml({ designSystem: 'x', brand: 'acme', mappings, unmatched: [] }));
  const r = check({ appDir: w.appDir, ds: w.ds, connect: loadConnect(file), connectFile: file });
  assert.ok(r.components[0].findings.some((f) => f.code === 'variant-not-mapped' && /text-link/.test(f.message)));
});

test('connect schema rejects a variant without an export', () => {
  const w = buttonWorld();
  write(w.appDir, '.bithabit/bad.yaml', 'designSystem: x\nbrand: acme\nmappings:\n  button:\n    component: src/components/buttons.tsx\n    syncedVersion: 0.1.0\n    variants:\n      primary: {}\n');
  assert.ok(loadConnect(path.join(w.appDir, '.bithabit/bad.yaml')).errors.length > 0);
});
