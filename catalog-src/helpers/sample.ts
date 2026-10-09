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
  ui: {
    appName: string;
    dateLine: string;
    menuTitle: string;
    nav: Array<{ id: string; label: string }>;
    contact: string;
    account: string;
    openMenu: string;
    newHabit: string;
    editHabits: string;
    emptyHome: string;
    emptyHabits: string;
    swipe: { done: string; undo: string; delete: string };
    deleteTitle: string;
    deleteMessage: string;
    cancel: string;
    detailLabel: string;
    mailUnavailable: string;
    ok: string;
  };
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
    ui: {
      appName: 'BITHABIT',
      dateLine: 'Friday, October 9',
      menuTitle: 'Menu',
      nav: [{ id: 'home', label: 'Home' }, { id: 'habits', label: 'Habits' }, { id: 'stats', label: 'Stats' }, { id: 'subscription', label: 'Subscription' }, { id: 'settings', label: 'Settings' }],
      contact: 'Contact us',
      account: 'My account',
      openMenu: 'Open menu',
      newHabit: 'New habit',
      editHabits: 'Edit habits',
      emptyHome: 'No habits scheduled for today',
      emptyHabits: 'You have no habits yet. Add your first habit to get started.',
      swipe: { done: 'Done', undo: 'Undo', delete: 'Delete' },
      deleteTitle: 'Delete habit',
      deleteMessage: 'Are you sure you want to delete this habit?',
      cancel: 'Cancel',
      detailLabel: 'Habit detail',
      mailUnavailable: 'No mail app is available on this device.',
      ok: 'OK',
    },
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
    ui: {
      appName: 'Plan de Vida',
      dateLine: 'Viernes, 9 de Octubre',
      menuTitle: 'Menú',
      nav: [{ id: 'home', label: 'Plan de Vida' }, { id: 'habits', label: 'Normas' }, { id: 'stats', label: 'Estadísticas' }, { id: 'subscription', label: 'Suscripción' }, { id: 'settings', label: 'Ajustes' }],
      contact: 'Contáctanos',
      account: 'Mi cuenta',
      openMenu: 'Abrir menú',
      newHabit: 'Nueva norma',
      editHabits: 'Editar normas',
      emptyHome: 'No hay normas programadas para hoy',
      emptyHabits: 'Aún no tienes normas. Agrega tu primera norma para comenzar.',
      swipe: { done: 'Hecho', undo: 'Deshacer', delete: 'Eliminar' },
      deleteTitle: 'Eliminar Hábito',
      deleteMessage: '¿Estás seguro de que quieres eliminar este hábito?',
      cancel: 'Cancelar',
      detailLabel: 'Detalle de la norma',
      mailUnavailable: 'No hay una app de correo disponible en este dispositivo.',
      ok: 'OK',
    },
  },
};

export const sampleFor = (brand: string): Sample => SAMPLES[brand] ?? SAMPLES.bithabit;
export const useSample = (): Sample => sampleFor(useTheme().brand);
