import type { ReactNode } from 'react';
import Overview from './pages/Overview';
import Colors from './pages/foundations/Colors';
import Typography from './pages/foundations/Typography';
import ShapeAndSpacing from './pages/foundations/ShapeAndSpacing';
import Brands from './pages/foundations/Brands';
import Contrast from './pages/audit/Contrast';
import Inventory from './pages/audit/Inventory';
import * as HabitCard from './pages/components/HabitCard';
import * as Checkbox from './pages/components/Checkbox';
import * as BottomSheet from './pages/components/BottomSheet';
import * as SegmentedControl from './pages/components/SegmentedControl';
import * as MetricCard from './pages/components/MetricCard';
import { SpecView, loadSpec } from './helpers/SpecView';

export interface NavItem { path: string; title: string; group: 'Overview' | 'Foundations' | 'Components' | 'Audit' }
export interface Route extends NavItem { render: () => ReactNode; component?: string }

interface ComponentPage { Examples: () => ReactNode; AllBrands: () => ReactNode }
const COMPONENTS: Array<{ id: string; page: ComponentPage }> = [
  { id: 'habit-card', page: HabitCard },
  { id: 'checkbox', page: Checkbox },
  { id: 'bottom-sheet', page: BottomSheet },
  { id: 'segmented-control', page: SegmentedControl },
  { id: 'metric-card', page: MetricCard },
];

export const TABS = [
  { suffix: '', label: 'Examples' },
  { suffix: '/all-brands', label: 'All brands' },
  { suffix: '/spec', label: 'Spec' },
];

const componentRoutes: Route[] = COMPONENTS.flatMap(({ id, page }) => {
  const name = loadSpec(id).name as string;
  const base = `/components/${id}`;
  const make = (suffix: string, render: () => ReactNode): Route => ({ path: base + suffix, title: name, group: 'Components', component: id, render });
  return [
    make('', () => <><h1 style={{ margin: '0 0 16px', fontSize: 32, letterSpacing: -0.5 }}>{name}</h1>{page.Examples()}</>),
    make('/all-brands', () => <><h1 style={{ margin: '0 0 8px', fontSize: 32, letterSpacing: -0.5 }}>{name}</h1><p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 14 }}>Every brand, light and dark, ignoring the selectors above.</p>{page.AllBrands()}</>),
    make('/spec', () => <SpecView id={id} />),
  ];
});

export const ROUTES: Route[] = [
  { path: '/', title: 'Introduction', group: 'Overview', render: () => <Overview /> },
  { path: '/foundations/colors', title: 'Colors', group: 'Foundations', render: () => <Colors /> },
  { path: '/foundations/typography', title: 'Typography', group: 'Foundations', render: () => <Typography /> },
  { path: '/foundations/shape-and-spacing', title: 'Shape and spacing', group: 'Foundations', render: () => <ShapeAndSpacing /> },
  { path: '/foundations/brands', title: 'Brands side by side', group: 'Foundations', render: () => <Brands /> },
  ...componentRoutes,
  { path: '/audit/contrast', title: 'Contrast', group: 'Audit', render: () => <Contrast /> },
  { path: '/audit/inventory', title: 'Inventory', group: 'Audit', render: () => <Inventory /> },
];

/** Sidebar: one entry per page, one per component (its tabs live on the page). */
export const NAV: NavItem[] = ROUTES.filter((r) => !r.component || r.path === `/components/${r.component}`);
