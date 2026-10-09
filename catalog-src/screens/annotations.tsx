// Annotations: numbered pins drawn over the phone, attached to elements by id. An element is found by [data-anno] or [data-testid],
// so design-system components need no extra markup. Pins are catalog chrome (neutral colors), not part of the product.
import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode, RefObject } from 'react';
import type { Annotation, AnnotationType } from './data';

export const TYPE_COLOR: Record<AnnotationType, string> = { note: '#2563eb', gap: '#b45309', question: '#7c3aed', decision: '#be123c' };
export const TYPE_LABEL: Record<AnnotationType, string> = { note: 'Note', gap: 'Gap', question: 'Question', decision: 'Decision' };

interface Ctx { annotations: Annotation[]; show: boolean; active: string | null; setActive: (id: string | null) => void; present: Set<string>; setPresent: (s: Set<string>) => void }
const AnnoContext = createContext<Ctx | null>(null);

export const AnnotationProvider = ({ annotations, show, children }: { annotations: Annotation[]; show: boolean; children: ReactNode }) => {
  const [active, setActive] = useState<string | null>(null);
  const [present, setPresent] = useState<Set<string>>(new Set());
  return <AnnoContext.Provider value={{ annotations, show, active, setActive, present, setPresent }}>{children}</AnnoContext.Provider>;
};
export const useAnnotations = () => useContext(AnnoContext);

const findAnchor = (root: HTMLElement, target: string): HTMLElement | null => {
  if (target === 'drawer-active') return root.querySelector('[data-testid="drawer"] [aria-current="page"]');
  return root.querySelector(`[data-anno="${target}"]`) ?? root.querySelector(`[data-testid="${target}"]`);
};

interface Placed { id: string; x: number; y: number; w: number; h: number; index: number }

/** Absolutely positioned layer inside the phone. Measures anchors a few times a second, so it follows animations and state changes. */
export const PinLayer = ({ frame }: { frame: RefObject<HTMLDivElement | null> }) => {
  const ctx = useAnnotations();
  const [placed, setPlaced] = useState<Placed[]>([]);
  const last = useRef('');

  useEffect(() => {
    if (!ctx) return undefined;
    const measure = () => {
      const root = frame.current;
      if (!root) return;
      const box = root.getBoundingClientRect();
      const scale = box.width / root.offsetWidth || 1;
      const seen = new Map<string, number>();
      const next: Placed[] = [];
      for (const a of ctx.annotations) {
        const el = findAnchor(root, a.target);
        if (!el) continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        const index = seen.get(a.target) ?? 0;
        seen.set(a.target, index + 1);
        next.push({ id: a.id, x: (r.left - box.left) / scale, y: (r.top - box.top) / scale, w: r.width / scale, h: r.height / scale, index });
      }
      const key = next.map((p) => `${p.id}:${Math.round(p.x)},${Math.round(p.y)},${Math.round(p.w)},${Math.round(p.h)}`).join('|');
      if (key !== last.current) {
        last.current = key;
        setPlaced(next);
        ctx.setPresent(new Set(next.map((p) => p.id)));
      }
    };
    measure();
    const timer = window.setInterval(measure, 200);
    return () => window.clearInterval(timer);
  }, [ctx, frame]);

  if (!ctx || !ctx.show) return null;
  const byId = new Map(ctx.annotations.map((a) => [a.id, a]));
  const activePlaced = placed.find((p) => p.id === ctx.active);
  return (
    <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, pointerEvents: 'none', zIndex: 1000 }} data-pin-layer>
      {activePlaced && byId.get(activePlaced.id) ? <div style={{ position: 'absolute', left: activePlaced.x, top: activePlaced.y, width: activePlaced.w, height: activePlaced.h, outline: `2px solid ${TYPE_COLOR[byId.get(activePlaced.id)!.type]}`, outlineOffset: 2, borderRadius: 4 }} /> : null}
      {placed.map((p) => {
        const a = byId.get(p.id);
        if (!a) return null; // placed from the previous set of annotations, for one tick after the scope changed
        const big = p.h > 150; // tall containers (the detail sheet, the history) take their pin inside the top-right corner, clear of the text that starts at the left
        return (
          <button
            key={p.id}
            aria-label={`Annotation ${a.id}, ${TYPE_LABEL[a.type]}`}
            aria-pressed={ctx.active === a.id}
            onClick={() => ctx.setActive(ctx.active === a.id ? null : a.id)}
            style={{ position: 'absolute', left: Math.max(2, Math.min(375 - 26, big ? p.x + p.w - 28 - p.index * 24 : p.x + p.w - 14 - p.index * 24)), top: Math.max(2, big ? p.y + 4 : p.y - 10), pointerEvents: 'auto', minWidth: 24, height: 20, padding: '0 5px', borderRadius: 100, border: '2px solid #fff', background: TYPE_COLOR[a.type], color: '#fff', font: '600 10px/16px Inter, system-ui, sans-serif', cursor: 'pointer', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}
          >
            {a.id}
          </button>
        );
      })}
    </div>
  );
};
