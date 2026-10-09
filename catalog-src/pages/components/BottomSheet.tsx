import { useState } from 'react';
import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { BottomSheet, HabitCard, SegmentedControl } from '../../../src';
import { fontFamily, textStyle, useTheme } from '../../../src/theme/ThemeProvider';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

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

/** A fake screen behind the sheet, so the backdrop and the radius can be judged in context. */
const Frame = ({ children, height = 440 }: { children: ReactNode; height?: number }) => {
  const { theme } = useTheme();
  const sample = useSample();
  return (
    <div style={{ position: 'relative', height, overflow: 'hidden', borderRadius: 12, background: theme.color.bg.canvas, border: `1px solid ${theme.color.border.default}` }}>
      <div style={{ padding: '12px 0' }}>
        {sample.habits.slice(0, 3).map((t, i) => <HabitCard key={t} title={t} completed={i === 0} history={sample.history[i]} onToggle={noop} onPress={noop} />)}
      </div>
      {children}
    </div>
  );
};

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

export const Examples = () => (
  <>
    <Example title="Open" note="Content-sized, 32pt top radius, no shadow: depth comes from the dim backdrop."><Frame><BottomSheet isOpen onClose={noop} accessibilityLabel="Habit detail" presentation="inline"><SheetContent /></BottomSheet></Frame></Example>
    <Example title="Interactive" note="Opens and closes in 300ms. Drag the handle down 100px (or flick) to dismiss; a shorter drag springs back. Tapping the backdrop closes it."><Toggle /></Example>
  </>
);

export const AllBrands = () => (
  <BrandMatrix minWidth={380}>
    <Frame height={420}><BottomSheet isOpen onClose={noop} accessibilityLabel="Habit detail" presentation="inline"><SheetContent /></BottomSheet></Frame>
  </BrandMatrix>
);
