import type { ReactNode } from 'react';
import { ThemeProvider, useTheme } from '../../src/theme/ThemeProvider';
import { BRAND_IDS, MODES, brandName, type BrandId, type Mode } from '../../src/theme/themes';

const Cell = ({ brand, mode, children, minWidth }: { brand: BrandId; mode: Mode; children: ReactNode; minWidth: number }) => (
  <ThemeProvider brand={brand} mode={mode}>
    <CellBody brand={brand} mode={mode} minWidth={minWidth}>{children}</CellBody>
  </ThemeProvider>
);

const CellBody = ({ brand, mode, children, minWidth }: { brand: BrandId; mode: Mode; children: ReactNode; minWidth: number }) => {
  const { theme } = useTheme();
  return (
    <div style={{ minWidth, background: theme.color.bg.canvas, color: theme.color.text.primary, fontFamily: theme.font.family.sans, border: `1px solid ${theme.color.border.default}`, borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '8px 12px', fontSize: 12, fontWeight: 500, letterSpacing: 0.6, textTransform: 'uppercase', color: theme.color.text.secondary, borderBottom: `1px solid ${theme.color.border.default}` }}>
        {brandName(brand)} · {mode}
      </div>
      <div style={{ padding: 16 }}>{children}</div>
    </div>
  );
};

/**
 * Renders the same content for every brand and both modes, side by side, ignoring the toolbar.
 * This is the audit view: any brand that breaks a component shows up here at a glance.
 */
export const BrandMatrix = ({ children, minWidth = 340 }: { children: ReactNode; minWidth?: number }) => (
  <div style={{ display: 'grid', gridTemplateColumns: `repeat(${MODES.length}, minmax(${minWidth}px, 1fr))`, gap: 16 }}>
    {BRAND_IDS.flatMap((brand) => MODES.map((mode) => (
      <Cell key={`${brand}-${mode}`} brand={brand} mode={mode} minWidth={minWidth}>{children}</Cell>
    )))}
  </div>
);
