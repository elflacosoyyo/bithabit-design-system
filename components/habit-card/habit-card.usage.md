# HabitCard

> Spec: [`habit-card.spec.yaml`](./habit-card.spec.yaml) · v0.2.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A full-width row that represents one habit on the Today screen. It combines a title, a completion
[Checkbox](../checkbox/checkbox.usage.md) and a **history strip** underneath: one segment per day for the last 7 days,
oldest first, today last. The strip is the product's signature visual: it replaces badges, flames and confetti with a quiet, rhythmic pattern.

## When to use
- Listing the user's habits for today, in the order the user chose.
- Any place where "see status + complete in one tap + open detail" is the job.

## When not to use
- Read-only history or statistics: use [StatCard](../stat-card/stat-card.usage.md) or a calendar.
- Settings rows or navigation rows: those are list items with a chevron, not cards.
- Anywhere a habit can't be completed from the list (no checkbox means it is not a HabitCard).

## Do
- Keep the title to one line of user-owned text.
- In a list, wrap each card on the canvas with horizontal padding `md` and vertical padding `xs` (what `SwipeableHabitCard` does).
- Pass `history` as the completion of the last N days, oldest first and today last (the Home screen passes 7).
- Open the detail from the row and complete from the checkbox: two separate targets.

## Don't
- Don't add shadows, borders or gradients. Depth comes from the surface tone.
- Don't recolor the strip per habit. One accent, one meaning.
- Don't interpret `history` as a streak: a missed day in the middle stays empty.
- Don't put a second action (menu, drag handle) next to the checkbox.
- Don't convey "done" by the strip alone; the check glyph must be present.

## Content
- Titles are written by the user or taken from the seed list; sentence case (in Spanish: "Minuto heroico", "Evangelio del día").
- Never truncate by rewriting the title; the component handles the ellipsis.

## Implementation notes (React Native)
- Production uses `TouchableOpacity` for the row and for the checkbox (nested, so the checkbox press does not reach the row) and a light haptic on toggle.
- Render the strip as one `flex-1` `View` per `history` entry with `habit-card.strip.gap` between them, height `habit-card.strip.height`.
- `SwipeableHabitCard` adds the swipe gestures (right = toggle, left = delete with confirmation) and drag-to-reorder on long press. Thresholds are in the spec tokens (`habit-card.swipe.*`).
- Read every color, radius and spacing from tokens (Tailwind classes in NativeWind), never from literals.

## Brand notes
- **BITHABIT:** surface is a light gray, strip is the blue accent.
- **Plan de Vida:** cream surface with the tan strip. The tan-on-cream strip is below 3:1 contrast; it is accepted as decorative (waiver PDV-W2) because the check glyph carries the state. The swipe label is white on tan in light mode (waiver PDV-W6).

## Contract example
```tsx
<HabitCard
  title="Angelus"
  completed
  history={[false, false, true, true, true, true, true]}
  onToggle={() => toggleToday(habit.id)}
  onPress={() => openDetail(habit.id)}
/>
```

## Open questions
See `open_questions` and `code_gaps` in the spec. It stays **draft** until the designer approves the contract changes listed in `code_gaps`.
