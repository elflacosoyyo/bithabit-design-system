import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { fontFamily, textStyle, useTheme } from '../theme/ThemeProvider';

export interface DrawerMenuItem {
  id: string;
  label: string;
}

export interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  items: DrawerMenuItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  contactLabel: string;
  onContact: () => void;
  /** Pinned to the bottom of the panel. */
  accountLabel: string;
  onAccount: () => void;
  /** True when the account screen is the current one (its label turns accent). */
  accountActive?: boolean;
  /** Reference-only: system insets the panel keeps clear (the app uses `p-safe`). */
  safeArea?: { top: number; bottom: number };
  testID?: string;
}

/**
 * Contract: components/drawer-menu/drawer-menu.spec.yaml.
 * The reference draws its own overlay and panel inside the nearest positioned parent (like BottomSheet 'inline'); in the app the
 * drawer container is react-navigation and only the content below is custom.
 */
export const DrawerMenu = ({ isOpen, onClose, title, items, activeId, onSelect, contactLabel, onContact, accountLabel, onAccount, accountActive = false, safeArea = { top: 0, bottom: 0 }, testID }: DrawerMenuProps) => {
  const { theme } = useTheme();
  const d = theme.drawerMenu;
  const [mounted, setMounted] = useState(isOpen);
  const panelX = useRef(new Animated.Value(-d.width)).current;
  const overlay = useRef(new Animated.Value(0)).current;
  const contentX = useRef(new Animated.Value(-d.slideOffset)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      panelX.setValue(-d.width);
      contentX.setValue(-d.slideOffset);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(panelX, { toValue: 0, duration: d.duration, easing: Easing.out(Easing.ease), useNativeDriver: false }),
          Animated.timing(overlay, { toValue: 1, duration: d.duration, useNativeDriver: false }),
          Animated.spring(contentX, { toValue: 0, damping: d.springDamping, stiffness: d.springStiffness, mass: 1, useNativeDriver: false }),
          Animated.timing(contentOpacity, { toValue: 1, duration: d.duration, useNativeDriver: false }),
        ]).start();
      });
    } else if (mounted) {
      Animated.parallel([
        Animated.timing(panelX, { toValue: -d.width, duration: d.duration, easing: Easing.in(Easing.ease), useNativeDriver: false }),
        Animated.timing(overlay, { toValue: 0, duration: d.duration, useNativeDriver: false }),
        Animated.timing(contentOpacity, { toValue: 0, duration: d.duration, useNativeDriver: false }),
      ]).start(({ finished }: { finished: boolean }) => { if (finished) setMounted(false); });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  if (!mounted) return null;

  const renderItem = ({ label, active, onPress, id }: { label: string; active: boolean; onPress: () => void; id: string }) => (
    <Pressable
      key={id}
      role="button"
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      onPress={onPress}
      testID={`${testID ?? 'drawer'}-${id}`}
      style={({ pressed }: { pressed: boolean }) => ({ opacity: pressed ? d.itemPressedOpacity : 1, backgroundColor: active ? d.itemActiveBg : 'transparent' })}
    >
      <View style={{ paddingHorizontal: d.itemPaddingX, paddingVertical: d.itemPaddingY }}>
        <Text style={{ fontFamily: fontFamily(theme, 'sans'), fontSize: d.itemFontSize, fontWeight: d.itemFontWeight, color: active ? d.itemActiveColor : d.itemColor }}>{label}</Text>
      </View>
    </Pressable>
  );

  return (
    <View style={{ ...StyleSheet.absoluteFillObject, flexDirection: 'row' }} testID={testID}>
      <Animated.View style={{ width: d.width, maxWidth: '85%', backgroundColor: d.bg, transform: [{ translateX: panelX }], overflow: 'hidden' }} role="navigation" aria-label={title}>
        <Animated.View style={{ flex: 1, paddingTop: safeArea.top, paddingBottom: safeArea.bottom, opacity: contentOpacity, transform: [{ translateX: contentX }] }}>
          <View style={{ flex: 1 }}>
            <Text testID={`${testID ?? 'drawer'}-title`} role="heading" aria-level={1} style={{ ...textStyle(theme, 'display'), fontSize: d.titleSize, lineHeight: d.titleSize * 1.2, fontWeight: '400', color: d.titleColor, paddingHorizontal: d.titlePaddingX, paddingBottom: d.titlePaddingBottom }}>{title}</Text>
            <View testID={`${testID ?? 'drawer'}-items`}>{items.map((it) => renderItem({ id: it.id, label: it.label, active: it.id === activeId, onPress: () => onSelect(it.id) }))}</View>
            {renderItem({ id: 'contact', label: contactLabel, active: false, onPress: onContact })}
          </View>
          {renderItem({ id: 'account', label: accountLabel, active: accountActive, onPress: onAccount })}
        </Animated.View>
      </Animated.View>
      <Pressable aria-label="Close menu" role="button" style={{ flex: 1 }} onPress={onClose} testID={`${testID ?? 'drawer'}-overlay`}>
        <Animated.View style={{ flex: 1, backgroundColor: d.overlay, opacity: overlay }} />
      </Pressable>
    </View>
  );
};
