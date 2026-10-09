// Small presentational helpers for documentation pages (plain HTML, themed with the active brand and mode).
import type { CSSProperties, ReactNode } from 'react';
import { fontFamily, useTheme } from '../../src/theme/ThemeProvider';

export const Page = ({ children, maxWidth = 1100 }: { children: ReactNode; maxWidth?: number }) => (
  <div style={{ maxWidth, margin: '0 auto' }}>{children}</div>
);

export const H1 = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return <h1 style={{ fontFamily: fontFamily(theme, 'display'), fontSize: 38, fontWeight: 500, letterSpacing: -1, margin: '0 0 8px' }}>{children}</h1>;
};

export const H2 = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return <h2 style={{ fontFamily: fontFamily(theme, 'display'), fontSize: 24, fontWeight: 500, margin: '32px 0 12px' }}>{children}</h2>;
};

export const Label = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return <div style={{ fontSize: 12, fontWeight: 500, letterSpacing: 1, textTransform: 'uppercase', color: theme.color.text.secondary, margin: '16px 0 8px' }}>{children}</div>;
};

export const P = ({ children, muted = false }: { children: ReactNode; muted?: boolean }) => {
  const { theme } = useTheme();
  return <p style={{ fontSize: 15, lineHeight: '22px', margin: '0 0 12px', color: muted ? theme.color.text.secondary : theme.color.text.primary }}>{children}</p>;
};

export const Code = ({ children }: { children: ReactNode }) => {
  const { theme } = useTheme();
  return <code style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: 12.5, background: theme.color.bg.surfaceAlt, padding: '1px 5px', borderRadius: 4 }}>{children}</code>;
};

type Tone = 'neutral' | 'pass' | 'warn' | 'fail';
export const Badge = ({ children, tone = 'neutral' }: { children: ReactNode; tone?: Tone }) => {
  const { theme } = useTheme();
  const tones: Record<Tone, CSSProperties> = {
    neutral: { background: theme.color.bg.surfaceAlt, color: theme.color.text.primary },
    pass: { background: 'rgba(22,163,74,0.16)', color: theme.color.text.primary },
    warn: { background: 'rgba(217,119,6,0.20)', color: theme.color.text.primary },
    fail: { background: 'rgba(220,38,38,0.20)', color: theme.color.text.primary },
  };
  return <span style={{ display: 'inline-block', padding: '1px 8px', borderRadius: 100, fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap', ...tones[tone] }}>{children}</span>;
};

export const Table = ({ head, rows }: { head: string[]; rows: ReactNode[][] }) => {
  const { theme } = useTheme();
  const cell: CSSProperties = { textAlign: 'left', padding: '8px 10px', borderBottom: `1px solid ${theme.color.border.default}`, verticalAlign: 'top', fontSize: 13.5, lineHeight: '19px' };
  return (
    <table style={{ borderCollapse: 'collapse', width: '100%', marginBottom: 12 }}>
      <thead>
        <tr>{head.map((h) => <th key={h} style={{ ...cell, fontWeight: 600, color: theme.color.text.secondary, fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.6 }}>{h}</th>)}</tr>
      </thead>
      <tbody>
        {rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} style={cell}>{c}</td>)}</tr>)}
      </tbody>
    </table>
  );
};

export const Swatch = ({ color, size = 40, round = false }: { color: string; size?: number; round?: boolean }) => {
  const { theme } = useTheme();
  return <span style={{ display: 'inline-block', width: size, height: size, borderRadius: round ? size : 8, background: color, border: `1px solid ${theme.color.border.default}`, verticalAlign: 'middle', flexShrink: 0 }} />;
};

/** dotted token path ('color.text.on-accent') to the camelCased lookup used by the generated theme. */
export const camel = (s: string) => s.replace(/-([a-z0-9])/g, (_, c: string) => c.toUpperCase());
export const getPath = (obj: unknown, path: string): unknown =>
  path.split('.').reduce<unknown>((o, k) => (o && typeof o === 'object' ? (o as Record<string, unknown>)[camel(k)] : undefined), obj);
