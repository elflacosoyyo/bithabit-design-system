import { Pressable, Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';

export interface CalendarDayProps {
  /** Day of the month. */
  label: number;
  /** Contract addition: the spoken date and state ("Friday, October 9, completed"). */
  accessibilityLabel: string;
  isToday?: boolean;
  isDone?: boolean;
  /** Omit for days that cannot be changed (future days): the cell is then inert and exposed as disabled. */
  onPress?: () => void;
  testID?: string;
}

/** Contract: components/calendar-day/calendar-day.spec.yaml. Flexes to fill its column; a week is a row of seven. */
export const CalendarDay = ({ label, accessibilityLabel, isToday = false, isDone = false, onPress, testID }: CalendarDayProps) => {
  const { theme } = useTheme();
  const c = theme.calendarDay;
  const inert = !onPress;
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Pressable
        role="button"
        aria-label={accessibilityLabel}
        aria-pressed={isDone}
        aria-disabled={inert}
        aria-current={isToday ? 'date' : undefined}
        disabled={inert}
        onPress={onPress}
        testID={testID}
        style={({ pressed }: { pressed: boolean }) => ({ width: '100%', opacity: pressed && !inert ? c.pressedOpacity : 1 })}
      >
        <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: c.bg, borderTopLeftRadius: c.radiusTop, borderTopRightRadius: c.radiusTop, paddingHorizontal: c.paddingX, paddingVertical: c.paddingY }}>
          <View
            style={{
              width: c.circleSize,
              height: c.circleSize,
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: theme.radius.pill,
              borderWidth: c.circleBorderWidth,
              borderColor: isDone ? c.ringDone : 'transparent',
              backgroundColor: isToday ? c.todayBg : 'transparent',
            }}
          >
            <Text style={{ fontFamily: fontFamily(theme, 'sans'), fontSize: c.labelSize, fontWeight: c.labelWeight, color: isToday ? c.todayLabelColor : c.labelColor }}>{label}</Text>
          </View>
        </View>
        <View style={{ height: c.stripHeight, alignSelf: 'stretch', backgroundColor: isDone ? c.stripDone : c.stripEmpty }} aria-hidden />
      </Pressable>
    </View>
  );
};
