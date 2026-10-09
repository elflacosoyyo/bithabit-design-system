import { useState } from 'react';
import { IconButton } from '../../../src';
import { MenuGlyph, PlusGlyph } from '../../../src/components/Glyphs';
import { useTheme } from '../../../src/theme/ThemeProvider';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

const useIcons = () => {
  const { theme } = useTheme();
  const b = theme.iconButton;
  return { menu: <MenuGlyph size={b.iconSize} color={b.color} />, plus: <PlusGlyph size={b.iconSize} color={b.color} /> };
};

const Row = () => {
  const ui = useSample().ui;
  const icons = useIcons();
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <IconButton icon={icons.menu} accessibilityLabel={ui.openMenu} onPress={noop} />
      <IconButton icon={icons.plus} accessibilityLabel={ui.newHabit} onPress={noop} />
    </div>
  );
};

const Counter = () => {
  const ui = useSample().ui;
  const icons = useIcons();
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  return (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <IconButton icon={icons.plus} accessibilityLabel={ui.newHabit} loading={loading} onPress={() => { setCount((c) => c + 1); setLoading(true); setTimeout(() => setLoading(false), 800); }} />
      <span data-testid="icon-button-count" style={{ fontSize: 14 }}>Pressed {count} times</span>
    </div>
  );
};

export const Examples = () => {
  const icons = useIcons();
  const ui = useSample().ui;
  return (
    <>
      <Example title="Default" note="No container: the 24pt glyph sits on the screen and the target is a 40pt box plus a 4pt slop (48pt)."><Row /></Example>
      <Example title="Disabled"><IconButton icon={icons.plus} accessibilityLabel={ui.newHabit} disabled onPress={noop} /></Example>
      <Example title="Loading" note="The spinner replaces the glyph and presses are blocked."><IconButton icon={icons.plus} accessibilityLabel={ui.newHabit} loading onPress={noop} /></Example>
      <Example title="Interactive" note="Press the icon: it counts once and shows the spinner for 800ms, during which presses are ignored."><Counter /></Example>
    </>
  );
};

export const AllBrands = () => <BrandMatrix minWidth={260}><Row /></BrandMatrix>;
