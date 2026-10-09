import YAML from 'yaml';
import { useTheme } from '../../../src/theme/ThemeProvider';
import compatRaw from '../../../tokens/compat.yaml?raw';
import { Code, H1, H2, P, Page, Swatch, Table } from '../../helpers/ui';

interface Compat { colors: Record<string, string>; extras: Record<string, string> }
const compat = YAML.parse(compatRaw) as Compat;
const kebab = (s: string) => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
// design-system token path -> Tailwind class name used by the app (BitHabit naming)
const nameFor = new Map<string, string>([...Object.entries(compat.colors), ...Object.entries(compat.extras)].map(([name, path]) => [path, name]));

const flat = (obj: Record<string, unknown>, prefix: string[] = []): Array<[string[], string]> =>
  Object.entries(obj).flatMap(([k, v]) => (typeof v === 'object' && v ? flat(v as Record<string, unknown>, [...prefix, kebab(k)]) : [[[...prefix, kebab(k)], String(v)] as [string[], string]]));

const Colors = () => {
  const { theme, brand, mode } = useTheme();
  const groups = Object.entries(theme.color as Record<string, Record<string, unknown>>);
  return (
    <Page>
      <H1>Colors</H1>
      <P muted>Semantic color roles for <b>{brand}</b> · <b>{mode}</b>. Components read these roles, never raw palette values. The last column is the name the app already uses in Tailwind/CSS.</P>
      {groups.map(([group, tokens]) => (
        <div key={group}>
          <H2>{group}</H2>
          <Table
            head={['', 'Token', 'Value', 'App name (Tailwind / CSS)']}
            rows={flat(tokens, ['color', kebab(group)]).map(([path, value]) => {
              const dotted = path.join('.');
              const isColor = /^(#|rgba?\()/.test(value);
              return [isColor ? <Swatch key="s" color={value} /> : '', <Code key="t">{dotted}</Code>, <Code key="v">{value}</Code>, nameFor.get(dotted) ? <Code key="n">{nameFor.get(dotted)}</Code> : <span style={{ opacity: 0.5 }}>new role</span>];
            })}
          />
        </div>
      ))}
    </Page>
  );
};

export default Colors;
