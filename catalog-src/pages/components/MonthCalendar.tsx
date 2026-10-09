import { useState } from 'react';
import { MonthCalendar } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { useCalendar } from '../../helpers/calendar';
import { Example } from '../../helpers/layout';

const Month = ({ year = 2026, month = 9, initial }: { year?: number; month?: number; initial?: Set<string> }) => {
  const cal = useCalendar();
  const [done, setDone] = useState<Set<string>>(() => initial ?? cal.seed());
  return (
    <MonthCalendar
      year={year}
      month={month}
      title={cal.title(year, month)}
      dayLetters={cal.dayLetters}
      completedDates={done}
      today={cal.today}
      dayAccessibilityLabel={cal.dayLabel}
      onToggleDate={(d) => setDone((s) => { const n = new Set(s); if (n.has(d)) n.delete(d); else n.add(d); return n; })}
    />
  );
};

const September = () => {
  const full = new Set<string>();
  for (let d = 1; d <= 30; d++) full.add(`2026-09-${String(d).padStart(2, '0')}`);
  return <Month month={8} initial={full} />;
};

export const Examples = () => (
  <>
    <Example title="Interactive" note="Press a day up to today (October 9) to mark or unmark it. Later days are inert. The month starts on a Thursday, so the first row has four empty columns."><Month /></Example>
    <Example title="Empty month"><Month initial={new Set()} /></Example>
    <Example title="Full month" note="Every day of September done."><September /></Example>
    <Example title="Stack of months" note="The History tab stacks months newest first with 24pt between them (production shows six)."><div style={{ display: 'grid', gap: 24 }}><Month /><Month month={8} /></div></Example>
  </>
);

export const AllBrands = () => <BrandMatrix minWidth={400}><Month /></BrandMatrix>;
