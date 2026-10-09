// Renders a component's contract (spec.yaml + usage.md) as a documentation page, with token values resolved for the active brand and mode.
import YAML from 'yaml';
import { marked } from 'marked';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Badge, Code, H1, H2, Label, P, Page, Swatch, Table, getPath } from './ui';

const specs = import.meta.glob('../../components/*/*.spec.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const usages = import.meta.glob('../../components/*/*.usage.md', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const loadSpec = (id: string): any => YAML.parse(specs[`../../components/${id}/${id}.spec.yaml`]);
export const allSpecs = (): any[] => Object.values(specs).map((raw) => YAML.parse(raw));
const usageMd = (id: string): string => usages[`../../components/${id}/${id}.usage.md`] ?? '';

const TokenValue = ({ path }: { path: string }) => {
  const { theme } = useTheme();
  const v = getPath(theme, path);
  const isColor = typeof v === 'string' && /^(#|rgba?\()/.test(v);
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      {isColor ? <Swatch color={v as string} size={16} round /> : null}
      <Code>{v === undefined ? 'n/a' : String(v)}</Code>
    </span>
  );
};

const List = ({ items }: { items: string[] }) => (
  <ul style={{ margin: '0 0 12px', paddingLeft: 20, fontSize: 14, lineHeight: '21px' }}>
    {items.map((x, i) => <li key={i}>{x}</li>)}
  </ul>
);

export const SpecView = ({ id }: { id: string }) => {
  const { theme, brand, mode } = useTheme();
  const s = loadSpec(id);
  // The page already shows the component name as its title, so drop the guide's own H1 and the spec-link line.
  const md = usageMd(id).replace(/^# .*\n+/, '').replace(/^> Spec:.*\n+/, '');
  const html = marked.parse(md, { async: false }) as string;
  const tone = s.status === 'stable' ? 'pass' : s.status === 'deprecated' ? 'fail' : 'warn';
  return (
    <Page>
      <H1>{s.name}</H1>
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12, flexWrap: 'wrap' }}>
        <Badge tone={tone}>{s.status}</Badge><Badge>v{s.version}</Badge><Badge>{s.category}</Badge>
        {s.platforms.map((p: string) => <Badge key={p}>{p}</Badge>)}
        {s.surfaces.map((p: string) => <Badge key={p}>surface: {p}</Badge>)}
      </div>
      <P>{s.summary}</P>
      <P muted>{s.purpose}</P>

      <H2>Usage guide</H2>
      <style>{`
        .usage-md h2 { font-size: 17px; margin: 22px 0 6px; }
        .usage-md ul { padding-left: 20px; margin: 0 0 8px; }
        .usage-md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12.5px; background: ${theme.color.bg.surfaceAlt}; padding: 1px 5px; border-radius: 4px; }
        .usage-md pre { background: ${theme.color.bg.surface}; border: 1px solid ${theme.color.border.default}; border-radius: 8px; padding: 12px 14px; overflow-x: auto; }
        .usage-md pre code { background: none; padding: 0; }
        .usage-md a { color: ${theme.color.text.accent}; }
      `}</style>
      <div className="usage-md" style={{ fontSize: 14.5, lineHeight: '22px' }} dangerouslySetInnerHTML={{ __html: html }} />

      <H2>Anatomy</H2>
      <Table head={['Part', 'Description', 'Required']} rows={s.anatomy.map((a: any) => [<Code key="p">{a.part}</Code>, a.description, a.required ? 'yes' : 'no'])} />

      <H2>Props</H2>
      <Table head={['Name', 'Type', 'Required', 'Default', 'Description']} rows={s.props.map((p: any) => [<Code key="n">{p.name}</Code>, <Code key="t">{p.type}</Code>, p.required ? 'yes' : 'no', p.default === undefined ? '' : <Code key="d">{String(p.default)}</Code>, p.description])} />

      {s.variants ? (<><H2>Variants</H2><Table head={['Name', 'Description']} rows={s.variants.map((v: any) => [<Code key="n">{v.name}</Code>, v.description])} /></>) : null}

      <H2>States</H2>
      <Table head={['State', 'Description']} rows={s.states.map((v: any) => [<Code key="n">{v.name}</Code>, v.description])} />

      <H2>Tokens</H2>
      <P muted>Values for the active selection: <b>{brand}</b> · <b>{mode}</b>. Change brand or mode in the toolbar.</P>
      <Table head={['Token', 'Value']} rows={s.tokens.map((t: string) => [<Code key="t">{t}</Code>, <TokenValue key="v" path={t} />])} />

      <H2>Accessibility</H2>
      <Table head={['Role', 'Label', 'Touch target']} rows={[[<Code key="r">{s.accessibility.role}</Code>, s.accessibility.label ?? '', s.accessibility.touch_target ?? '']]} />
      <List items={s.accessibility.notes} />

      <H2>Behavior</H2>
      <List items={s.behavior} />

      {s.code_gaps?.length ? (<><H2>Code gaps</H2><P muted>Differences between the production code and this contract. Not blockers; the ds-sync skill will report them to developers.</P><List items={s.code_gaps} /></>) : null}
      {s.open_questions?.length ? (<><H2>Open questions</H2><List items={s.open_questions} /></>) : null}

      <H2>Sources</H2>
      <Table
        head={['Kind', 'Reference']}
        rows={[
          ...(s.sources.figma ?? []).map((f: any) => ['Figma', `${f.name ?? ''} (file ${f.file}, node ${f.node})`]),
          ...(s.sources.code ?? []).map((c: any) => ['Code', `${c.repo}: ${c.path}${c.commit ? ` @ ${c.commit}` : ''} ${c.verified ? '(verified)' : '(not verified)'}`]),
          ...(s.sources.videos ?? []).map((v: string) => ['Video', v]),
          ...(s.sources.claude_design ?? []).map((v: string) => ['Claude Design', v]),
        ]}
      />
      <Label>Changelog</Label>
      {s.changelog.map((c: any) => (
        <div key={c.version} style={{ marginBottom: 8, fontSize: 14 }}>
          <b>v{c.version}</b> <span style={{ color: theme.color.text.secondary }}>{c.date}</span>
          <List items={c.changes} />
        </div>
      ))}
    </Page>
  );
};
