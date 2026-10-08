# HabitCard

> Spec: [`habit-card.spec.yaml`](./habit-card.spec.yaml) · v0.1.0 · **draft**

## What it is
A full-width row that represents one habit on the Today screen. It combines a title, a completion
[Checkbox](../checkbox/checkbox.usage.md) and a **streak strip** underneath. The strip is the product's signature
visual: it replaces badges, flames and confetti with a quiet, rhythmic pattern.

## When to use
- Listing the user's habits for today, in the order the user chose.
- Any place where "see status + complete in one tap + open detail" is the job.

## When not to use
- Read-only history or statistics: use [StatCard](../stat-card/stat-card.usage.md) or a calendar.
- Settings rows or navigation rows: those are list items with a chevron, not cards.
- Anywhere a habit can't be completed from the list (no checkbox means it is not a HabitCard).

## Do
- Keep the title to one line of user-owned text.
- Stack cards with no gap; each card's strip separates it from the next.
- Pass `streakDays` as the real consecutive streak; the component clamps it to 7.
- Open the detail from the row and complete from the checkbox: two separate targets.

## Don't
- Don't add shadows, borders or gradients. Depth comes from the surface tone.
- Don't recolor the strip per habit. One accent, one meaning.
- Don't put a second action (menu, drag handle) next to the checkbox.
- Don't convey "done" by the strip alone; the check glyph must be present.

## Content
- Titles are written by the user or taken from the seed list; sentence case (in Spanish: "Minuto heroico", "Evangelio del día").
- Never truncate by rewriting the title; the component handles the ellipsis.

## Implementation notes (React Native)
- Use `Pressable` for the row and let the Checkbox be its own `Pressable` so the touch does not bubble.
- Apply `habit-card.pressed-opacity` on press; do not scale.
- Render the strip as 7 `View`s with `flex: 1` and `habit-card.strip.gap`; fill the last `streakDays` segments.
- Read every color, radius and spacing from the theme (`theme.habitCard.*`), never from literals.

## Brand notes
- **BITHABIT:** surface is a light gray, strip is the blue accent.
- **Plan de Vida:** cream surface with the tan strip. The tan-on-cream strip is below 3:1 contrast; it is accepted as decorative (waiver PDV-W2) because the check glyph carries the state.

## Contract example
```tsx
<HabitCard
  title="Angelus"
  completed
  streakDays={5}
  onToggle={() => toggleToday(habit.id)}
  onPress={() => openDetail(habit.id)}
/>
```

## Open questions
See `open_questions` in the spec. Until they are closed this component stays **draft**.
