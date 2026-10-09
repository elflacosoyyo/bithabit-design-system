import { useState } from 'react';
import { HabitCard, SwipeableHabitCard } from '../../../src';
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

const SwipeList = () => {
  const sample = useSample();
  const [done, setDone] = useState<boolean[]>(() => sample.habits.map(() => false));
  const [removed, setRemoved] = useState<number[]>([]);
  const [message, setMessage] = useState('');
  return (
    <div>
      {sample.habits.slice(0, 3).map((title, i) => {
        if (removed.includes(i)) return null;
        const hist = [...sample.history[i]];
        hist[6] = done[i];
        return (
          <SwipeableHabitCard
            key={title}
            title={title}
            completed={done[i]}
            history={hist}
            labels={sample.ui.swipe}
            onToggle={() => { setDone((d) => d.map((v, j) => (j === i ? !v : v))); setMessage(`${title}: toggled`); }}
            onDeleteRequest={() => { setRemoved((r) => [...r, i]); setMessage(`${title}: delete requested`); }}
            onPress={noop}
            testID={`swipe-${i}`}
          />
        );
      })}
      <div data-testid="swipe-status" style={{ fontSize: 13, padding: '8px 16px', opacity: 0.7 }}>{message || 'Drag a card sideways with the mouse or a finger.'}</div>
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
    <Example title="Swipeable" note="Drag a card right past 80px to toggle it (the background says Done or Undo) or left to request its deletion (production then shows a native alert). Shorter drags spring back."><SwipeList /></Example>
    <Example title="Interactive list" note="Press a checkbox: the card completes and today's segment fills. Titles follow the selected brand's voice."><TodayList /></Example>
  </>
);

export const AllBrands = () => <BrandMatrix><TodayList count={3} /></BrandMatrix>;
