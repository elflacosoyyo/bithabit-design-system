# CalendarDay

> Spec: [`calendar-day.spec.yaml`](./calendar-day.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
One day in a month grid. A day number in a circle, on a surface-colored cell, with a thin strip below it. If the habit was done that day, the circle gets an accent ring and the strip fills with the accent. Today is a filled dark circle.

## When to use
- Inside a [MonthCalendar](../month-calendar/month-calendar.usage.md), seven to a row.
- Anywhere a single past or current day can be marked as done or not done.

## When not to use
- A week summary under a habit: that is the [HabitCard](../habit-card/habit-card.usage.md) history strip.
- Picking a date in a form: that needs a date picker.

## Do
- Always pass `accessibilityLabel` with the full date and state.
- Leave `onPress` out for future days so they are inert.
- Let the cell flex to fill its column; a row is seven of them with a 4pt gap.

## Don't
- Don't recolor the ring or the strip per habit. One accent, one meaning.
- Don't show "done" by the strip alone; the ring carries it too.
- Don't use a literal white for the today label; read `calendar.on-today`.
- Don't add numbers or icons inside the cell besides the day.

## Implementation notes (React Native)
- Production: `flex-1 items-center` wrapper, a `TouchableOpacity` cell with `rounded-t-md bg-surface px-xs py-sm`, a `h-6 w-6 rounded-full border-2` circle and a `h-xs` strip.
- The today circle uses `bg-today`; its label is `text-white` today and should be `text-on-today`.
- Read every color and size from the `calendar-day.*` tokens.

## Brand notes
The ring and the strip use the accent, the circle uses `color.calendar.today`. In dark mode that tone must stay visible on the cell: BITHABIT uses a mid gray, Plan de Vida's `#3F4244` is nearly invisible (waiver PDV-W8).

## Contract example
```tsx
<CalendarDay
  label={9}
  isToday
  isDone={completed.has('2026-10-09')}
  accessibilityLabel={t('calendar.dayLabel', { date: 'Viernes, 9 de octubre', state: 'completado' })}
  onPress={() => toggleDate('2026-10-09')}
/>
```
