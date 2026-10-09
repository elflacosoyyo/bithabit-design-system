import { useState } from 'react';
import { Checkbox } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';

const Row = () => {
  const [a, setA] = useState(false);
  const [b, setB] = useState(true);
  return (
    <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
      <Checkbox checked={a} onChange={setA} accessibilityLabel="Unchecked example" />
      <Checkbox checked={b} onChange={setB} accessibilityLabel="Checked example" />
      <Checkbox checked={false} disabled onChange={noop} accessibilityLabel="Disabled example" />
    </div>
  );
};

export const Examples = () => (
  <>
    <Example title="Unchecked"><Checkbox checked={false} onChange={noop} accessibilityLabel="Evening walk" /></Example>
    <Example title="Checked" note="A bare check glyph: the ring disappears."><Checkbox checked onChange={noop} accessibilityLabel="Evening walk" /></Example>
    <Example title="Disabled"><Checkbox checked={false} disabled onChange={noop} accessibilityLabel="Evening walk" /></Example>
    <Example title="Interactive" note="Unchecked, checked and disabled together. The touch target is 48pt even though the visual is 24pt."><Row /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={280}><Row /></BrandMatrix>;
