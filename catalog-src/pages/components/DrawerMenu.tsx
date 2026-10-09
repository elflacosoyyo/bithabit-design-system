import { useState } from 'react';
import { DrawerMenu, HeaderBar } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { Stage } from '../../helpers/Stage';
import { useSample } from '../../helpers/sample';
import { useTheme } from '../../../src/theme/ThemeProvider';

const Menu = ({ isOpen, onClose = noop, activeId = 'home', onSelect = noop, accountActive = false }: { isOpen: boolean; onClose?: () => void; activeId?: string | null; onSelect?: (id: string) => void; accountActive?: boolean }) => {
  const ui = useSample().ui;
  return (
    <DrawerMenu
      isOpen={isOpen}
      onClose={onClose}
      title={ui.menuTitle}
      items={ui.nav}
      activeId={activeId}
      onSelect={onSelect}
      contactLabel={ui.contact}
      onContact={noop}
      accountLabel={ui.account}
      onAccount={noop}
      accountActive={accountActive}
      safeArea={{ top: 24, bottom: 16 }}
      testID="drawer"
    />
  );
};

const Behind = () => {
  const ui = useSample().ui;
  return <div style={{ paddingTop: 24 }}><HeaderBar title={ui.appName} subtitle={ui.dateLine} /></div>;
};

const Interactive = () => {
  const { theme } = useTheme();
  const ui = useSample().ui;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('home');
  return (
    <Stage height={520}>
      <Behind />
      <div style={{ position: 'absolute', top: 120, left: 16, right: 16, display: 'grid', gap: 8, fontSize: 14 }}>
        <button onClick={() => setOpen(true)} style={{ padding: '10px 16px', borderRadius: 8, border: `1px solid ${theme.color.border.default}`, background: theme.color.accent.default, color: theme.color.text.onAccent, fontWeight: 600, cursor: 'pointer' }}>Open menu</button>
        <span data-testid="drawer-current">Current section: {ui.nav.find((n) => n.id === active)?.label}</span>
      </div>
      <Menu isOpen={open} onClose={() => setOpen(false)} activeId={active} onSelect={(id) => { setActive(id); setOpen(false); }} />
    </Stage>
  );
};

export const Examples = () => (
  <>
    <Example title="Open" note="The panel sits on the surface tone over the dimmed screen. The current section is accent colored on the accent.subtle tone."><Stage height={520}><Behind /><Menu isOpen /></Stage></Example>
    <Example title="Account active" note="When the account screen is current its pinned row turns accent, and no section is active."><Stage height={520}><Behind /><Menu isOpen activeId={null} accountActive /></Stage></Example>
    <Example title="Interactive" note="Open the menu, pick a section (the menu closes and the current section changes) or press the dimmed area to close."><Interactive /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={420}><Stage height={480}><Behind /><Menu isOpen /></Stage></BrandMatrix>;
