import { createContext, useContext, useMemo } from 'react';
import { Platform } from 'react-native';
import type { ReactNode } from 'react';
import { getTheme, type BrandId, type Mode, type Theme } from './themes';

interface ThemeContextValue {
  brand: BrandId;
  mode: Mode;
  theme: Theme;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export const ThemeProvider = ({ brand, mode, children }: { brand: BrandId; mode: Mode; children: ReactNode }) => {
  const value = useMemo(() => ({ brand, mode, theme: getTheme(brand, mode) }), [brand, mode]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside <ThemeProvider>');
  return ctx;
};

type FontRole = 'sans' | 'display';

/** Resolves a font role to the family name for the current platform. */
export const fontFamily = (theme: Theme, role: FontRole): string =>
  role === 'sans' ? theme.font.family.sans : theme.font.family.display[Platform.OS === 'web' ? 'web' : Platform.OS];

type TypographyName = keyof Theme['typography'];

/** Style object for a semantic text style (typography.*). */
export const textStyle = (theme: Theme, name: TypographyName) => {
  const t = theme.typography[name] as {
    fontFamily: FontRole; fontSize: number; fontWeight: string; lineHeight: number; letterSpacing: number; textTransform?: string;
  };
  return {
    fontFamily: fontFamily(theme, t.fontFamily),
    fontSize: t.fontSize,
    fontWeight: t.fontWeight,
    lineHeight: t.lineHeight,
    letterSpacing: t.letterSpacing,
    ...(t.textTransform ? { textTransform: t.textTransform } : {}),
  };
};
