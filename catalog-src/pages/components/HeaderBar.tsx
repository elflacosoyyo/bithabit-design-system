import { HeaderBar } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

const Home = () => {
  const ui = useSample().ui;
  return <HeaderBar title={ui.appName} subtitle={ui.dateLine} />;
};

export const Examples = () => (
  <>
    <Example title="With subtitle" note="Home: the app name in the display serif and today's date on the trailing edge." width={375}><Home /></Example>
    <Example title="Title only" note="Other screens (Settings, Stats) have no subtitle." width={375}><HeaderBar title="Settings" /></Example>
    <Example title="Wrapping" note="When title and subtitle do not fit on one row, the row wraps and the subtitle drops below." width={260}><HeaderBar title="Account deleted" subtitle="Friday, October 9" /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={380}><Home /></BrandMatrix>;
