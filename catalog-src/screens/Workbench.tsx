// Page layout shared by the screen pages: toolbar, the phone, and the annotations next to it.
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Badge, Code, H1, P, Page } from '../helpers/ui';
import { AnnotationProvider, TYPE_COLOR, TYPE_LABEL, useAnnotations } from './annotations';
import { loadScreen } from './data';
import type { Annotation, ScreenDoc } from './data';
import type { NavState } from './AppPhone';
import { demo } from './store';

const Button = ({ pressed, onClick, children }: { pressed?: boolean; onClick: () => void; children: ReactNode }) => {
  const { theme } = useTheme();
  return (
    <button
      aria-pressed={pressed}
      onClick={onClick}
      style={{ font: '500 13px/1 Inter, system-ui, sans-serif', padding: '8px 14px', borderRadius: 100, border: `1px solid ${theme.color.border.strong}`, background: pressed ? theme.color.text.primary : 'transparent', color: pressed ? theme.color.bg.canvas : theme.color.text.primary, cursor: 'pointer' }}
    >
      {children}
    </button>
  );
};

const NotesList = () => {
  const { theme, brand, mode } = useTheme();
  const ctx = useAnnotations();
  if (!ctx) return null;
  return (
    <ol aria-label="Annotations" style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gap: 10 }}>
      {ctx.annotations.map((a) => {
        const visible = ctx.present.has(a.id);
        return (
          <li key={a.id} data-annotation={a.id} style={{ opacity: visible ? 1 : 0.55 }}>
            <button
              onClick={() => ctx.setActive(ctx.active === a.id ? null : a.id)}
              aria-pressed={ctx.active === a.id}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 10, border: `1px solid ${ctx.active === a.id ? TYPE_COLOR[a.type] : theme.color.border.default}`, background: theme.color.bg.surface, color: theme.color.text.primary, cursor: 'pointer', font: 'inherit' }}
            >
              <span style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4, flexWrap: 'wrap' }}>
                <span style={{ background: TYPE_COLOR[a.type], color: '#fff', font: '600 11px/18px Inter, sans-serif', borderRadius: 100, padding: '0 8px' }}>{a.id}</span>
                <span style={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.4, textTransform: 'uppercase', color: theme.color.text.secondary }}>{TYPE_LABEL[a.type]}</span>
                {a.component ? <a href={`#/components/${a.component}?brand=${brand}&mode=${mode}`} onClick={(e) => e.stopPropagation()} style={{ fontSize: 12, color: theme.color.text.primary }}>{a.component}</a> : null}
                {a.decision ? <Badge tone="warn">{a.decision} open</Badge> : null}
                {!visible ? <span style={{ fontSize: 12, color: theme.color.text.secondary }}>(not visible in this state)</span> : null}
              </span>
              <span style={{ fontSize: 13.5, lineHeight: '19px' }}>{a.text}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
};

interface WorkbenchProps {
  title: string;
  docs: ScreenDoc[];
  /** Radio group of states (the first doc's). Omit for the prototype. */
  states?: boolean;
  render: (state: string, onNavChange: (nav: NavState) => void) => ReactNode;
  /** Prototype: which annotations apply to the current navigation. */
  scopeAnnotations?: (nav: NavState, docs: ScreenDoc[]) => Annotation[];
  intro?: ReactNode;
}

export const Workbench = ({ title, docs, states = true, render, scopeAnnotations, intro }: WorkbenchProps) => {
  const { theme } = useTheme();
  const main = docs[0];
  const [state, setState] = useState(main.states[0].id);
  const [show, setShow] = useState(true);
  const [nav, setNav] = useState<NavState>({ section: 'home', drawerOpen: false });
  const annotations = useMemo(() => (scopeAnnotations ? scopeAnnotations(nav, docs) : docs.flatMap((d) => d.annotations)), [scopeAnnotations, nav, docs]);
  const current = main.states.find((s) => s.id === state);
  return (
    <Page maxWidth={1200}>
      <H1>{title}</H1>
      <P>{main.summary}</P>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <Badge tone={main.status === 'reviewed' ? 'pass' : 'warn'}>{main.status}</Badge>
        {docs.map((d) => <Badge key={d.id}>{d.name} v{d.version}</Badge>)}
      </div>
      {intro}
      <div role="toolbar" aria-label="Screen controls" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', margin: '0 0 20px' }}>
        {states ? main.states.map((s) => <Button key={s.id} pressed={state === s.id} onClick={() => setState(s.id)}>{s.label}</Button>) : null}
        <Button pressed={show} onClick={() => setShow(!show)}>Annotations</Button>
        <Button onClick={() => demo.reset()}>Reset demo data</Button>
      </div>
      {states && current ? <P muted>{current.description}</P> : null}
      <AnnotationProvider annotations={annotations} show={show}>
        <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
          <div key={state} style={{ flexShrink: 0 }}>{render(state, setNav)}</div>
          <div style={{ flex: '1 1 320px', minWidth: 280, maxWidth: 560 }}>
            <h2 style={{ fontSize: 15, margin: '0 0 10px', color: theme.color.text.primary }}>Annotations <Code>{annotations.length}</Code></h2>
            <NotesList />
          </div>
        </div>
      </AnnotationProvider>
    </Page>
  );
};

export { loadScreen };
