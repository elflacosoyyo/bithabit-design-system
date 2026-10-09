import { View } from 'react-native';
import { HeaderBar, IconButton, NavHeader } from '../../src';
import { MenuGlyph } from '../../src/components/Glyphs';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSample } from '../helpers/sample';
import { StatusBar } from './PhoneFrame';

/** Stand-in for a section that has not been recreated yet. It shows what is missing, so a gap never looks like a finished screen. */
export const PendingScreen = ({ title, onOpenMenu }: { title: string; onOpenMenu: () => void }) => {
  const { theme } = useTheme();
  const ui = useSample().ui;
  const b = theme.iconButton;
  return (
    <>
      <StatusBar />
      <NavHeader left={<IconButton testID="menu-button-pending" icon={<MenuGlyph size={b.iconSize} color={b.color} />} accessibilityLabel={ui.openMenu} onPress={onOpenMenu} />} />
      <HeaderBar title={title} />
      <View testID="pending-screen" style={{ margin: theme.spacing.lg, padding: theme.spacing.lg, borderWidth: 1.5, borderStyle: 'dashed', borderColor: theme.color.border.strong, borderRadius: theme.radius.lg }}>
        <PendingText />
      </View>
    </>
  );
};

const PendingText = () => {
  const { theme } = useTheme();
  return (
    <div style={{ fontFamily: theme.font.family.sans, fontSize: 14, lineHeight: '20px', color: theme.color.text.secondary }}>
      <div style={{ fontWeight: 600, color: theme.color.text.primary, marginBottom: 4 }}>Not recreated yet</div>
      This section of the app has not been rebuilt in the catalog. It will appear here once its components have contracts.
    </div>
  );
};
