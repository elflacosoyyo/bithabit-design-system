# Checkbox

> Spec: [`checkbox.spec.yaml`](./checkbox.spec.yaml) · v0.2.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
The circular control used to mark a habit done for today. Unchecked it is a ring; checked it becomes a bare
check glyph (the ring disappears). It is deliberately quiet: no fill, no color accent.

## When to use
- Completing a habit for today (HabitCard, the detail sheet footer).
- Any single binary "done" state that is committed immediately.

## When not to use
- Settings toggles (on/off with an immediate system effect): use a Switch.
- Choosing one option among several: use SegmentedControl or a radio list.
- Multi-select forms needing a square checkbox: not part of this brand's language.

## Do
- Always pass an `accessibilityLabel` that names the habit.
- Keep the 48pt hit area (24pt visual + 12pt slop).
- Let the parent decide what happens after a toggle (undo, haptics).

## Don't
- Don't fill the circle with the accent color when checked.
- Don't place the Checkbox on its own line with a text label to its left; the label is the parent row.
- Don't animate with bounce or scale.

## Implementation notes (React Native)
- Today it is inline markup: a 24pt box that is a ring (`border-2 border-foreground`, `rounded-full`) when unchecked, and a Feather `check` (24pt, `text-foreground`) when checked. `HabitCard` and `FooterAction` each have a copy; the footer copy uses a 32pt box.
- Extracting it into one component with the tokens in `checkbox.*` removes that drift. Use `hitSlop` of `checkbox.hit-slop` (12) for a 48pt target; production uses 8.

## Brand notes
Ring and check use `text.primary` (`foreground` in BitHabit names), so they adapt automatically to every brand and to dark mode.

## Contract example
```tsx
<Checkbox
  checked={completedToday}
  onChange={(next) => setCompleted(habit.id, next)}
  accessibilityLabel={habit.title}
/>
```
