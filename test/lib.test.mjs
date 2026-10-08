import test from 'node:test';
import assert from 'node:assert/strict';
import { resolve, contrast, toPlatformValue, flatten, listBrands, loadResolved, MODES } from '../scripts/lib.mjs';

const tok = (v, t = 'color') => ({ $value: v, $type: t, $layer: 'semantic' });

test('resolves chained references', () => {
  const r = resolve(new Map([['a', tok('#fff')], ['b', tok('{a}')], ['c', tok('{b}')]]));
  assert.equal(r.get('c').$value, '#fff');
  assert.deepEqual(r.get('c').$refs, ['b']);
});

test('resolves references inside composite values', () => {
  const r = resolve(new Map([['s', tok('16px', 'dimension')], ['t', tok({ fontSize: '{s}', fontFamily: 'sans' }, 'typography')]]));
  assert.deepEqual(r.get('t').$value, { fontSize: '16px', fontFamily: 'sans' });
});

test('throws on unresolved reference', () => {
  assert.throws(() => resolve(new Map([['a', tok('{missing}')]])), /Unresolved reference/);
});

test('throws on circular reference', () => {
  assert.throws(() => resolve(new Map([['a', tok('{b}')], ['b', tok('{a}')]])), /Circular/);
});

test('contrast matches WCAG reference values', () => {
  assert.equal(Math.round(contrast('#000000', '#FFFFFF')), 21);
  assert.equal(contrast('#777777', '#777777'), 1);
  assert.ok(contrast('#767676', '#FFFFFF') >= 4.5 && contrast('#777777', '#FFFFFF') < 4.5);
});

test('platform conversion strips units', () => {
  assert.equal(toPlatformValue(tok('16px', 'dimension')), 16);
  assert.equal(toPlatformValue(tok('250ms', 'duration')), 250);
  assert.equal(toPlatformValue(tok('300', 'fontWeight')), '300');
});

test('flatten tags layer and ignores $ keys', () => {
  const m = flatten({ $description: 'x', color: { red: { $value: '#f00', $type: 'color' } } }, 'primitive');
  assert.deepEqual([...m.keys()], ['color.red']);
  assert.equal(m.get('color.red').$layer, 'primitive');
});

test('every brand resolves in every mode and exposes the same keys', () => {
  for (const b of listBrands()) {
    const [l, d] = MODES.map((m) => loadResolved(b, m));
    assert.deepEqual([...l.keys()].sort(), [...d.keys()].sort(), b);
  }
});
