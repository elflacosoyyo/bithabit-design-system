import type { ReactNode } from 'react';
import Overview from './pages/Overview';
import Colors from './pages/foundations/Colors';
import Typography from './pages/foundations/Typography';
import ShapeAndSpacing from './pages/foundations/ShapeAndSpacing';
import Brands from './pages/foundations/Brands';
import Contrast from './pages/audit/Contrast';
import Inventory from './pages/audit/Inventory';
import * as Button from './pages/components/Button';
import * as HabitCard from './pages/components/HabitCard';
import * as Checkbox from './pages/components/Checkbox';
import * as BottomSheet from './pages/components/BottomSheet';
import * as SegmentedControl from './pages/components/SegmentedControl';
import * as MetricCard from './pages/components/MetricCard';
import * as IconButton from './pages/components/IconButton';
import * as NavHeader from './pages/components/NavHeader';
import * as HeaderBar from './pages/components/HeaderBar';
import * as EmptyState from './pages/components/EmptyState';
import * as DrawerMenu from './pages/components/DrawerMenu';
import * as CalendarDay from './pages/components/CalendarDay';
import * as MonthCalendar from './pages/components/MonthCalendar';
import * as HomeScreen from './pages/screens/Home';
import * as MenuScreen from './pages/screens/Menu';
import { Prototype } from './pages/screens/Prototype';
import { SpecView, loadSpec } from './helpers/SpecView';
import { loadScreen } from './screens/data';

export interface NavItem { path: string; title: string; group: 'Overview' | 'Foundations' | 'Components' | 'Screens' | 'Audit' }
export interface Tab { suffix: string; label: string }
/** `base` and `tabs` are set on pages that share one sidebar entry and switch views with tabs (components and screens). */
export interface Route extends NavItem { render: () => ReactNode; base?: string; tabs?: Tab[] }

interface ComponentPage { Examples: () => ReactNode; AllBrands: () => ReactNode }
const COMPONENTS: Array<{ id: string; page: ComponentPage }> = [
  { id: 'button', page: Button },
  { id: 'habit-card', page: HabitCard },
  { id: 'checkbox', page: Checkbox },
  { id: 'bottom-sheet', page: BottomSheet },
  { id: 'segmented-control', page: SegmentedControl },
  { id: 'metric-card', page: MetricCard },
  { id: 'icon-button', page: IconButton },
  { id: 'nav-header', page: NavHeader },
  { id: 'header-bar', page: HeaderBar },
  { id: 'empty-state', page: EmptyState },
  { id: 'drawer-menu', page: DrawerMenu },
  { id: 'calendar-day', page: CalendarDay },
  { id: 'month-calendar', page: MonthCalendar },
];

export const TABS: Tab[] = [
  { suffix: '', label: 'Examples' },
  { suffix: '/all-brands', label: 'All brands' },
  { suffix: '/spec', label: 'Spec' },
];
export const SCREEN_TABS: Tab[] = [
  { suffix: '', label: 'Screen' },
  { suffix: '/all-brands', label: 'All brands' },
  { suffix: '/notes', label: 'Notes' },
];

const componentRoutes: Route[] = COMPONENTS.flatMap(({ id, page }) => {
  const name = loadSpec(id).name as string;
  const base = `/components/${id}`;
  const make = (suffix: string, render: () => ReactNode): Route => ({ path: base + suffix, title: name, group: 'Components', base, tabs: TABS, render });
  return [
    make('', () => <><h1 style={{ margin: '0 0 16px', fontSize: 32, letterSpacing: -0.5 }}>{name}</h1>{page.Examples()}</>),
    make('/all-brands', () => <><h1 style={{ margin: '0 0 8px', fontSize: 32, letterSpacing: -0.5 }}>{name}</h1><p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 14 }}>Every brand, light and dark, ignoring the selectors above.</p>{page.AllBrands()}</>),
    make('/spec', () => <SpecView id={id} />),
  ];
});

interface ScreenPageModule { Screen: () => ReactNode; AllBrands: () => ReactNode; Notes: () => ReactNode }
const SCREENS: Array<{ id: string; page: ScreenPageModule }> = [
  { id: 'home', page: HomeScreen },
  { id: 'menu', page: MenuScreen },
];

const screenRoutes: Route[] = SCREENS.flatMap(({ id, page }) => {
  const name = loadScreen(id).name;
  const base = `/screens/${id}`;
  const make = (suffix: string, render: () => ReactNode): Route => ({ path: base + suffix, title: name, group: 'Screens', base, tabs: SCREEN_TABS, render });
  return [
    make('', () => page.Screen()),
    make('/all-brands', () => <><h1 style={{ margin: '0 0 8px', fontSize: 32, letterSpacing: -0.5 }}>{name}</h1><p style={{ margin: '0 0 16px', opacity: 0.7, fontSize: 14 }}>Every brand, light and dark, ignoring the selectors above.</p>{page.AllBrands()}</>),
    make('/notes', () => page.Notes()),
  ];
});

export const ROUTES: Route[] = [
  { path: '/', title: 'Introduction', group: 'Overview', render: () => <Overview /> },
  { path: '/foundations/colors', title: 'Colors', group: 'Foundations', render: () => <Colors /> },
  { path: '/foundations/typography', title: 'Typography', group: 'Foundations', render: () => <Typography /> },
  { path: '/foundations/shape-and-spacing', title: 'Shape and spacing', group: 'Foundations', render: () => <ShapeAndSpacing /> },
  { path: '/foundations/brands', title: 'Brands side by side', group: 'Foundations', render: () => <Brands /> },
  ...componentRoutes,
  { path: '/screens/prototype', title: 'Prototype', group: 'Screens', render: () => <Prototype /> },
  ...screenRoutes,
  { path: '/audit/contrast', title: 'Contrast', group: 'Audit', render: () => <Contrast /> },
  { path: '/audit/inventory', title: 'Inventory', group: 'Audit', render: () => <Inventory /> },
];

/** Sidebar: one entry per page, one per component (its tabs live on the page). */
export const NAV: NavItem[] = ROUTES.filter((r) => !r.base || r.path === r.base);
