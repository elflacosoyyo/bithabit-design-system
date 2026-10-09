import { Pressable, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';
import { CheckGlyph } from './Glyphs';

export interface CheckboxProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  /** Names the thing being completed, e.g. the habit title. Required by the contract. */
  accessibilityLabel: string;
  testID?: string;
}

/** Contract: components/checkbox/checkbox.spec.yaml */
export const Checkbox = ({ checked, onChange, disabled = false, accessibilityLabel, testID }: CheckboxProps) => {
  const { theme } = useTheme();
  const c = theme.checkbox;
  return (
    <Pressable
      role="checkbox"
      aria-checked={checked}
      aria-disabled={disabled}
      aria-label={accessibilityLabel}
      disabled={disabled}
      hitSlop={c.hitSlop}
      onPress={() => onChange(!checked)}
      testID={testID}
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: disabled ? c.disabledOpacity : pressed ? theme.opacity.pressed : 1,
      })}
    >
      <View
        style={{
          width: c.size,
          height: c.size,
          alignItems: 'center',
          justifyContent: 'center',
          ...(checked ? {} : { borderRadius: c.size / 2, borderWidth: c.borderWidth, borderColor: c.ring }),
        }}
      >
        {checked ? <CheckGlyph size={c.checkSize} color={c.check} /> : null}
      </View>
    </Pressable>
  );
};
