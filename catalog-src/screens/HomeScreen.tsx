import { View } from 'react-native';
import { EmptyState, HeaderBar, IconButton, NavHeader, SwipeableHabitCard } from '../../src';
import { MenuGlyph, PlusGlyph } from '../../src/components/Glyphs';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSample } from '../helpers/sample';
import { StatusBar } from './PhoneFrame';
import type { HabitRow } from './store';

export interface HomeScreenProps {
  habits: HabitRow[];
  onOpenMenu: () => void;
  onAdd: () => void;
  onToggle: (habit: HabitRow) => void;
  onDeleteRequest: (habit: HabitRow) => void;
  onOpenHabit: (habit: HabitRow) => void;
}

/** Recreation of src/screens/home-screen.tsx from design-system components. Contract: screens/home/home.screen.yaml */
export const HomeScreen = ({ habits, onOpenMenu, onAdd, onToggle, onDeleteRequest, onOpenHabit }: HomeScreenProps) => {
  const { theme } = useTheme();
  const ui = useSample().ui;
  const b = theme.iconButton;
  return (
    <>
      <StatusBar />
      <NavHeader
        left={<IconButton testID="menu-button" icon={<MenuGlyph size={b.iconSize} color={b.color} />} accessibilityLabel={ui.openMenu} onPress={onOpenMenu} />}
        right={<IconButton testID="add-button" icon={<PlusGlyph size={b.iconSize} color={b.color} />} accessibilityLabel={ui.newHabit} onPress={onAdd} />}
      />
      <View testID="title"><HeaderBar title={ui.appName} subtitle={ui.dateLine} /></View>
      {/* A plain View that scrolls natively on the web: react-native-web's ScrollView holds on to the touch responder and breaks the second swipe. */}
      <View testID="list" style={{ flex: 1, overflowY: 'auto', paddingTop: theme.spacing.sm }}>
        {habits.map((h, k) => (
          <View key={h.index}>
            {k > 0 ? <View style={{ height: theme.spacing.md }} /> : null}
            <SwipeableHabitCard
              testID={k === 0 ? 'card-first' : `card-${h.index}`}
              title={h.title}
              completed={h.completed}
              history={h.history}
              labels={ui.swipe}
              onToggle={() => onToggle(h)}
              onDeleteRequest={() => onDeleteRequest(h)}
              onPress={() => onOpenHabit(h)}
            />
          </View>
        ))}
        {habits.length === 0 ? <View testID="empty"><EmptyState message={ui.emptyHome} /></View> : null}
        <View style={{ height: theme.spacing.md + 34 }} />
      </View>
    </>
  );
};
