# Checkbox

> Spec: [`checkbox.spec.yaml`](./checkbox.spec.yaml) · v0.1.0 · **draft**

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
- `Pressable` with `hitSlop={theme.checkbox.hitSlop}`; ring is a `View` with `borderWidth: theme.checkbox.borderWidth`, `borderRadius: size / 2`.
- Check glyph: Feather `check` at the checkbox size, stroke in `theme.checkbox.check`.
- Disabled: `opacity: theme.checkbox.disabledOpacity` and `disabled` on the `Pressable`.

## Brand notes
Ring and check use `text.primary`, so they adapt automatically to every brand and to dark mode.

## Contract example
```tsx
<Checkbox
  checked={completedToday}
  onChange={(next) => setCompleted(habit.id, next)}
  accessibilityLabel={habit.title}
/>
```
