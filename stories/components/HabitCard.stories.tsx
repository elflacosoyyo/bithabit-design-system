import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { HabitCard } from '../../src';
import { BrandMatrix } from '../_helpers/BrandMatrix';
import { SpecView } from '../_helpers/SpecView';
import { useSample } from '../_helpers/sample';

const meta = {
  title: 'Components/HabitCard',
  component: HabitCard,
  args: { title: 'Evening walk', completed: false, history: [true, true, false, true, true, true, false], onToggle: fn(), onPress: fn() },
  argTypes: { history: { control: 'object' } },
  decorators: [(Story, ctx) => (ctx.parameters.bare ? <Story /> : <div style={{ maxWidth: 420 }}><Story /></div>)],
} satisfies Meta<typeof HabitCard>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Completed: Story = { args: { completed: true, history: [true, true, false, true, true, true, true] } };
export const EmptyHistory: Story = { args: { history: [false, false, false, false, false, false, false] } };
export const FullWeek: Story = { args: { completed: true, history: [true, true, true, true, true, true, true] } };
export const Disabled: Story = { args: { disabled: true } };

const TodayList = ({ count = 4 }: { count?: number }) => {
  const sample = useSample();
  const [done, setDone] = useState<boolean[]>(() => sample.habits.map((_, i) => i === 0));
  return (
    <div>
      {sample.habits.slice(0, count).map((title, i) => {
        const hist = [...sample.history[i]];
        hist[6] = done[i];
        return (
          <HabitCard
            key={title}
            title={title}
            completed={done[i]}
            history={hist}
            onToggle={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            onPress={() => undefined}
          />
        );
      })}
    </div>
  );
};

/** Press a checkbox: the card completes and today's segment fills. The title localizes with the selected brand. */
export const Interactive: Story = {
  render: () => <TodayList />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const boxes = await canvas.findAllByRole('checkbox');
    await expect(boxes[1]).toHaveAttribute('aria-checked', 'false');
    await userEvent.click(boxes[1]);
    await waitFor(() => expect(boxes[1]).toHaveAttribute('aria-checked', 'true'));
    // the card's accessible name follows the state
    await expect(canvas.getAllByRole('button').some((b) => /, completed today$/.test(b.getAttribute('aria-label') ?? ''))).toBe(true);
  },
};

export const AllBrands: Story = {
  parameters: { layout: 'padded', bare: true },
  render: () => <BrandMatrix><TodayList count={3} /></BrandMatrix>,
};

export const Spec: Story = { render: () => <SpecView id="habit-card" />, parameters: { layout: 'padded', bare: true } };
