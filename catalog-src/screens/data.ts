// Screen recreations (screens/<id>/<id>.screen.yaml), loaded as raw text at build time.
import YAML from 'yaml';

const raw = import.meta.glob('../../screens/*/*.screen.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

export type AnnotationType = 'note' | 'gap' | 'question' | 'decision';
export interface Annotation { id: string; type: AnnotationType; target: string; component?: string; decision?: string; text: string }
export interface ScreenDoc {
  id: string; name: string; version: string; status: string; summary: string; route: string;
  components: Array<{ id: string; role: string }>;
  pending?: Array<{ name: string; note: string; needs?: string[] }>;
  states: Array<{ id: string; label: string; description: string }>;
  annotations: Annotation[];
  sources: { figma?: Array<{ file: string; node: string; name?: string }>; code?: Array<{ repo: string; path: string; verified: boolean; commit?: string }> };
  changelog: Array<{ version: string; date: string; changes: string[] }>;
}

export const loadScreen = (id: string): ScreenDoc => YAML.parse(raw[`../../screens/${id}/${id}.screen.yaml`]) as ScreenDoc;
