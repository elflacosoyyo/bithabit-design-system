// Loads component specs (components/<id>/<id>.spec.yaml + <id>.usage.md).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ROOT } from './lib.mjs';

export function loadSpecs() {
  const base = path.join(ROOT, 'components');
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const sp = path.join(base, d.name, `${d.name}.spec.yaml`);
      const up = path.join(base, d.name, `${d.name}.usage.md`);
      const raw = fs.existsSync(sp) ? fs.readFileSync(sp, 'utf8') : null;
      return {
        dir: d.name,
        raw: raw ?? '',
        spec: raw ? YAML.parse(raw) : null,
        usage: fs.existsSync(up) ? fs.readFileSync(up, 'utf8') : null,
      };
    })
    .sort((a, b) => a.dir.localeCompare(b.dir));
}
