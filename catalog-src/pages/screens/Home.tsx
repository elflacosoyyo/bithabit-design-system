import { BrandMatrix } from '../../helpers/BrandMatrix';
import { AppPhone } from '../../screens/AppPhone';
import type { HomeMode } from '../../screens/AppPhone';
import { loadScreen } from '../../screens/data';
import { Scaled } from '../../screens/PhoneFrame';
import { ScreenNotes } from '../../screens/Notes';
import { Workbench } from '../../screens/Workbench';

const modeFor = (state: string): HomeMode => (state === 'empty' ? 'empty' : state === 'all-done' ? 'all-done' : 'live');

export const Screen = () => {
  const doc = loadScreen('home');
  return (
    <Workbench
      title="Home"
      docs={[doc]}
      render={(state, onNav) => <AppPhone homeMode={modeFor(state)} initialDetail={state === 'detail-open' || state === 'detail-history' ? 0 : null} initialDetailTab={state === 'detail-history' ? 2 : 0} onNavChange={onNav} label="Home screen" />}
    />
  );
};

export const AllBrands = () => (
  <BrandMatrix minWidth={310}>
    <Scaled scale={0.72}><AppPhone label="Home screen" /></Scaled>
  </BrandMatrix>
);

export const Notes = () => <ScreenNotes id="home" />;
