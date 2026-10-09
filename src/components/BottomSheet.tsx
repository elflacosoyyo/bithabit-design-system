import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { Animated, Easing, Modal, PanResponder, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native';
import type { LayoutChangeEvent } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  /** Contract addition: names the sheet for screen readers. */
  accessibilityLabel?: string;
  /**
   * Reference-only. 'modal' (default) mirrors production (transparent Modal over the whole screen).
   * 'inline' fills the nearest positioned parent so Storybook can show several sheets on one page.
   */
  presentation?: 'modal' | 'inline';
}

/** Contract: components/bottom-sheet/bottom-sheet.spec.yaml */
export const BottomSheet = ({ isOpen, onClose, children, accessibilityLabel, presentation = 'modal' }: BottomSheetProps) => {
  const { theme } = useTheme();
  const b = theme.bottomSheet;
  const { height: windowHeight } = useWindowDimensions();
  const [areaHeight, setAreaHeight] = useState(windowHeight);
  const [mounted, setMounted] = useState(isOpen);
  const translateY = useRef(new Animated.Value(windowHeight)).current;
  const backdrop = useRef(new Animated.Value(0)).current;
  const height = presentation === 'inline' ? areaHeight : windowHeight;

  const animate = useCallback((open: boolean) => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: open ? 0 : height,
        duration: b.duration,
        easing: open ? Easing.out(Easing.ease) : Easing.in(Easing.ease),
        useNativeDriver: false,
      }),
      Animated.timing(backdrop, { toValue: open ? 1 : 0, duration: b.duration, useNativeDriver: false }),
    ]).start(({ finished }: { finished: boolean }) => {
      if (finished && !open) setMounted(false);
    });
  }, [b.duration, backdrop, height, translateY]);

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      translateY.setValue(height);
      requestAnimationFrame(() => animate(true));
    } else if (mounted) {
      animate(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const pan = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_: unknown, g: { dy: number }) => g.dy > 4,
        onPanResponderMove: (_: unknown, g: { dy: number }) => {
          if (g.dy > 0) translateY.setValue(g.dy);
        },
        onPanResponderRelease: (_: unknown, g: { dy: number; vy: number }) => {
          if (g.dy > b.dragThreshold || g.vy * 1000 > b.velocityThreshold) onClose();
          else Animated.spring(translateY, { toValue: 0, damping: b.springDamping, stiffness: b.springStiffness, mass: 1, useNativeDriver: false }).start();
        },
      }),
    [b.dragThreshold, b.springDamping, b.springStiffness, b.velocityThreshold, onClose, translateY],
  );

  if (!mounted) return null;

  const body = (
    <View
      style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end' }}
      onLayout={(e: LayoutChangeEvent) => presentation === 'inline' && setAreaHeight(e.nativeEvent.layout.height)}
    >
      <Pressable aria-label="Close" role="button" style={StyleSheet.absoluteFill} onPress={onClose} testID="bottom-sheet-backdrop">
        <Animated.View style={{ flex: 1, backgroundColor: b.backdrop, opacity: backdrop }} />
      </Pressable>
      <Animated.View
        role="dialog"
        aria-modal
        aria-label={accessibilityLabel}
        style={{
          backgroundColor: b.bg,
          borderTopLeftRadius: b.radiusTop,
          borderTopRightRadius: b.radiusTop,
          transform: [{ translateY }],
        }}
      >
        <View {...pan.panHandlers} style={{ alignItems: 'center', paddingVertical: b.handle.paddingY }}>
          <View style={{ width: b.handle.width, height: b.handle.height, borderRadius: b.handle.radius, backgroundColor: b.handle.bg }} aria-hidden />
        </View>
        {children}
      </Animated.View>
    </View>
  );

  if (presentation === 'inline') return body;
  return (
    <Modal transparent animationType="none" visible onRequestClose={onClose}>
      {body}
    </Modal>
  );
};
