import { useRef } from 'react';
import type { ReactNode } from 'react';
import { useTheme } from '../../src/theme/ThemeProvider';
import { PinLayer } from './annotations';

export const PHONE_W = 375;
export const PHONE_H = 812;
export const STATUS_BAR = 47;

/** Device shell at the app's design width. The inner box is the positioned parent that sheets, the drawer and alerts fill. */
export const PhoneFrame = ({ children, label }: { children: ReactNode; label: string }) => {
  const { theme, mode } = useTheme();
  const inner = useRef<HTMLDivElement>(null);
  return (
    <div style={{ width: PHONE_W + 20, padding: 10, borderRadius: 56, background: mode === 'dark' ? '#3a3a3c' : '#1c1c1e', boxShadow: '0 12px 32px rgba(0,0,0,0.25)' }}>
      <div
        ref={inner}
        role="group"
        aria-label={label}
        style={{ position: 'relative', width: PHONE_W, height: PHONE_H, borderRadius: 46, overflow: 'hidden', background: theme.color.bg.canvas, color: theme.color.text.primary, display: 'flex', flexDirection: 'column' }}
      >
        {children}
        <PinLayer frame={inner} />
      </div>
    </div>
  );
};

/** Fake iOS status bar. Static content, so catalog output stays deterministic. */
export const StatusBar = () => {
  const { theme } = useTheme();
  const c = theme.color.text.primary;
  return (
    <div aria-hidden style={{ height: STATUS_BAR, flexShrink: 0, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 28px 6px', fontSize: 15, fontWeight: 600, color: c, background: theme.color.bg.canvas }}>
      <span>9:41</span>
      <span style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
        <span style={{ display: 'flex', gap: 2, alignItems: 'flex-end' }}>{[5, 7, 9, 11].map((h) => <i key={h} style={{ width: 3, height: h, background: c, borderRadius: 1 }} />)}</span>
        <span style={{ width: 24, height: 11, border: `1.5px solid ${c}`, borderRadius: 4, padding: 1.5, boxSizing: 'border-box' }}><i style={{ display: 'block', width: '78%', height: '100%', background: c, borderRadius: 1.5 }} /></span>
      </span>
    </div>
  );
};

/** Scales a phone down for side-by-side views while keeping its layout size honest. */
export const Scaled = ({ scale, children }: { scale: number; children: ReactNode }) => (
  <div style={{ width: (PHONE_W + 20) * scale, height: (PHONE_H + 20) * scale }}>
    <div style={{ width: PHONE_W + 20, transform: `scale(${scale})`, transformOrigin: 'top left' }}>{children}</div>
  </div>
);
