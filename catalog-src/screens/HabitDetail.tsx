import { useState } from 'react';
import { Text, View } from 'react-native';
import { SegmentedControl } from '../../src';
import { fontFamily, textStyle, useTheme } from '../../src/theme/ThemeProvider';
import { useSample } from '../helpers/sample';

/**
 * Frame of the norm detail: title, tabs and the reading text. The real sheet also has a "mark as done today" footer, an edit icon,
 * a calendar and a notes editor; those have no contracts yet (see `pending` in screens/home/home.screen.yaml).
 */
export const HabitDetail = ({ title }: { title: string }) => {
  const { theme } = useTheme();
  const sample = useSample();
  const [tab, setTab] = useState(0);
  return (
    <View testID="sheet" style={{ paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
      <Text role="heading" aria-level={2} style={{ ...textStyle(theme, 'screenTitle'), color: theme.color.text.primary, marginBottom: theme.spacing.sm }}>{title}</Text>
      <SegmentedControl labels={sample.tabs3} selectedIndex={tab} onSelect={setTab} accessibilityLabel={sample.ui.detailLabel} />
      <View style={{ marginTop: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.color.bg.surface }}>
        <Text style={{ fontFamily: fontFamily(theme, 'display'), fontSize: theme.font.size.body, lineHeight: theme.font.lineHeight.body, color: theme.color.text.primary }}>{tab === 0 ? sample.notes : '—'}</Text>
      </View>
    </View>
  );
};
