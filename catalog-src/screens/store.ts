// In-memory demo data shared by every screen page and the prototype: what you change on one page is still there on the next.
// Nothing is persisted; reloading the catalog resets it.
import { useSyncExternalStore } from 'react';
import type { Sample } from '../helpers/sample';

interface DemoState { done: Record<number, boolean>; removed: number[] }
const initial = (): DemoState => ({ done: {}, removed: [] });
let state = initial();
const listeners = new Set<() => void>();
const set = (next: DemoState) => { state = next; listeners.forEach((l) => l()); };

export const demo = {
  toggle: (index: number, current: boolean) => set({ ...state, done: { ...state.done, [index]: !current } }),
  remove: (index: number) => set({ ...state, removed: [...state.removed, index] }),
  reset: () => set(initial()),
};

export const useDemo = (): DemoState => useSyncExternalStore((l) => { listeners.add(l); return () => { listeners.delete(l); }; }, () => state);

export interface HabitRow { index: number; title: string; completed: boolean; history: boolean[] }

/** Builds the rows from a brand's sample content. `completed` defaults to today's entry of the sample history. */
export const buildHabits = (sample: Sample, done: Record<number, boolean>, removed: number[], forceDone = false): HabitRow[] =>
  sample.habits
    .map((title, index) => {
      const completed = forceDone ? done[index] ?? true : done[index] ?? sample.history[index][6];
      return { index, title, completed, history: [...sample.history[index].slice(0, 6), completed] };
    })
    .filter((h) => !removed.includes(h.index));
