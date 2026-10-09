import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { SegmentedControl } from '../../src';
import { BrandMatrix } from '../_helpers/BrandMatrix';
import { SpecView } from '../_helpers/SpecView';
import { useSample } from '../_helpers/sample';

const meta = {
  title: 'Components/SegmentedControl',
  component: SegmentedControl,
  args: { labels: ['Notes', 'History'], selectedIndex: 0, onSelect: fn(), accessibilityLabel: 'Habit detail view' },
  decorators: [(Story, ctx) => (ctx.parameters.bare ? <Story /> : <div style={{ maxWidth: 360 }}><Story /></div>)],
} satisfies Meta<typeof SegmentedControl>;
export default meta;
type Story = StoryObj<typeof meta>;

export const TwoSegments: Story = {};
export const ThreeSegments: Story = { args: { labels: ['Norm', 'Notes', 'History'], selectedIndex: 1 } };

const Demo = () => {
  const sample = useSample();
  const [i2, setI2] = useState(0);
  const [i3, setI3] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SegmentedControl labels={sample.tabs2} selectedIndex={i2} onSelect={setI2} accessibilityLabel="Two segments" />
      <SegmentedControl labels={sample.tabs3} selectedIndex={i3} onSelect={setI3} accessibilityLabel="Three segments" />
    </div>
  );
};
export const Interactive: Story = {
  render: () => <Demo />,
  play: async ({ canvasElement }) => {
    const tabs = await within(canvasElement).findAllByRole('tab');
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'true');
    await userEvent.click(tabs[1]);
    await waitFor(() => expect(tabs[1]).toHaveAttribute('aria-selected', 'true'));
    await expect(tabs[0]).toHaveAttribute('aria-selected', 'false');
  },
};
export const AllBrands: Story = { parameters: { layout: 'padded', bare: true }, render: () => <BrandMatrix><Demo /></BrandMatrix> };
export const Spec: Story = { render: () => <SpecView id="segmented-control" />, parameters: { layout: 'padded', bare: true } };
