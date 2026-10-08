# BottomSheet

> Spec: [`bottom-sheet.spec.yaml`](./bottom-sheet.spec.yaml) · v0.1.0 · **draft**

## What it is
A modal panel that slides up from the bottom, dims what is behind it and can be dragged between resting heights
or dismissed by swiping down. It is the product's main way to show detail without navigating.

## When to use
- Habit detail with tabs (Norm / Notes / History).
- Pickers and lists that belong to the current task (suggested habits).
- Short, focused tasks the user can abandon by swiping away.

## When not to use
- Destructive confirmations: use an alert dialog.
- Full multi-step flows (onboarding, paywall): use a screen.
- Anything the user must complete before continuing.

## Do
- Give the sheet a visible title or an `accessibilityLabel`.
- Put primary actions in a footer inside the sheet (e.g. "Mark as done today").
- Keep content scrollable; the sheet height is not a layout constraint.

## Don't
- Don't add a shadow; the dim backdrop and the large radius provide the lift.
- Don't blur the backdrop. It is a flat dim.
- Don't stack sheets on sheets.
- Don't make dismiss-by-backdrop unavailable without a visible close affordance.

## Implementation notes (React Native)
- Reanimated spring for the translation and a timing animation for the backdrop opacity (`opacity.backdrop`).
- Gesture Handler pan on the sheet; hand off to the inner `ScrollView` only at offset 0.
- Use `KeyboardAvoidingView` behavior so inputs inside stay visible.
- Honor Reduce Motion (`AccessibilityInfo.isReduceMotionEnabled`) with a fade instead of a spring.

## Brand notes
Colors come from `bg.canvas` (sheet) and `bg.overlay` (backdrop). Brands can change both without code changes.

## Contract example
```tsx
<BottomSheet visible={open} onClose={() => setOpen(false)} accessibilityLabel={habit.title}>
  <HabitDetail habit={habit} />
</BottomSheet>
```
