import type { Theme } from '../../dist/bithabit/theme';

export type { Theme };
export type Mode = 'light' | 'dark';
export type BrandId = string;

interface ThemeModule {
  brand: { id: string; name: string };
  light: Theme;
  dark: Theme;
}

// Every folder in dist/ is a brand. Adding a brand to brands/ and running `npm run build` makes it appear everywhere.
const modules = import.meta.glob('../../dist/*/theme.js', { eager: true }) as Record<string, ThemeModule>;

export const BRANDS: Record<BrandId, ThemeModule> = Object.fromEntries(
  Object.entries(modules).map(([path, mod]) => [path.split('/').at(-2) as string, mod]),
);
export const BRAND_IDS = Object.keys(BRANDS).sort((a, b) => (a === 'bithabit' ? -1 : b === 'bithabit' ? 1 : a.localeCompare(b)));
export const MODES: Mode[] = ['light', 'dark'];

export const getTheme = (brand: BrandId, mode: Mode): Theme => (BRANDS[brand] ?? BRANDS.bithabit)[mode];
export const brandName = (brand: BrandId) => BRANDS[brand]?.brand.name ?? brand;
