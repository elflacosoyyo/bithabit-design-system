import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';

export interface NavHeaderProps {
  /** Leading action, normally an IconButton (menu or back). */
  left?: ReactNode;
  /** Trailing action, normally an IconButton. */
  right?: ReactNode;
  /** Optional centered title. The app's Home and Norms screens leave it empty and put the title in a HeaderBar below. */
  title?: string;
}

/** Contract: components/nav-header/nav-header.spec.yaml. Sits below the system status bar. */
export const NavHeader = ({ left, right, title }: NavHeaderProps) => {
  const { theme } = useTheme();
  const h = theme.navHeader;
  return (
    <View
      role="banner"
      style={{ height: h.height, flexDirection: 'row', alignItems: 'center', backgroundColor: h.bg, paddingHorizontal: h.paddingX }}
    >
      <View style={{ flex: 1, alignItems: 'flex-start' }}>{left}</View>
      {title ? <Text role="heading" aria-level={1} style={{ ...textStyle(theme, 'body'), fontWeight: '600', color: theme.color.text.primary }}>{title}</Text> : null}
      <View style={{ flex: 1, alignItems: 'flex-end' }}>{right}</View>
    </View>
  );
};
