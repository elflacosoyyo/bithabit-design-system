import { Text, View } from 'react-native';
import { textStyle, useTheme } from '../theme/ThemeProvider';

export interface HeaderBarProps {
  title: string;
  /** Small line aligned to the trailing edge, normally today's date. */
  subtitle?: string;
}

/** Contract: components/header-bar/header-bar.spec.yaml */
export const HeaderBar = ({ title, subtitle }: HeaderBarProps) => {
  const { theme } = useTheme();
  const h = theme.headerBar;
  return (
    <View style={{ minHeight: h.minHeight, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-end', justifyContent: 'space-between', backgroundColor: h.bg, paddingHorizontal: h.paddingX }}>
      <Text role="heading" aria-level={1} style={{ ...textStyle(theme, 'screenTitle'), color: h.titleColor }}>{title}</Text>
      {subtitle ? <Text style={{ ...textStyle(theme, 'caption'), color: h.subtitleColor }}>{subtitle}</Text> : null}
    </View>
  );
};
