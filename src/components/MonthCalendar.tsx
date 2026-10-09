import { Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';
import { CalendarDay } from './CalendarDay';

export interface MonthCalendarProps {
  year: number;
  /** 0 to 11, as in JavaScript dates. */
  month: number;
  /** Localized month and year ("Octubre 2026"). The caller formats it. */
  title: string;
  /** Seven letters, Sunday first, in the app's language. */
  dayLetters: string[];
  /** Completed dates as YYYY-MM-DD. */
  completedDates: ReadonlySet<string>;
  /** Today as YYYY-MM-DD. Days after it cannot be changed. */
  today: string;
  onToggleDate: (date: string) => void;
  /** Contract addition: the spoken date and state of one day. */
  dayAccessibilityLabel: (date: string, state: { done: boolean; today: boolean }) => string;
  testID?: string;
}

type Week = Array<number | null>;

/** Weeks of a month, Sunday first, padded with nulls. UTC so the result does not depend on the machine's time zone. */
export const weeksOf = (year: number, month: number): Week[] => {
  const days = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  const first = new Date(Date.UTC(year, month, 1)).getUTCDay();
  const weeks: Week[] = [];
  let week: Week = new Array(7).fill(null);
  for (let d = 1; d <= days; d++) {
    const weekday = (first + d - 1) % 7;
    week[weekday] = d;
    if (weekday === 6 || d === days) { weeks.push(week); week = new Array(7).fill(null); }
  }
  return weeks;
};

export const toDateString = (year: number, month: number, day: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

/** Contract: components/month-calendar/month-calendar.spec.yaml */
export const MonthCalendar = ({ year, month, title, dayLetters, completedDates, today, onToggleDate, dayAccessibilityLabel, testID }: MonthCalendarProps) => {
  const { theme } = useTheme();
  const m = theme.monthCalendar;
  return (
    <View role="group" aria-label={title} testID={testID} style={{ gap: m.rowGap }}>
      <Text role="heading" aria-level={3} style={{ fontFamily: fontFamily(theme, 'display'), fontSize: m.titleSize, fontWeight: m.titleWeight, color: m.titleColor }}>{title}</Text>
      <View style={{ flexDirection: 'row', gap: m.columnGap }} aria-hidden>
        {dayLetters.map((letter, i) => (
          <View key={i} style={{ flex: 1, alignItems: 'center' }}>
            <Text style={{ fontFamily: fontFamily(theme, 'sans'), fontSize: m.letterSize, fontWeight: m.letterWeight, color: m.letterColor }}>{letter}</Text>
          </View>
        ))}
      </View>
      {weeksOf(year, month).map((week, w) => (
        <View key={w} style={{ flexDirection: 'row', gap: m.columnGap }}>
          {week.map((day, i) => {
            if (day === null) return <View key={i} style={{ flex: 1 }} />;
            const date = toDateString(year, month, day);
            const done = completedDates.has(date);
            const isToday = date === today;
            return (
              <CalendarDay
                key={i}
                label={day}
                isDone={done}
                isToday={isToday}
                accessibilityLabel={dayAccessibilityLabel(date, { done, today: isToday })}
                onPress={date > today ? undefined : () => onToggleDate(date)}
                testID={`day-${date}`}
              />
            );
          })}
        </View>
      ))}
    </View>
  );
};
