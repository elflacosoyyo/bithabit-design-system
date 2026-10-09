# MonthCalendar

> Spec: [`month-calendar.spec.yaml`](./month-calendar.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A month as a grid: its title, a row of weekday letters, and the days in weeks. Each day is a [CalendarDay](../calendar-day/calendar-day.usage.md). The History tab of a habit stacks the last months, newest first.

## When to use
- Showing which days a habit was done, and letting the user correct a past day.

## When not to use
- A summary of the last week: use the [HabitCard](../habit-card/habit-card.usage.md) history strip.
- Statistics about a month: use [MetricCard](../metric-card/metric-card.usage.md).
- Choosing a date to schedule something: that is a date picker.

## Do
- Pass `today` from the device so the component stays testable.
- Format the title with the app's locale and capitalize it.
- Stack several months with 24pt between them, newest first.

## Don't
- Don't make future days pressable.
- Don't highlight streaks or add counters inside the grid.
- Don't hide the weekday letters visually; they only need to be hidden from assistive technology.

## Content
- Titles are the locale's month and year with a capital letter ("Octubre de 2026", "October 2026").
- Weekday letters follow the language: `D L M M J V S` in Spanish, `S M T W T F S` in English.

## Implementation notes (React Native)
- Production builds this inline in `HistoryTab`: for each of six months it computes the number of days and the first weekday, fills weeks of seven with `null` for empty columns and renders a `CalendarDay` per day.
- Compute dates in UTC or by plain date strings so the grid does not move with the time zone.
- The tab wraps the months in a `ScrollView` with `px-lg py-sm` and `gap-lg`.

## Brand notes
The title uses the brand's display font (Yrsa in Plan de Vida). Everything else comes from `CalendarDay`.

## Contract example
```tsx
<MonthCalendar
  year={2026}
  month={9}
  title="Octubre de 2026"
  dayLetters={['D', 'L', 'M', 'M', 'J', 'V', 'S']}
  completedDates={completedDatesSet}
  today="2026-10-09"
  onToggleDate={toggleDate}
  dayAccessibilityLabel={(date, { done }) => `${formatSpoken(date)}, ${done ? 'completado' : 'pendiente'}`}
/>
```
