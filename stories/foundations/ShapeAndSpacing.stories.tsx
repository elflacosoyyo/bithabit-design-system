import type { Meta, StoryObj } from '@storybook/react-vite';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Code, H1, H2, P, Page, Table } from '../_helpers/ui';

const Shape = () => {
  const { theme, brand } = useTheme();
  const box = { background: theme.color.accent.default, flexShrink: 0 } as const;
  return (
    <Page>
      <H1>Shape and spacing</H1>
      <P muted>Scales for <b>{brand}</b>. Shape and spacing do not change between light and dark, and in v1 brands do not override them.</P>
      <H2>Spacing</H2>
      <Table head={['Token', 'Value', '']} rows={Object.entries(theme.spacing).map(([k, v]) => [<Code key="k">spacing.{k}</Code>, `${v}px`, <div key="b" style={{ ...box, height: 12, width: v as number }} />])} />
      <H2>Radius</H2>
      <Table head={['Token', 'Value', '']} rows={Object.entries(theme.radius).map(([k, v]) => [<Code key="k">radius.{k}</Code>, `${v}px`, <div key="b" style={{ ...box, height: 40, width: 80, borderRadius: Math.min(v as number, 40) }} />])} />
      <H2>Border width</H2>
      <Table head={['Token', 'Value', '']} rows={Object.entries(theme.borderWidth).map(([k, v]) => [<Code key="k">border-width.{k}</Code>, `${v}px`, <div key="b" style={{ height: 28, width: 80, borderRadius: 8, border: `${v}px solid ${theme.color.text.primary}` }} />])} />
      <H2>Opacity</H2>
      <Table head={['Token', 'Value', '']} rows={Object.entries(theme.opacity).map(([k, v]) => [<Code key="k">opacity.{k}</Code>, String(v), <div key="b" style={{ ...box, height: 28, width: 80, borderRadius: 8, opacity: v as number }} />])} />
      <H2>Motion</H2>
      <Table head={['Token', 'Duration']} rows={Object.entries(theme.motion.duration).map(([k, v]) => [<Code key="k">motion.duration.{k}</Code>, `${v}ms`])} />
    </Page>
  );
};

const meta = { title: 'Foundations/Shape and spacing', component: Shape, parameters: { layout: 'padded' } } satisfies Meta<typeof Shape>;
export default meta;
export const Scales: StoryObj<typeof meta> = {};
