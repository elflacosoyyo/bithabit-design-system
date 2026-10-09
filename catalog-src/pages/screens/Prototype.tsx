import type { Annotation } from '../../screens/data';
import { loadScreen } from '../../screens/data';
import { AppPhone } from '../../screens/AppPhone';
import type { NavState } from '../../screens/AppPhone';
import { P } from '../../helpers/ui';
import { Workbench } from '../../screens/Workbench';

/** Annotations that apply to what the phone shows right now: the menu's while it is open, Home's on Home, none on a placeholder. */
const scope = (nav: NavState, docs: Array<{ id: string; annotations: Annotation[] }>): Annotation[] => {
  const byId = (id: string) => docs.find((d) => d.id === id)?.annotations ?? [];
  return nav.drawerOpen ? byId('menu') : nav.section === 'home' ? byId('home') : [];
};

export const Prototype = () => {
  const home = loadScreen('home');
  const menu = loadScreen('menu');
  return (
    <Workbench
      title="Prototype"
      docs={[{ ...home, summary: 'The app as one navigable phone, built from the same screens and components as the pages above.', states: [{ id: 'live', label: 'Live', description: '' }] }, menu]}
      states={false}
      scopeAnnotations={scope}
      intro={<P muted>Press the menu button to open the drawer and move between sections. Sections that are not recreated yet say so. Swipe a card sideways, press a card to open its detail, press a checkbox to complete it, press the plus for a new norm, or Contact us to see the mail alert. The annotations follow the screen you are on.</P>}
      render={(_state, onNav) => <AppPhone onNavChange={onNav} label="App prototype" />}
    />
  );
};
