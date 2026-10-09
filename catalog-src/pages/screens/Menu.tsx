import { BrandMatrix } from '../../helpers/BrandMatrix';
import { AppPhone } from '../../screens/AppPhone';
import { loadScreen } from '../../screens/data';
import { Scaled } from '../../screens/PhoneFrame';
import { ScreenNotes } from '../../screens/Notes';
import { Workbench } from '../../screens/Workbench';

export const Screen = () => {
  const doc = loadScreen('menu');
  return (
    <Workbench
      title="Menu"
      docs={[doc]}
      render={(state, onNav) => <AppPhone initialDrawerOpen initialSection={state === 'account' ? 'account' : 'home'} onNavChange={onNav} label="Menu screen" />}
    />
  );
};

export const AllBrands = () => (
  <BrandMatrix minWidth={310}>
    <Scaled scale={0.72}><AppPhone initialDrawerOpen label="Menu screen" /></Scaled>
  </BrandMatrix>
);

export const Notes = () => <ScreenNotes id="menu" />;
