import { Pressable, Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';

export interface SegmentedControlProps {
  labels: string[];
  selectedIndex: number;
  onSelect: (index: number) => void;
  /** Contract addition: names the group for screen readers. */
  accessibilityLabel?: string;
}

/** Contract: components/segmented-control/segmented-control.spec.yaml */
export const SegmentedControl = ({ labels, selectedIndex, onSelect, accessibilityLabel }: SegmentedControlProps) => {
  const { theme } = useTheme();
  const s = theme.segmentedControl;
  return (
    <View
      role="tablist"
      aria-label={accessibilityLabel}
      style={{
        height: s.height,
        flexDirection: 'row',
        backgroundColor: s.trackBg,
        borderRadius: s.trackRadius,
        padding: s.trackPadding,
      }}
    >
      {labels.map((label, index) => {
        const active = index === selectedIndex;
        return (
          <Pressable
            key={label}
            role="tab"
            aria-selected={active}
            aria-label={label}
            onPress={() => onSelect(index)}
            style={({ pressed }: { pressed: boolean }) => ({ flex: 1, opacity: pressed ? theme.opacity.pressed : 1 })}
          >
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: s.thumbRadius,
                backgroundColor: active ? s.thumbBg : 'transparent',
              }}
            >
              <Text
                style={{
                  fontFamily: fontFamily(theme, 'sans'),
                  fontSize: s.fontSize,
                  color: s.label,
                  fontWeight: active ? s.fontWeightActive : s.fontWeightInactive,
                }}
              >
                {label}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
};
