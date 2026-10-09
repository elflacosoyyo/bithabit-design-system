// Sample content per brand, so examples also show each brand's voice (Plan de Vida speaks Spanish and says "normas").
import { useTheme } from '../../src/theme/ThemeProvider';

export interface Sample {
  habits: string[];
  history: boolean[][];
  stats: { title: string; value: string; subtitle: string; change: number; changeSuffix: string; emptyTitle: string; emptySubtitle: string };
  sheetTitle: string;
  tabs2: string[];
  tabs3: string[];
  notes: string;
}

const SAMPLES: Record<string, Sample> = {
  bithabit: {
    habits: ['Read ten pages', 'Drink water', 'Evening walk', 'Stretch'],
    history: [
      [true, true, false, true, true, true, true],
      [false, true, true, false, true, false, false],
      [true, true, true, true, true, true, true],
      [false, false, false, false, false, false, false],
    ],
    stats: { title: 'Overall compliance', value: '87%', subtitle: 'this month', change: 6, changeSuffix: 'vs. last month', emptyTitle: 'Most completed', emptySubtitle: 'times' },
    sheetTitle: 'Read ten pages',
    tabs2: ['Notes', 'History'],
    tabs3: ['Habit', 'Notes', 'History'],
    notes: 'Keep it small. Ten pages a day is a book a month.',
  },
  plandevida: {
    habits: ['Minuto heroico', 'Evangelio del día', 'Angelus', 'Examen de conciencia'],
    history: [
      [true, true, false, true, true, true, true],
      [false, true, true, false, true, false, false],
      [true, true, true, true, true, true, true],
      [false, false, false, false, false, false, false],
    ],
    stats: { title: 'Cumplimiento general', value: '87%', subtitle: 'este mes', change: 6, changeSuffix: 'vs. mes anterior', emptyTitle: 'Norma más cumplida', emptySubtitle: 'veces' },
    sheetTitle: 'Minuto heroico',
    tabs2: ['Notas', 'Historial'],
    tabs3: ['Norma', 'Notas', 'Historial'],
    notes: 'No es lo perfecto del plan, es esforzarse poco a poco y seguir intentándolo.',
  },
};

export const sampleFor = (brand: string): Sample => SAMPLES[brand] ?? SAMPLES.bithabit;
export const useSample = (): Sample => sampleFor(useTheme().brand);
