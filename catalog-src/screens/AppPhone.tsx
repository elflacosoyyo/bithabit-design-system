// The app as a phone: Home plus a drawer that navigates between sections. Sections that are not recreated show a placeholder.
// Home, Menu and the Prototype pages are all this component with a different starting point.
import { useEffect, useState } from 'react';
import { BottomSheet, DrawerMenu } from '../../src';
import { useTheme } from '../../src/theme/ThemeProvider';
import { useSample } from '../helpers/sample';
import { HabitDetail } from './HabitDetail';
import { HomeScreen } from './HomeScreen';
import { NativeAlert } from './NativeAlert';
import { PendingScreen } from './PendingScreen';
import { PhoneFrame, STATUS_BAR } from './PhoneFrame';
import { buildHabits, demo, useDemo } from './store';
import type { HabitRow } from './store';

export type Section = 'home' | 'habits' | 'stats' | 'subscription' | 'settings' | 'account';
export type HomeMode = 'live' | 'empty' | 'all-done';
export interface NavState { section: Section; drawerOpen: boolean }

export interface AppPhoneProps {
  homeMode?: HomeMode;
  initialSection?: Section;
  initialDrawerOpen?: boolean;
  /** Habit index whose detail sheet starts open. */
  initialDetail?: number | null;
  /** Tab of the detail sheet that starts selected (0 habit, 1 notes, 2 history). */
  initialDetailTab?: number;
  onNavChange?: (nav: NavState) => void;
  label?: string;
}

type AlertState = { kind: 'delete'; habit: HabitRow } | { kind: 'mail' } | null;

const useHabitSource = (mode: HomeMode) => {
  const sample = useSample();
  const store = useDemo();
  const [local, setLocal] = useState<{ done: Record<number, boolean>; removed: number[] }>({ done: {}, removed: [] });
  if (mode === 'live') return { habits: buildHabits(sample, store.done, store.removed), toggle: demo.toggle, remove: demo.remove };
  if (mode === 'empty') return { habits: [] as HabitRow[], toggle: () => undefined, remove: () => undefined };
  return {
    habits: buildHabits(sample, local.done, local.removed, true),
    toggle: (i: number, cur: boolean) => setLocal((l) => ({ ...l, done: { ...l.done, [i]: !cur } })),
    remove: (i: number) => setLocal((l) => ({ ...l, removed: [...l.removed, i] })),
  };
};

export const AppPhone = ({ homeMode = 'live', initialSection = 'home', initialDrawerOpen = false, initialDetail = null, initialDetailTab = 0, onNavChange, label = 'App screen' }: AppPhoneProps) => {
  const ui = useSample().ui;
  const sample = useSample();
  const { theme } = useTheme();
  const [section, setSection] = useState<Section>(initialSection);
  const [drawerOpen, setDrawerOpen] = useState(initialDrawerOpen);
  const [detail, setDetail] = useState<number | null>(initialDetail);
  const [sheetOpen, setSheetOpen] = useState(initialDetail !== null);
  const [newOpen, setNewOpen] = useState(false);
  const [alert, setAlert] = useState<AlertState>(null);
  const source = useHabitSource(homeMode);

  useEffect(() => { onNavChange?.({ section, drawerOpen }); }, [section, drawerOpen, onNavChange]);

  const title = section === 'account' ? ui.account : ui.nav.find((n) => n.id === section)?.label ?? '';
  const closeSheet = () => { setSheetOpen(false); setTimeout(() => setDetail(null), 320); };

  return (
    <PhoneFrame label={label}>
      {section === 'home' ? (
        <HomeScreen
          habits={source.habits}
          onOpenMenu={() => setDrawerOpen(true)}
          onAdd={() => setNewOpen(true)}
          onToggle={(h) => source.toggle(h.index, h.completed)}
          onDeleteRequest={(h) => setAlert({ kind: 'delete', habit: h })}
          onOpenHabit={(h) => { setDetail(h.index); setSheetOpen(true); }}
        />
      ) : (
        <PendingScreen title={title} onOpenMenu={() => setDrawerOpen(true)} />
      )}

      <BottomSheet isOpen={sheetOpen} onClose={closeSheet} accessibilityLabel={ui.detailLabel} presentation="inline" heightRatio={theme.bottomSheet.detailHeightRatio}>
        <HabitDetail title={detail !== null ? sample.habits[detail] : ''} initialTab={initialDetailTab} />
      </BottomSheet>
      <BottomSheet isOpen={newOpen} onClose={() => setNewOpen(false)} accessibilityLabel={ui.newHabit} presentation="inline">
        <div style={{ padding: '4px 16px 32px', fontSize: 14, lineHeight: '20px' }}><b>{ui.newHabit}</b><br />This screen has not been recreated yet.</div>
      </BottomSheet>
      <DrawerMenu
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={ui.menuTitle}
        items={ui.nav}
        activeId={section === 'account' ? null : section}
        onSelect={(id) => { setSection(id as Section); setDrawerOpen(false); }}
        contactLabel={ui.contact}
        onContact={() => setAlert({ kind: 'mail' })}
        accountLabel={ui.account}
        onAccount={() => { setSection('account'); setDrawerOpen(false); }}
        accountActive={section === 'account'}
        safeArea={{ top: STATUS_BAR, bottom: 34 }}
        testID="drawer"
      />
      {alert?.kind === 'delete' ? (
        <NativeAlert
          testID="alert"
          title={ui.deleteTitle}
          message={ui.deleteMessage}
          actions={[
            { label: ui.cancel, style: 'cancel', onPress: () => setAlert(null) },
            { label: ui.swipe.delete, style: 'destructive', onPress: () => { source.remove(alert.habit.index); setAlert(null); } },
          ]}
        />
      ) : null}
      {alert?.kind === 'mail' ? <NativeAlert testID="alert" title="" message={ui.mailUnavailable} actions={[{ label: ui.ok, onPress: () => setAlert(null) }]} /> : null}
    </PhoneFrame>
  );
};
