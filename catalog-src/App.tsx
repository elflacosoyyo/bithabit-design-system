import { useCallback, useEffect, useMemo, useState } from 'react';
import { ThemeProvider, useTheme } from '../src/theme/ThemeProvider';
import { BRAND_IDS, brandName, type Mode } from '../src/theme/themes';
import { NAV, ROUTES, TABS } from './registry';
import './styles.css';

const store = {
  get: (k: string) => { try { return window.localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { window.localStorage.setItem(k, v); } catch { /* storage can be blocked (private window, file://): the catalog works without it */ } },
};

interface Hash { path: string; params: URLSearchParams }
const readHash = (): Hash => {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path || '/', params: new URLSearchParams(query) };
};

const Shell = ({ hash, brand, mode, setParam }: { hash: Hash; brand: string; mode: Mode; setParam: (k: 'brand' | 'mode', v: string) => void }) => {
  const { theme } = useTheme();
  const route = ROUTES.find((r) => r.path === hash.path) ?? ROUTES[0];
  const href = useCallback((path: string) => `#${path}?brand=${brand}&mode=${mode}`, [brand, mode]);
  const dark = mode === 'dark';
  // Neutral chrome: the shell does not take the brand's colors, so the brand is only seen in what is being displayed.
  const chrome = dark
    ? { '--shell-bg': '#0b0f19', '--shell-surface': '#161b26', '--shell-fg': '#f3f4f6', '--shell-muted': '#9ca3af', '--line': '#252b38' }
    : { '--shell-bg': '#ffffff', '--shell-surface': '#f3f4f6', '--shell-fg': '#111827', '--shell-muted': '#4b5563', '--line': '#e5e7eb' };

  useEffect(() => { document.title = `${route.title} · BITHABIT Design System`; }, [route.title]);

  return (
    <div className="shell" style={{ ...(chrome as React.CSSProperties), background: 'var(--shell-bg)', color: 'var(--shell-fg)', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <header className="topbar">
        <h1>BITHABIT Design System</h1>
        <label>Brand
          <select aria-label="Brand" value={brand} onChange={(e) => setParam('brand', e.target.value)}>
            {BRAND_IDS.map((id) => <option key={id} value={id}>{brandName(id)}</option>)}
          </select>
        </label>
        <div className="seg" role="group" aria-label="Mode">
          {(['light', 'dark'] as const).map((m) => <button key={m} aria-pressed={mode === m} onClick={() => setParam('mode', m)}>{m === 'light' ? 'Light' : 'Dark'}</button>)}
        </div>
      </header>
      <nav className="side" aria-label="Catalog">
        {(['Overview', 'Foundations', 'Components', 'Audit'] as const).map((group) => (
          <div key={group} style={{ display: 'contents' }}>
            <h2>{group}</h2>
            {NAV.filter((n) => n.group === group).map((n) => (
              <a key={n.path} href={href(n.path)} aria-current={route.path === n.path || (route.component && n.path === `/components/${route.component}`) ? 'page' : undefined}>{n.title}</a>
            ))}
          </div>
        ))}
      </nav>
      <main className="stage" data-route={route.path}>
        {/* The brand's canvas is the stage the content sits on */}
        <div className="content" style={{ background: theme.color.bg.canvas, color: theme.color.text.primary, fontFamily: theme.font.family.sans }}>
          {route.component ? (
            <nav className="tabs" aria-label="Component views" style={{ ['--line' as string]: theme.color.border.default, ['--shell-muted' as string]: theme.color.text.secondary, ['--shell-fg' as string]: theme.color.text.primary }}>
              {TABS.map((t) => {
                const p = `/components/${route.component}${t.suffix}`;
                return <a key={t.label} href={href(p)} aria-current={route.path === p ? 'page' : undefined}>{t.label}</a>;
              })}
            </nav>
          ) : null}
          {route.render()}
        </div>
      </main>
    </div>
  );
};

export const App = () => {
  const [hash, setHash] = useState<Hash>(readHash);
  useEffect(() => {
    const on = () => setHash(readHash());
    window.addEventListener('hashchange', on);
    return () => window.removeEventListener('hashchange', on);
  }, []);

  const brand = useMemo(() => {
    const q = hash.params.get('brand') ?? store.get('bh-brand');
    return q && BRAND_IDS.includes(q) ? q : BRAND_IDS[0];
  }, [hash]);
  const mode: Mode = useMemo(() => {
    const q = hash.params.get('mode') ?? store.get('bh-mode');
    return q === 'dark' || q === 'light' ? q : window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }, [hash]);

  const setParam = useCallback((k: 'brand' | 'mode', v: string) => {
    store.set(`bh-${k}`, v);
    const params = new URLSearchParams(window.location.hash.split('?')[1] ?? '');
    params.set('brand', k === 'brand' ? v : brand);
    params.set('mode', k === 'mode' ? v : mode);
    window.location.hash = `${readHash().path}?${params.toString()}`;
  }, [brand, mode]);

  useEffect(() => {
    (window as unknown as { __CATALOG__: unknown }).__CATALOG__ = { routes: ROUTES.map((r) => r.path), brands: BRAND_IDS };
  }, []);

  return (
    <ThemeProvider brand={brand} mode={mode}>
      <Shell hash={hash} brand={brand} mode={mode} setParam={setParam} />
    </ThemeProvider>
  );
};
