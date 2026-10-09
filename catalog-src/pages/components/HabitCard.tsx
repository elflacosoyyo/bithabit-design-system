import { useState } from 'react';
import { HabitCard } from '../../../src';
import { BrandMatrix } from '../../helpers/BrandMatrix';
import { Example, noop } from '../../helpers/layout';
import { useSample } from '../../helpers/sample';

const TodayList = ({ count = 4 }: { count?: number }) => {
  const sample = useSample();
  const [done, setDone] = useState<boolean[]>(() => sample.habits.map((_, i) => i === 0));
  return (
    <div>
      {sample.habits.slice(0, count).map((title, i) => {
        const hist = [...sample.history[i]];
        hist[6] = done[i];
        return (
          <HabitCard
            key={title}
            title={title}
            completed={done[i]}
            history={hist}
            onToggle={() => setDone((d) => d.map((v, j) => (j === i ? !v : v)))}
            onPress={noop}
          />
        );
      })}
    </div>
  );
};

const base = { title: 'Evening walk', onToggle: noop, onPress: noop };

export const Examples = () => (
  <>
    <Example title="Default"><HabitCard {...base} completed={false} history={[true, true, false, true, true, true, false]} /></Example>
    <Example title="Completed" note="The checkbox shows the check glyph and today's segment is filled."><HabitCard {...base} completed history={[true, true, false, true, true, true, true]} /></Example>
    <Example title="Empty history"><HabitCard {...base} completed={false} history={[false, false, false, false, false, false, false]} /></Example>
    <Example title="Full week"><HabitCard {...base} completed history={[true, true, true, true, true, true, true]} /></Example>
    <Example title="Disabled" note="Both callbacks are blocked, as the list does while a card is being dragged."><HabitCard {...base} disabled completed={false} history={[true, false, true, true, false, true, false]} /></Example>
    <Example title="Interactive list" note="Press a checkbox: the card completes and today's segment fills. Titles follow the selected brand's voice."><TodayList /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix><TodayList count={3} /></BrandMatrix>;
