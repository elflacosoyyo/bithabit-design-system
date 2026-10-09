// "Notes" tab: the screen's contract rendered as documentation (components used, what is pending, annotations, sources).
import { useTheme } from '../../src/theme/ThemeProvider';
import { Badge, Code, H1, H2, P, Page, Table } from '../helpers/ui';
import { TYPE_COLOR, TYPE_LABEL } from './annotations';
import { loadScreen } from './data';
import { allSpecs } from '../helpers/SpecView';

export const ScreenNotes = ({ id }: { id: string }) => {
  const { brand, mode } = useTheme();
  const s = loadScreen(id);
  const specStatus = new Map<string, string>(allSpecs().map((x: { id: string; status: string; version: string }) => [x.id, `${x.status} v${x.version}`]));
  const link = (cid: string) => (specStatus.has(cid) ? <a key={cid} href={`#/components/${cid}?brand=${brand}&mode=${mode}`} style={{ color: 'inherit' }}>{cid}</a> : <span key={cid}>{cid}</span>);
  return (
    <Page>
      <H1>{s.name}</H1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}><Badge tone="warn">{s.status}</Badge><Badge>v{s.version}</Badge></div>
      <P>{s.summary}</P>
      <P muted>App route: <Code>{s.route}</Code></P>

      <H2>Components used</H2>
      <Table head={['Component', 'Contract', 'Role on this screen']} rows={s.components.map((c) => [link(c.id), specStatus.get(c.id) ?? 'no contract yet', c.role])} />

      {s.pending?.length ? (
        <>
          <H2>Not recreated yet</H2>
          <Table head={['Part', 'What is missing', 'Needs']} rows={s.pending.map((p) => [p.name, p.note, (p.needs ?? []).map((n) => <span key={n}>{link(n)} </span>)])} />
        </>
      ) : null}

      <H2>States</H2>
      <Table head={['State', 'Description']} rows={s.states.map((x) => [<Code key="i">{x.id}</Code>, `${x.label}: ${x.description}`])} />

      <H2>Annotations</H2>
      <Table
        head={['Id', 'Type', 'Attached to', 'Note']}
        rows={s.annotations.map((a) => [
          <span key="i" style={{ background: TYPE_COLOR[a.type], color: '#fff', font: '600 11px/18px Inter, sans-serif', borderRadius: 100, padding: '1px 8px' }}>{a.id}</span>,
          TYPE_LABEL[a.type],
          <span key="t"><Code>{a.target}</Code>{a.component ? <> · {link(a.component)}</> : null}{a.decision ? <> · {a.decision}</> : null}</span>,
          a.text,
        ])}
      />

      <H2>Sources</H2>
      <Table
        head={['Kind', 'Reference']}
        rows={[
          ...(s.sources.figma ?? []).map((f) => ['Figma', `${f.name ?? ''} (file ${f.file}, node ${f.node})`]),
          ...(s.sources.code ?? []).map((c) => ['Code', `${c.repo}: ${c.path}${c.commit ? ` @ ${c.commit}` : ''} ${c.verified ? '(verified)' : '(not verified)'}`]),
        ]}
      />
      <H2>Changelog</H2>
      {s.changelog.map((c) => <div key={c.version} style={{ fontSize: 14, marginBottom: 8 }}><b>v{c.version}</b> {c.date}<ul style={{ margin: '4px 0', paddingLeft: 20 }}>{c.changes.map((x) => <li key={x}>{x}</li>)}</ul></div>)}
    </Page>
  );
};
