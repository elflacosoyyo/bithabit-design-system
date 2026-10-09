import type { ReactNode } from 'react';
import { Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';

export interface MetricCardProps {
  icon: ReactNode;
  title: string;
  value: string | number;
  valueTone: 'accent' | 'foreground' | 'muted';
  subtitle: string;
  footer?: ReactNode;
  /** Required by the contract so the footer is read together with the figure. */
  accessibilityLabel: string;
}

/** Contract: components/metric-card/metric-card.spec.yaml */
export const MetricCard = ({ icon, title, value, valueTone, subtitle, footer, accessibilityLabel }: MetricCardProps) => {
  const { theme } = useTheme();
  const m = theme.metricCard;
  const valueColor = { accent: m.valueAccent, foreground: m.valueForeground, muted: m.valueMuted }[valueTone];
  const sans = fontFamily(theme, 'sans');
  return (
    <View
      accessible
      aria-label={accessibilityLabel}
      style={{ width: m.width, flexShrink: 0, backgroundColor: m.bg, borderRadius: m.radius, padding: m.padding }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: m.headerGap, marginBottom: m.headerMarginBottom }}>
        {icon}
        <Text style={{ flex: 1, fontFamily: sans, fontSize: m.titleSize, fontWeight: m.titleWeight, color: m.title }}>{title}</Text>
      </View>
      <Text
        style={{
          fontFamily: sans,
          fontSize: m.valueSize,
          fontWeight: m.valueWeight,
          letterSpacing: m.valueTracking,
          lineHeight: m.valueSize,
          color: valueColor,
        }}
      >
        {value}
      </Text>
      <Text numberOfLines={1} style={{ marginTop: m.subtitleMarginTop, fontFamily: sans, fontSize: m.subtitleSize, color: m.subtitle }}>
        {subtitle}
      </Text>
      {footer ? <View style={{ marginTop: m.footerMarginTop }}>{footer}</View> : null}
    </View>
  );
};
