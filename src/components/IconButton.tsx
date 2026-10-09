import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface IconButtonProps {
  /** The glyph, drawn at `icon-button.icon-size` in `icon-button.color`. */
  icon: ReactNode;
  /** Required: an icon alone says nothing to a screen reader ("New norm", "Open menu"). */
  accessibilityLabel: string;
  onPress: () => void;
  disabled?: boolean;
  /** Swaps the icon for a spinner and blocks presses. */
  loading?: boolean;
  testID?: string;
}

/** Contract: components/icon-button/icon-button.spec.yaml */
export const IconButton = ({ icon, accessibilityLabel, onPress, disabled = false, loading = false, testID }: IconButtonProps) => {
  const { theme } = useTheme();
  const b = theme.iconButton;
  const blocked = disabled || loading;
  return (
    <Pressable
      role="button"
      aria-label={accessibilityLabel}
      aria-disabled={blocked}
      aria-busy={loading}
      disabled={blocked}
      onPress={onPress}
      hitSlop={b.hitSlop}
      testID={testID}
      style={({ pressed }: { pressed: boolean }) => ({ opacity: disabled ? b.disabledOpacity : pressed ? b.pressedOpacity : 1 })}
    >
      <View style={{ width: b.size, height: b.size, alignItems: 'center', justifyContent: 'center' }}>
        {loading ? <ActivityIndicator size="small" color={b.color} /> : <View style={{ width: b.iconSize, height: b.iconSize, alignItems: 'center', justifyContent: 'center' }}>{icon}</View>}
      </View>
    </Pressable>
  );
};
