import { fontFamily, textStyle, useTheme } from '../../../src/theme/ThemeProvider';
import { Code, H1, H2, P, Page, Table } from '../../helpers/ui';
import { useSample } from '../../helpers/sample';

const Typography = () => {
  const { theme, brand, mode } = useTheme();
  const sample = useSample();
  const names = Object.keys(theme.typography) as Array<keyof typeof theme.typography>;
  const text: Record<string, string> = {
    display: sample.sheetTitle, heading: sample.sheetTitle, screenTitle: sample.stats.title, body: sample.notes, reading: sample.notes,
    cardTitle: sample.habits[0], caption: sample.stats.subtitle, labelCaps: sample.stats.title, metric: sample.stats.value,
  };
  return (
    <Page>
      <H1>Typography</H1>
      <P muted>Text styles for <b>{brand}</b> · <b>{mode}</b>. Each style names a font <i>role</i> (<Code>sans</Code> or <Code>display</Code>); the display face is resolved per platform.</P>
      <H2>Font families</H2>
      <Table
        head={['Role', 'iOS', 'Android', 'Web']}
        rows={[
          ['sans', theme.font.family.sans, theme.font.family.sans, theme.font.family.sans],
          ['display', theme.font.family.display.ios, theme.font.family.display.android, theme.font.family.display.web],
        ]}
      />
      <H2>Text styles</H2>
      {names.map((n) => {
        const st = textStyle(theme, n);
        return (
          <div key={n} style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 16, alignItems: 'baseline', padding: '14px 0', borderBottom: `1px solid ${theme.color.border.default}` }}>
            <div>
              <Code>typography.{n}</Code>
              <div style={{ fontSize: 12, color: theme.color.text.secondary, marginTop: 6 }}>
                {fontFamily(theme, theme.typography[n].fontFamily as 'sans' | 'display')} · {st.fontSize}/{st.lineHeight} · {st.fontWeight} · {st.letterSpacing}px
              </div>
            </div>
            <div style={{ fontFamily: st.fontFamily, fontSize: st.fontSize, fontWeight: Number(st.fontWeight), lineHeight: `${st.lineHeight}px`, letterSpacing: st.letterSpacing, textTransform: (st as { textTransform?: 'uppercase' }).textTransform }}>
              {text[n as string] ?? sample.habits[0]}
            </div>
          </div>
        );
      })}
      <H2>Scale</H2>
      <Table head={['Token', 'Size', 'Line height']} rows={Object.entries(theme.font.size).map(([k, v]) => [<Code key="k">font.size.{k}</Code>, `${v}px`, `${(theme.font.lineHeight as Record<string, number>)[k]}px`])} />
    </Page>
  );
};

export default Typography;
