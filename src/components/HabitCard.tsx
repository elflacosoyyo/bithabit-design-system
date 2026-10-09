import { Pressable, Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';
import { Checkbox } from './Checkbox';

export interface HabitCardProps {
  title: string;
  completed: boolean;
  /** Completion of the last N days, oldest first, today last. The Home screen passes 7. */
  history: boolean[];
  onToggle: () => void;
  onPress: () => void;
  disabled?: boolean;
  testID?: string;
}

/** Contract: components/habit-card/habit-card.spec.yaml. Swipe and drag-to-reorder are not part of the reference. */
export const HabitCard = ({ title, completed, history, onToggle, onPress, disabled = false, testID }: HabitCardProps) => {
  const { theme } = useTheme();
  const h = theme.habitCard;
  const done = history.filter(Boolean).length;
  return (
    <View style={{ backgroundColor: h.wrapperBg, paddingHorizontal: h.listPaddingX, paddingVertical: h.listPaddingY }}>
      <View style={{ borderTopLeftRadius: h.radiusTop, borderTopRightRadius: h.radiusTop, overflow: 'hidden', backgroundColor: h.wrapperBg }}>
        <Pressable
          role="button"
          aria-label={`${title}, ${completed ? 'completed today' : 'not completed today'}`}
          aria-valuetext={`${done} of ${history.length} days`}
          disabled={disabled}
          onPress={onPress}
          testID={testID}
          style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? h.pressedOpacity : 1 })}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: h.bg,
              paddingHorizontal: h.paddingX,
              paddingVertical: h.paddingY,
            }}
          >
            <Text
              style={{
                ...textStyle(theme, 'cardTitle'),
                flex: 1,
                marginRight: theme.spacing.md,
                color: h.text,
                fontSize: h.fontSize,
                fontWeight: h.fontWeight,
                letterSpacing: h.letterSpacing,
              }}
            >
              {title}
            </Text>
            <Checkbox checked={completed} onChange={() => onToggle()} disabled={disabled} accessibilityLabel={title} />
          </View>
          <View style={{ flexDirection: 'row', height: h.strip.height, gap: h.strip.gap }} aria-hidden>
            {history.map((isDone, i) => (
              <View key={i} style={{ flex: 1, backgroundColor: isDone ? h.strip.segmentFilled : h.strip.segmentEmpty }} />
            ))}
          </View>
        </Pressable>
      </View>
    </View>
  );
};
