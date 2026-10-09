import { BRAND_IDS, brandName } from '../../src/theme/themes';
import { useTheme } from '../../src/theme/ThemeProvider';
import { Code, H1, H2, Page, P, Table } from '../helpers/ui';

const Intro = () => {
  const { brand, mode } = useTheme();
  return (
    <Page maxWidth={860}>
      <H1>BITHABIT Design System</H1>
      <P>
        One neutral default brand and any number of client brands, each shipped as its own app. This catalog is the visual reference and the
        audit tool; the contract that developers and their Claude read lives next to it (<Code>components/*/*.spec.yaml</Code> and <Code>*.usage.md</Code>).
      </P>
      <P muted>Currently showing <b>{brandName(brand)}</b> in <b>{mode}</b> mode. Use the toolbar above to switch brand and mode; every page follows it.</P>
      <H2>How to read this catalog</H2>
      <Table
        head={['Where', 'What for']}
        rows={[
          ['Foundations', 'Tokens resolved for the active brand and mode: colors, type, spacing, shape. "Brands" compares every brand side by side.'],
          ['Components', 'Each component with its states, an interactive version, an "All brands" matrix (every brand × light and dark) and a "Spec" page generated from its contract.'],
          ['Audit', 'WCAG contrast for every brand and mode with the documented waivers, and the status of the component inventory.'],
        ]}
      />
      <H2>Brands in this build</H2>
      <Table head={['Id', 'Name']} rows={BRAND_IDS.map((id) => [<Code key="i">{id}</Code>, brandName(id)])} />
      <H2>Reference components are not production code</H2>
      <P muted>
        They implement the <b>contract</b> in React Native, rendered on the web by react-native-web, and read tokens from the generated theme. They include the
        accessibility roles and hit areas that the production app is still missing (listed as <i>code gaps</i> in each Spec). Production uses NativeWind classes; the
        spec's token list tells you which class maps to which token.
      </P>
    </Page>
  );
};

export default Intro;
