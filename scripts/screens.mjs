// Loads screen recreations (screens/<id>/<id>.screen.yaml).
import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { ROOT } from './lib.mjs';

export function loadScreens() {
  const base = path.join(ROOT, 'screens');
  if (!fs.existsSync(base)) return [];
  return fs.readdirSync(base, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => {
      const file = path.join(base, d.name, `${d.name}.screen.yaml`);
      const raw = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
      return { dir: d.name, file: `screens/${d.name}/${d.name}.screen.yaml`, raw: raw ?? '', screen: raw ? YAML.parse(raw) : null };
    })
    .sort((a, b) => a.dir.localeCompare(b.dir));
}
