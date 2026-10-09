import type { Meta, StoryObj } from '@storybook/react-vite';
import { MetricCard } from '../../src';
import { ArrowGlyph } from '../../src/components/Glyphs';
import { useTheme } from '../../src/theme/ThemeProvider';
import { BrandMatrix } from '../_helpers/BrandMatrix';
import { SpecView } from '../_helpers/SpecView';
import { ChangeIndicator, SegmentBar } from '../_helpers/pieces';
import { useSample } from '../_helpers/sample';

const Icon = () => {
  const { theme } = useTheme();
  return <ArrowGlyph direction="up-right" size={16} color={theme.color.text.primary} />;
};

const meta = {
  title: 'Components/MetricCard',
  component: MetricCard,
  args: {
    icon: <Icon />,
    title: 'Overall compliance',
    value: '87%',
    valueTone: 'accent',
    subtitle: 'this month',
    accessibilityLabel: 'Overall compliance, 87 percent this month',
  },
  argTypes: { valueTone: { control: 'inline-radio', options: ['accent', 'foreground', 'muted'] } },
} satisfies Meta<typeof MetricCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { value: 0, valueTone: 'muted', subtitle: 'no data yet', accessibilityLabel: 'Overall compliance, no data yet' } };
export const WithPositiveChange: Story = { args: { footer: <ChangeIndicator change={6} suffix="vs. last month" /> } };
export const WithNegativeChange: Story = { args: { value: '81%', footer: <ChangeIndicator change={-9} suffix="vs. last month" /> } };
export const WithSegmentBar: Story = { args: { value: 28, valueTone: 'foreground', title: 'Most completed', subtitle: 'times', footer: <SegmentBar segments={[true, true, true, true, false, false, true, true]} /> } };

const Rail = () => {
  const s = useSample().stats;
  return (
    <div style={{ display: 'flex', gap: 12, overflowX: 'auto' }}>
      <MetricCard icon={<Icon />} title={s.title} value={s.value} valueTone="accent" subtitle={s.subtitle} footer={<ChangeIndicator change={s.change} suffix={s.changeSuffix} />} accessibilityLabel={`${s.title}, ${s.value} ${s.subtitle}`} />
      <MetricCard icon={<Icon />} title={s.emptyTitle} value={28} valueTone="foreground" subtitle={s.emptySubtitle} footer={<SegmentBar segments={[true, true, true, true, false, false, true, true]} />} accessibilityLabel={`${s.emptyTitle}, 28 ${s.emptySubtitle}`} />
    </div>
  );
};
export const InARail: Story = { render: () => <Rail /> };
export const AllBrands: Story = { parameters: { layout: 'padded' }, render: () => <BrandMatrix minWidth={420}><Rail /></BrandMatrix> };
export const Spec: Story = { render: () => <SpecView id="metric-card" />, parameters: { layout: 'padded' } };
