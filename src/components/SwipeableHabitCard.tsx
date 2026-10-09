import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, PanResponder, Text, View } from 'react-native';
import { fontFamily, useTheme } from '../theme/ThemeProvider';
import { HabitCard, type HabitCardProps } from './HabitCard';

export interface SwipeableHabitCardProps extends HabitCardProps {
  /** Swipe left past the threshold. The caller asks for confirmation (native alert) and deletes. */
  onDeleteRequest: () => void;
  /** Swipe-background labels, translated by the caller. */
  labels: { done: string; undo: string; delete: string };
}

/** Contract: the "swipeable" variant in components/habit-card/habit-card.spec.yaml. Drag-to-reorder is not part of the reference. */
export const SwipeableHabitCard = ({ onToggle, onDeleteRequest, labels, ...card }: SwipeableHabitCardProps) => {
  const { theme } = useTheme();
  const s = theme.habitCard.swipe;
  const x = useRef(new Animated.Value(0)).current;
  const [dir, setDir] = useState<0 | 1 | -1>(0);
  // react-native-web fires a click after any drag that ends on the card; on native a captured pan cancels the press. Swallow it.
  const swiping = useRef(false);
  const frame = useRef<{ addEventListener?: (t: string, l: (e: Event) => void, c: boolean) => void; removeEventListener?: (t: string, l: (e: Event) => void, c: boolean) => void } | null>(null);
  const handlers = useRef({ onToggle, onDeleteRequest });
  handlers.current = { onToggle, onDeleteRequest };

  useEffect(() => {
    const el = frame.current; // a DOM node on the web, a native view elsewhere (no addEventListener there)
    if (typeof el?.addEventListener !== 'function') return undefined;
    const swallow = (e: Event) => { if (swiping.current) { e.stopPropagation(); e.preventDefault(); } };
    el.addEventListener('click', swallow, true);
    return () => el.removeEventListener?.('click', swallow, true);
  }, []);

  const pan = useMemo(() => {
    const settle = (reveal: number, fire: () => void) => {
      Animated.timing(x, { toValue: reveal, duration: s.snapDuration, useNativeDriver: false }).start(() => {
        fire();
        Animated.timing(x, { toValue: 0, duration: s.returnDuration, useNativeDriver: false }).start(() => setDir(0));
      });
    };
    return PanResponder.create({
      // Capture so a horizontal drag wins over the card's own Pressables. Vertical movement (list scroll) is left alone.
      onMoveShouldSetPanResponderCapture: (_: unknown, g: { dx: number; dy: number }) => {
        const horizontal = Math.abs(g.dx) > 10 && Math.abs(g.dy) < 5;
        if (horizontal) swiping.current = true;
        return horizontal;
      },
      onPanResponderMove: (_: unknown, g: { dx: number }) => {
        const clamped = Math.max(-s.revealWidth, Math.min(s.revealWidth, g.dx));
        x.setValue(clamped);
        setDir(clamped > 0 ? 1 : clamped < 0 ? -1 : 0);
      },
      onPanResponderRelease: (_: unknown, g: { dx: number; vx: number }) => {
        setTimeout(() => { swiping.current = false; }, 50);
        const right = g.dx > s.threshold || g.vx * 1000 > s.velocityThreshold;
        const left = g.dx < -s.threshold || g.vx * 1000 < -s.velocityThreshold;
        if (right) settle(s.revealWidth, () => handlers.current.onToggle());
        else if (left) settle(-s.revealWidth, () => handlers.current.onDeleteRequest());
        else Animated.timing(x, { toValue: 0, duration: s.returnDuration, useNativeDriver: false }).start(() => setDir(0));
      },
      onPanResponderTerminate: () => { swiping.current = false; Animated.timing(x, { toValue: 0, duration: s.returnDuration, useNativeDriver: false }).start(() => setDir(0)); },
    });
  }, [s.revealWidth, s.returnDuration, s.snapDuration, s.threshold, s.velocityThreshold, x]);

  const label = { fontFamily: fontFamily(theme, 'sans'), fontSize: s.labelSize, fontWeight: s.labelWeight, color: s.label };
  return (
    <View
      ref={frame}
      style={{ overflow: 'hidden' }}
      accessibilityActions={[{ name: 'toggle', label: card.completed ? labels.undo : labels.done }, { name: 'delete', label: labels.delete }]}
      onAccessibilityAction={(e: { nativeEvent: { actionName: string } }) => (e.nativeEvent.actionName === 'delete' ? onDeleteRequest() : onToggle())}
      testID={`${card.testID ?? 'swipeable'}-wrapper`}
    >
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: s.toggleBg, justifyContent: 'center', paddingLeft: theme.spacing.lg, opacity: dir === 1 ? 1 : 0 }} aria-hidden>
        <Text style={label}>{card.completed ? labels.undo : labels.done}</Text>
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: s.deleteBg, justifyContent: 'center', alignItems: 'flex-end', paddingRight: theme.spacing.lg, opacity: dir === -1 ? 1 : 0 }} aria-hidden>
        <Text style={label}>{labels.delete}</Text>
      </View>
      <Animated.View {...pan.panHandlers} style={{ transform: [{ translateX: x }] }}>
        <HabitCard {...card} onToggle={onToggle} />
      </Animated.View>
    </View>
  );
};
