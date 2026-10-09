// Catalog-only building blocks for patterns that are still in the inventory as "planned" (ChangeIndicator, SegmentBar).
import { Text, View } from 'react-native';
import { ArrowGlyph } from '../../src/components/Glyphs';
import { fontFamily, useTheme } from '../../src/theme/ThemeProvider';

export const ChangeIndicator = ({ change, suffix }: { change: number; suffix: string }) => {
  const { theme } = useTheme();
  const positive = change >= 0;
  const color = positive ? theme.color.status.positive : theme.color.status.destructive;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing['2xs'] }}>
      <ArrowGlyph direction={positive ? 'up-right' : 'down-right'} size={13} color={color} />
      <Text style={{ fontFamily: fontFamily(theme, 'sans'), fontSize: theme.font.size.xs, fontWeight: theme.font.weight.medium, color }}>
        {`${positive ? '+' : ''}${change}% ${suffix}`}
      </Text>
    </View>
  );
};

export const SegmentBar = ({ segments, height = 16 }: { segments: boolean[]; height?: number }) => {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: 3 }} aria-hidden>
      {segments.map((filled, i) => (
        <View key={i} style={{ flex: 1, height, borderRadius: 2, backgroundColor: filled ? theme.color.accent.default : theme.color.bg.surfaceAlt }} />
      ))}
    </View>
  );
};
