import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';

export type ButtonVariant = 'primary' | 'outline' | 'destructive' | 'text' | 'text-destructive' | 'text-link';

export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  /** Leading 18pt icon. Not available on the text variants. */
  icon?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  /** Destructive only: 'faded' dims the fill, 'neutral' switches to the neutral disabled fill. */
  disabledVariant?: 'faded' | 'neutral';
  testID?: string;
}

/** Contract: components/button/button.spec.yaml */
export const Button = ({ label, onPress, variant = 'primary', icon, disabled = false, loading = false, disabledVariant = 'faded', testID }: ButtonProps) => {
  const { theme } = useTheme();
  const b = theme.button;
  const blocked = disabled || loading;
  const isText = variant.startsWith('text');
  const neutral = variant === 'destructive' && disabled && disabledVariant === 'neutral';

  const labelColor = {
    primary: b.primary.label,
    outline: b.outline.label,
    destructive: neutral ? b.destructive.disabledNeutralLabel : b.destructive.label,
    text: b.text.label,
    'text-destructive': disabled ? b.text.destructiveDisabledLabel : b.text.destructiveLabel,
    'text-link': b.text.linkLabel,
  }[variant];

  // Disabled treatment per variant (see the contract): neutral destructive and text-destructive keep full opacity.
  const dimmed = loading || (disabled && !neutral && variant !== 'text-destructive');

  const container = {
    height: b.height,
    flexDirection: 'row' as const,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    gap: b.gap,
    paddingHorizontal: b.paddingX,
    borderRadius: b.radius,
    ...(variant === 'primary' ? { backgroundColor: b.primary.bg } : {}),
    ...(variant === 'outline' ? { borderWidth: b.outline.borderWidth, borderColor: b.outline.border } : {}),
    ...(variant === 'destructive' ? { backgroundColor: neutral ? b.destructive.disabledNeutralBg : b.destructive.bg } : {}),
  };

  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={blocked}
      aria-busy={loading}
      disabled={blocked}
      onPress={onPress}
      testID={testID}
      style={({ pressed }: { pressed: boolean }) => ({
        opacity: dimmed ? b.disabledOpacity : pressed ? b.pressedOpacity : 1,
        // Full width for the variants with a container (on the web a <button> does not stretch by itself); text buttons size to their label.
        ...(isText ? {} : { width: '100%' }),
      })}
    >
      <View style={container}>
        {loading ? (
          <ActivityIndicator color={labelColor} />
        ) : (
          <>
            {icon && !isText ? <View style={{ width: b.iconSize, height: b.iconSize, alignItems: 'center', justifyContent: 'center' }}>{icon}</View> : null}
            <Text
              style={{
                fontFamily: fontFamily(theme, 'sans'),
                fontSize: b.fontSize,
                fontWeight: b.fontWeight,
                color: labelColor,
                ...(variant === 'text-destructive' || variant === 'text-link' ? { textDecorationLine: 'underline' } : {}),
              }}
            >
              {label}
            </Text>
          </>
        )}
      </View>
    </Pressable>
  );
};
