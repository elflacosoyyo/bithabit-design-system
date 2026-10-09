import { useState } from 'react';
import { SegmentedControl } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

const Demo = () => {
  const sample = useSample();
  const [i2, setI2] = useState(0);
  const [i3, setI3] = useState(0);
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <SegmentedControl labels={sample.tabs2} selectedIndex={i2} onSelect={setI2} accessibilityLabel="Two segments" />
      <SegmentedControl labels={sample.tabs3} selectedIndex={i3} onSelect={setI3} accessibilityLabel="Three segments" />
    </div>
  );
};

export const Examples = () => (
  <>
    <Example title="Two segments" width={360}><SegmentedControl labels={['Notes', 'History']} selectedIndex={0} onSelect={noop} accessibilityLabel="Habit detail view" /></Example>
    <Example title="Three segments" width={360}><SegmentedControl labels={['Norm', 'Notes', 'History']} selectedIndex={1} onSelect={noop} accessibilityLabel="Habit detail view" /></Example>
    <Example title="Interactive" width={360} note="The selected segment gets a canvas-colored pill; the swap is instant, as in the app."><Demo /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix><Demo /></BrandMatrix>;
