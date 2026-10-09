import { useState } from 'react';
import { Text, View } from 'react-native';
import { MonthCalendar, SegmentedControl } from '../../src';
import { fontFamily, textStyle, useTheme } from '../../src/theme/ThemeProvider';
import { useCalendar } from '../helpers/calendar';
import { useSample } from '../helpers/sample';

/**
 * Frame of the norm detail: title, tabs and the reading text. The real sheet also has a "mark as done today" footer, an edit icon,
 * a calendar and a notes editor; those have no contracts yet (see `pending` in screens/home/home.screen.yaml).
 */
export const HabitDetail = ({ title, initialTab = 0 }: { title: string; initialTab?: number }) => {
  const { theme } = useTheme();
  const sample = useSample();
  const cal = useCalendar();
  const [tab, setTab] = useState(initialTab);
  const [done, setDone] = useState<Set<string>>(() => cal.seed());
  const toggle = (d: string) => setDone((s) => { const n = new Set(s); if (n.has(d)) n.delete(d); else n.add(d); return n; });
  return (
    <View testID="sheet" style={{ flex: 1, minHeight: 0, paddingHorizontal: theme.spacing.md, paddingBottom: theme.spacing.xl }}>
      <Text role="heading" aria-level={2} style={{ ...textStyle(theme, 'screenTitle'), color: theme.color.text.primary, marginBottom: theme.spacing.sm }}>{title}</Text>
      <SegmentedControl labels={sample.tabs3} selectedIndex={tab} onSelect={setTab} accessibilityLabel={sample.ui.detailLabel} />
      {/* The sheet is a fixed 70% of the screen, so whatever the tab holds scrolls inside this area. */}
      <View testID={tab === 2 ? 'history' : 'detail-body'} style={{ flex: 1, minHeight: 0, marginTop: theme.spacing.md, overflowY: 'auto' }}>
        {tab === 2 ? (
          <View style={{ gap: theme.monthCalendar.monthsGap }}>
            {[[2026, 9], [2026, 8]].map(([y, m]) => (
              <MonthCalendar key={m} year={y} month={m} title={cal.title(y, m)} dayLetters={cal.dayLetters} completedDates={done} today={cal.today} onToggleDate={toggle} dayAccessibilityLabel={cal.dayLabel} />
            ))}
          </View>
        ) : (
          <View style={{ padding: theme.spacing.md, borderRadius: theme.radius.lg, backgroundColor: theme.color.bg.surface }}>
            <Text style={{ fontFamily: fontFamily(theme, 'display'), fontSize: theme.font.size.body, lineHeight: theme.font.lineHeight.body, color: theme.color.text.primary }}>{tab === 0 ? sample.notes : '—'}</Text>
          </View>
        )}
      </View>
    </View>
  );
};
