import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, fn, userEvent, waitFor, within } from 'storybook/test';
import { Text, View } from 'react-native';
import { BottomSheet, HabitCard, SegmentedControl } from '../../src';
import { fontFamily, textStyle, useTheme } from '../../src/theme/ThemeProvider';
import { BrandMatrix } from '../_helpers/BrandMatrix';
import { SpecView } from '../_helpers/SpecView';
import { useSample } from '../_helpers/sample';

const SheetContent = () => {
  const { theme } = useTheme();
  const sample = useSample();
  const [tab, setTab] = useState(0);
  return (
    <View style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.lg }}>
      <Text style={{ ...textStyle(theme, 'screenTitle'), color: theme.color.text.primary, marginBottom: theme.spacing.sm }}>{sample.sheetTitle}</Text>
      <SegmentedControl labels={sample.tabs2} selectedIndex={tab} onSelect={setTab} accessibilityLabel="Detail view" />
      <View style={{ marginTop: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.color.bg.surface }}>
        <Text style={{ fontFamily: fontFamily(theme, 'display'), fontSize: theme.font.size.body, lineHeight: theme.font.lineHeight.body, color: theme.color.text.primary }}>
          {tab === 0 ? sample.notes : '—'}
        </Text>
      </View>
    </View>
  );
};

/** Fake screen behind the sheet, so the backdrop and radius can be judged in context. */
const Frame = ({ children, height = 440 }: { children: React.ReactNode; height?: number }) => {
  const { theme } = useTheme();
  const sample = useSample();
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', borderRadius: 12, background: theme.color.bg.canvas, border: `1px solid ${theme.color.border.default}` }}>
      <div style={{ padding: '12px 0' }}>
        {sample.habits.slice(0, 3).map((t, i) => <HabitCard key={t} title={t} completed={i === 0} history={sample.history[i]} onToggle={() => undefined} onPress={() => undefined} />)}
      </div>
      {children}
    </div>
  );
};

const meta = {
  title: 'Components/BottomSheet',
  component: BottomSheet,
  args: { isOpen: true, onClose: fn(), children: <SheetContent />, accessibilityLabel: 'Habit detail', presentation: 'inline' },
  parameters: { chromatic: { delay: 800 } },
  decorators: [(Story, ctx) => (ctx.parameters.bare ? <Story /> : <div style={{ maxWidth: 420 }}><Frame><Story /></Frame></div>)],
} satisfies Meta<typeof BottomSheet>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Open: Story = {};

const Toggle = () => {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  return (
    <Frame>
      <div style={{ position: 'absolute', bottom: 16, left: 16, right: 16 }}>
        <button onClick={() => setOpen(true)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${theme.color.border.default}`, background: theme.color.accent.default, color: theme.color.text.onAccent, fontWeight: 600, cursor: 'pointer' }}>Open sheet</button>
      </div>
      <BottomSheet isOpen={open} onClose={() => setOpen(false)} accessibilityLabel="Habit detail" presentation="inline"><SheetContent /></BottomSheet>
    </Frame>
  );
};
/** Opens and closes with the 300ms timing animation. Drag the handle down 100px (or flick) to dismiss; shorter drags spring back. */
export const Interactive: Story = {
  parameters: { bare: true },
  render: () => <div style={{ maxWidth: 420 }}><Toggle /></div>,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByRole('dialog')).toBeNull();
    await userEvent.click(await canvas.findByRole('button', { name: 'Open sheet' }));
    const dialog = await canvas.findByRole('dialog');
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await userEvent.click(await canvas.findByTestId('bottom-sheet-backdrop'));
    await waitFor(() => expect(canvas.queryByRole('dialog')).toBeNull(), { timeout: 2000 });
  },
};

export const AllBrands: Story = {
  parameters: { layout: 'padded', bare: true, chromatic: { delay: 1000 } },
  render: () => <BrandMatrix minWidth={380}><Frame height={420}><BottomSheet isOpen onClose={() => undefined} accessibilityLabel="Habit detail" presentation="inline"><SheetContent /></BottomSheet></Frame></BrandMatrix>,
};

export const Spec: Story = { render: () => <SpecView id="bottom-sheet" />, parameters: { layout: 'padded', bare: true } };
