import { Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';

export interface EmptyStateProps {
  /** One direct sentence. Never apologetic. */
  message: string;
  /** 'inline' sits at the top of a list (Home). 'centered' fills the area with a serif message (Norms). */
  variant?: 'inline' | 'centered';
}

/** Contract: components/empty-state/empty-state.spec.yaml */
export const EmptyState = ({ message, variant = 'inline' }: EmptyStateProps) => {
  const { theme } = useTheme();
  const e = theme.emptyState;
  const centered = variant === 'centered';
  return (
    <View style={centered
      ? { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: e.centered.paddingX, paddingVertical: e.centered.paddingY }
      : { alignItems: 'center', paddingHorizontal: e.paddingX, paddingTop: e.paddingTop }}
    >
      <Text role="status" style={{ fontFamily: fontFamily(theme, centered ? 'display' : 'sans'), fontSize: centered ? e.centered.fontSize : e.fontSize, color: e.textColor, textAlign: 'center' }}>{message}</Text>
    </View>
  );
};
