import { MetricCard } from '../../../src';
import { ArrowGlyph } from '../../../src/components/Glyphs';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example } from '../../helpers/layout';
import { ChangeIndicator, SegmentBar } from '../../helpers/pieces';
import { useSample } from '../../helpers/sample';

const Icon = () => {
  const { theme } = useTheme();
  return <ArrowGlyph direction="up-right" size={16} color={theme.color.text.primary} />;
};

const base = { icon: <Icon />, title: 'Overall compliance', valueTone: 'accent' as const, subtitle: 'this month' };
const history = [true, true, true, true, false, false, true, true];

const Rail = () => {
  const s = useSample().stats;
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
      <MetricCard icon={<Icon />} title={s.title} value={s.value} valueTone="accent" subtitle={s.subtitle} footer={<ChangeIndicator change={s.change} suffix={s.changeSuffix} />} accessibilityLabel={`${s.title}, ${s.value} ${s.subtitle}`} />
      <MetricCard icon={<Icon />} title={s.emptyTitle} value={28} valueTone="foreground" subtitle={s.emptySubtitle} footer={<SegmentBar segments={history} />} accessibilityLabel={`${s.emptyTitle}, 28 ${s.emptySubtitle}`} />
    </div>
  );
};

export const Examples = () => (
  <>
    <Example title="Default"><MetricCard {...base} value="87%" accessibilityLabel="Overall compliance, 87 percent this month" /></Example>
    <Example title="Empty" note="Value 0 with the muted tone: the card is never hidden."><MetricCard {...base} value={0} valueTone="muted" subtitle="no data yet" accessibilityLabel="Overall compliance, no data yet" /></Example>
    <Example title="Positive change" note="The change is a ChangeIndicator passed through the footer slot, not a prop of the card."><MetricCard {...base} value="87%" footer={<ChangeIndicator change={6} suffix="vs. last month" />} accessibilityLabel="Overall compliance, 87 percent this month, up 6 percent" /></Example>
    <Example title="Negative change"><MetricCard {...base} value="81%" footer={<ChangeIndicator change={-9} suffix="vs. last month" />} accessibilityLabel="Overall compliance, 81 percent this month, down 9 percent" /></Example>
    <Example title="With segment bar"><MetricCard {...base} title="Most completed" value={28} valueTone="foreground" subtitle="times" footer={<SegmentBar segments={history} />} accessibilityLabel="Most completed, 28 times" /></Example>
    <Example title="In a rail" width={460}><Rail /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={420}><Rail /></BrandMatrix>;
