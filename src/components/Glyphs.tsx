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

/** Trash can drawn with borders (no SVG dependency). Stand-in for the Feather "trash-2" icon used by destructive buttons. */
export const TrashGlyph = ({ size, color, strokeWidth = 1.5 }: { size: number; color: string; strokeWidth?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'flex-end' }} aria-hidden>
    <View style={{ position: 'absolute', top: size * 0.12, width: size * 0.86, height: strokeWidth, backgroundColor: color }} />
    <View style={{ position: 'absolute', top: size * 0.02, width: size * 0.3, height: size * 0.12, borderColor: color, borderTopWidth: strokeWidth, borderLeftWidth: strokeWidth, borderRightWidth: strokeWidth }} />
    <View style={{ width: size * 0.66, height: size * 0.76, borderColor: color, borderWidth: strokeWidth, borderBottomLeftRadius: size * 0.1, borderBottomRightRadius: size * 0.1 }} />
  </View>
);

/** Plus sign drawn with two bars. */
export const PlusGlyph = ({ size, color, strokeWidth = 1.75 }: { size: number; color: string; strokeWidth?: number }) => (
  <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }} aria-hidden>
    <View style={{ position: 'absolute', width: size * 0.8, height: strokeWidth, backgroundColor: color }} />
    <View style={{ position: 'absolute', width: strokeWidth, height: size * 0.8, backgroundColor: color }} />
  </View>
);
