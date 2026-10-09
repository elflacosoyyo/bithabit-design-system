import { Text, View } from 'react-native';

/** Check mark drawn with two borders so it renders identically on React Native and react-native-web (no SVG dependency). */
export const CheckGlyph = ({ size, color, strokeWidth = 2 }: { size: number; color: string; strokeWidth?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} aria-hidden>
    <View
      style={{
        width: size * 0.3,
        height: size * 0.55,
        borderColor: color,
        borderBottomWidth: strokeWidth,
        borderRightWidth: strokeWidth,
        transform: [{ rotate: '45deg' }, { translateY: -size * 0.06 }],
      }}
    />
  </View>
);

/** Diagonal arrow used by change indicators. Unicode glyphs keep the reference dependency-free; production uses Feather icons. */
export const ArrowGlyph = ({ direction, size, color }: { direction: 'up-right' | 'down-right'; size: number; color: string }) => (
  <Text style={{ fontSize: size, lineHeight: size + 2, color }} aria-hidden>
    {direction === 'up-right' ? '↗' : '↘'}
  </Text>
);
