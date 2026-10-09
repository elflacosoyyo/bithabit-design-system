import YAML from 'yaml';
import { BRAND_IDS, MODES, brandName, getTheme } from '../../../src/theme/themes';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { contrast } from '../../../scripts/contrast.mjs';
import pairsRaw from '../../../tokens/contrast-pairs.yaml?raw';
import { Badge, Code, H1, H2, P, Page, Swatch, Table, getPath } from '../../helpers/ui';

/* eslint-disable @typescript-eslint/no-explicit-any */
const pairs = (YAML.parse(pairsRaw) as { pairs: Array<{ id: string; fg: string; bg: string; min: number; kind: string }> }).pairs;
const brandFiles = import.meta.glob('../../../brands/*/brand.yaml', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const brandMeta = (id: string): any => YAML.parse(brandFiles[`../../../brands/${id}/brand.yaml`]);
const waiverFor = (meta: any, pairId: string) =>
  (meta.accessibility?.waivers ?? []).find((w: any) => (w.pair.endsWith('*') ? pairId.startsWith(w.pair.slice(0, -1)) : w.pair === pairId));

const Contrast = () => {
  const { theme } = useTheme();
  let total = 0, pass = 0, waived = 0, fail = 0;
  const sections = BRAND_IDS.flatMap((brand) => MODES.map((mode) => {
    const t = getTheme(brand, mode);
    const meta = brandMeta(brand);
    const rows = pairs.map((p) => {
      const fg = getPath(t, p.fg) as string, bg = getPath(t, p.bg) as string;
      const ratio = contrast(fg, bg) as number;
      const ok = ratio >= p.min;
      const w = !ok ? waiverFor(meta, p.id) : undefined;
      total++; if (ok) pass++; else if (w) waived++; else fail++;
      return [
        <span key="s" style={{ display: 'inline-flex', gap: 4 }}><Swatch color={fg} size={20} round /><Swatch color={bg} size={20} round /></span>,
        <Code key="id">{p.id}</Code>,
        `${p.kind === 'text' ? 'text' : 'UI'} ≥ ${p.min}:1`,
        `${ratio.toFixed(2)}:1`,
        ok ? <Badge key="b" tone="pass">pass</Badge> : w ? <Badge key="b" tone="warn">waived {w.id}</Badge> : <Badge key="b" tone="fail">fail</Badge>,
        w ? <span key="r" style={{ color: theme.color.text.secondary }}>{w.status}</span> : '',
      ];
    });
    return { brand, mode, rows };
  }));
  return (
    <Page maxWidth={1000}>
      <H1>Contrast audit</H1>
      <P muted>WCAG 2.2 AA for every brand and mode, computed from the tokens (same math as <Code>npm run validate</Code>). Text needs 4.5:1, UI shapes 3:1. Waivers are documented in each <Code>brand.yaml</Code> and never silent.</P>
      <P><Badge tone="pass">{pass} pass</Badge> <Badge tone="warn">{waived} waived</Badge> <Badge tone={fail ? 'fail' : 'pass'}>{fail} failing</Badge> <span style={{ color: theme.color.text.secondary }}>of {total} checks</span></P>
      {sections.map(({ brand, mode, rows }) => (
        <div key={brand + mode}>
          <H2>{brandName(brand)} · {mode}</H2>
          <Table head={['fg / bg', 'Pair', 'Requirement', 'Ratio', 'Result', 'Waiver status']} rows={rows} />
        </div>
      ))}
    </Page>
  );
};

export default Contrast;
