import { IconButton, NavHeader } from '../../../src';
import { MenuGlyph, PlusGlyph } from '../../../src/components/Glyphs';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

const Bars = () => {
  const { theme } = useTheme();
  const ui = useSample().ui;
  const b = theme.iconButton;
  const menu = <IconButton icon={<MenuGlyph size={b.iconSize} color={b.color} />} accessibilityLabel={ui.openMenu} onPress={noop} />;
  const plus = <IconButton icon={<PlusGlyph size={b.iconSize} color={b.color} />} accessibilityLabel={ui.newHabit} onPress={noop} />;
  const edge = { border: `1px dashed ${theme.color.border.default}` };
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <div style={edge}><NavHeader left={menu} right={plus} /></div>
      <div style={edge}><NavHeader left={menu} /></div>
      <div style={edge}><NavHeader left={menu} title={ui.appName} right={plus} /></div>
    </div>
  );
};

export const Examples = () => (
  <Example title="Slots" note="Top: menu and add, as on Home. Middle: menu only. Bottom: with the optional centered title (the app leaves it empty and uses a HeaderBar)." width={375}><Bars /></Example>
);

export const AllBrands = () => <BrandMatrix minWidth={380}><Bars /></BrandMatrix>;
