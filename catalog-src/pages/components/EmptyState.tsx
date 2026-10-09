import { EmptyState } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example } from '../../helpers/layout';
import { Stage } from '../../helpers/Stage';
import { useSample } from '../../helpers/sample';

const Both = () => {
  const ui = useSample().ui;
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <Stage height={150}><EmptyState message={ui.emptyHome} /></Stage>
      <Stage height={200}><EmptyState variant="centered" message={ui.emptyHabits} /></Stage>
    </div>
  );
};

export const Examples = () => {
  const ui = useSample().ui;
  return (
    <>
      <Example title="Inline" note="Home: top-aligned, 14pt sans, 48pt below the header."><Stage height={150}><EmptyState message={ui.emptyHome} /></Stage></Example>
      <Example title="Centered" note="Norms: fills the area, 18pt serif."><Stage height={240}><EmptyState variant="centered" message={ui.emptyHabits} /></Stage></Example>
    </>
  );
};

export const AllBrands = () => <BrandMatrix minWidth={400}><Both /></BrandMatrix>;
