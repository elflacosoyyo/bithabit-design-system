import { BRAND_IDS, MODES, brandName, getTheme } from '../../../src/theme/themes';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { Code, H1, P, Page, Swatch } from '../../helpers/ui';

const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
const flat = (obj: Record<string, unknown>, prefix: string[] = []): Array<[string, string]> =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' && v ? flat(v as Record<string, unknown>, [...prefix, kebab(k)]) : [[[...prefix, kebab(k)].join('.'), String(v)] as [string, string]]));

/** Every semantic color role for every brand and mode. The white-label seam made visible: differences between columns are the brand. */
const Brands = () => {
  const { theme } = useTheme();
  const cols = BRAND_IDS.flatMap((b) => MODES.map((m) => ({ b, m })));
  const roles = flat(getTheme('bithabit', 'light').color as Record<string, unknown>, ['color']).map(([p]) => p);
  const valueOf = (b: string, m: 'light' | 'dark', path: string) => flat(getTheme(b, m).color as Record<string, unknown>, ['color']).find(([p]) => p === path)?.[1] ?? '';
  const cell = { padding: '6px 8px', borderBottom: `1px solid ${theme.color.border.default}`, fontSize: 12 } as const;
  return (
    <Page maxWidth={1300}>
      <H1>Brands side by side</H1>
      <P muted>Same roles, every brand and mode. A brand overrides only semantic tokens, so this table is the complete visual difference between clients.</P>
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
        <thead>
          <tr>
            <th style={{ ...cell, textAlign: 'left' }}>Role</th>
            {cols.map(({ b, m }) => <th key={b + m} style={{ ...cell, textAlign: 'left' }}>{brandName(b)}<br /><span style={{ fontWeight: 400, color: theme.color.text.secondary }}>{m}</span></th>)}
          </tr>
        </thead>
        <tbody>
          {roles.map((path) => (
            <tr key={path}>
              <td style={cell}><Code>{path}</Code></td>
              {cols.map(({ b, m }) => {
                const v = valueOf(b, m, path);
                return <td key={b + m} style={cell}><span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}><Swatch color={v} size={22} round /><Code>{v}</Code></span></td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </Page>
  );
};

export default Brands;
