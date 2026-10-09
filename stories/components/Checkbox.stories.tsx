import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Checkbox } from '../../src';
import { BrandMatrix } from '../_helpers/BrandMatrix';
import { SpecView } from '../_helpers/SpecView';

const meta = {
  title: 'Components/Checkbox',
  component: Checkbox,
  args: { checked: false, onChange: fn(), accessibilityLabel: 'Evening walk' },
} satisfies Meta<typeof Checkbox>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { checked: true } };
export const Disabled: Story = { args: { disabled: true } };

const Row = () => {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Checkbox checked={a} onChange={setA} accessibilityLabel="Unchecked example" />
      <Checkbox checked={b} onChange={setB} accessibilityLabel="Checked example" />
      <Checkbox checked={false} disabled onChange={() => undefined} accessibilityLabel="Disabled example" />
    </div>
  );
};

export const Interactive: Story = {
  render: () => <Row />,
  play: async ({ canvasElement }) => {
    const first = await within(canvasElement).findByRole('checkbox', { name: 'Unchecked example' });
    await expect(first).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(first);
    await waitFor(() => expect(first).toHaveAttribute('aria-checked', 'true'));
    const disabled = within(canvasElement).getByRole('checkbox', { name: 'Disabled example' });
    await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  },
};
export const AllBrands: Story = { parameters: { layout: 'padded' }, render: () => <BrandMatrix minWidth={280}><Row /></BrandMatrix> };
export const Spec: Story = { render: () => <SpecView id="checkbox" />, parameters: { layout: 'padded' } };
