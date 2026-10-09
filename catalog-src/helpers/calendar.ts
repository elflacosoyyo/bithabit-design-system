// Calendar content per brand. Dates are fixed (today is Friday, 9 October 2026) so the catalog output is deterministic.
import { useTheme } from '../../src/theme/ThemeProvider';

export const TODAY = '2026-10-09';

interface Words { locale: string; letters: string[]; done: string; notDone: string; today: string }
const WORDS: Record<string, Words> = {
  bithabit: { locale: 'en', letters: ['S', 'M', 'T', 'W', 'T', 'F', 'S'], done: 'completed', notDone: 'not completed', today: 'today' },
  plandevida: { locale: 'es', letters: ['D', 'L', 'M', 'M', 'J', 'V', 'S'], done: 'completado', notDone: 'pendiente', today: 'hoy' },
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const utc = (date: string) => new Date(`${date}T12:00:00Z`);

export interface CalendarContent {
  today: string;
  dayLetters: string[];
  title: (year: number, month: number) => string;
  dayLabel: (date: string, state: { done: boolean; today: boolean }) => string;
  /** Deterministic sample: October 1 to 9 and September, with gaps. */
  seed: () => Set<string>;
}

export const calendarFor = (brand: string): CalendarContent => {
  const w = WORDS[brand] ?? WORDS.bithabit;
  return {
    today: TODAY,
    dayLetters: w.letters,
    title: (year, month) => capitalize(new Date(Date.UTC(year, month, 1, 12)).toLocaleDateString(w.locale, { month: 'long', year: 'numeric', timeZone: 'UTC' })),
    dayLabel: (date, state) => `${capitalize(utc(date).toLocaleDateString(w.locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' }))}${state.today ? `, ${w.today}` : ''}, ${state.done ? w.done : w.notDone}`,
    seed: () => {
      const set = new Set<string>();
      for (let d = 1; d <= 29; d++) if (d % 4 !== 0) set.add(`2026-09-${String(d).padStart(2, '0')}`);
      for (let d = 1; d <= 9; d++) if (d % 3 !== 0) set.add(`2026-10-${String(d).padStart(2, '0')}`);
      return set;
    },
  };
};

export const useCalendar = (): CalendarContent => calendarFor(useTheme().brand);
