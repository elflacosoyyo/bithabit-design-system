import type { ReactNode } from 'react';
import { useTheme } from '../../src/theme/ThemeProvider';

/** A positioned box on the brand's canvas. Overlay components (BottomSheet inline, DrawerMenu) fill it, so several can share a page. */
export const Stage = ({ children, height = 420, width = 375 }: { children: ReactNode; height?: number; width?: number | string }) => {
  const { theme } = useTheme();
  return (
    <div style={{ position: 'relative', height, width, maxWidth: '100%', overflow: 'hidden', borderRadius: 12, background: theme.color.bg.canvas, border: `1px solid ${theme.color.border.default}` }}>
      {children}
    </div>
  );
};
