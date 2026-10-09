import { useState } from 'react';
import { CalendarDay } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { useCalendar } from '../../helpers/calendar';
import { Example, noop } from '../../helpers/layout';

const Row = ({ days, done = false, today = false, inert = false }: { days: number[]; done?: boolean; today?: boolean; inert?: boolean }) => {
  const cal = useCalendar();
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {days.map((d) => (
        <CalendarDay key={d} label={d} isDone={done} isToday={today} onPress={inert ? undefined : noop} accessibilityLabel={cal.dayLabel(`2026-10-${String(d).padStart(2, '0')}`, { done, today })} />
      ))}
    </div>
  );
};

const Week = () => {
  const cal = useCalendar();
  const [done, setDone] = useState<boolean[]>([true, true, true, false, false, false, false]);
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {done.map((isDone, i) => {
        const day = 6 + i;
        const date = `2026-10-${String(day).padStart(2, '0')}`;
        return <CalendarDay key={day} label={day} isDone={isDone} isToday={date === cal.today} onPress={day <= 9 ? () => setDone((d) => d.map((v, j) => (j === i ? !v : v))) : undefined} accessibilityLabel={cal.dayLabel(date, { done: isDone, today: date === cal.today })} testID={`week-day-${day}`} />;
      })}
    </div>
  );
};

export const Examples = () => (
  <>
    <Example title="Default" note="Not done, not today."><Row days={[1, 2, 3, 4, 5, 6, 7]} /></Example>
    <Example title="Done" note="Accent ring around the number and an accent strip."><Row days={[1, 2, 3, 4, 5, 6, 7]} done /></Example>
    <Example title="Today" note="Filled circle with the on-today label."><Row days={[9, 9, 9, 9, 9, 9, 9]} today /></Example>
    <Example title="Today and done"><Row days={[9, 9, 9, 9, 9, 9, 9]} today done /></Example>
    <Example title="Inert" note="Future days have no onPress: not pressable, exposed as disabled, and no dimming."><Row days={[10, 11, 12, 13, 14, 15, 16]} inert /></Example>
    <Example title="Interactive week" note="Press a day up to today (the 9th) to mark or unmark it. The 10th onwards are in the future and do nothing."><Week /></Example>
  </>
);

export const AllBrands = () => (
  <BrandMatrix minWidth={380}>
    <div style={{ display: 'grid', gap: 8 }}>
      <Row days={[1, 2, 3, 4]} />
      <Row days={[5, 6, 7, 8]} done />
      <Row days={[9, 9, 9, 9]} today />
      <Row days={[9, 9, 9, 9]} today done />
    </div>
  </BrandMatrix>
);
