# BottomSheet

> Spec: [`bottom-sheet.spec.yaml`](./bottom-sheet.spec.yaml) · v0.3.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A modal panel that slides up from the bottom, dims what is behind it and can be dragged down to dismiss.
It is content-sized (there are no snap points) and is the product's main way to show detail without navigating.

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
- Keep content scrollable inside the content slot. By default the sheet height follows its content.
- Pass `heightRatio` when the sheet must not change height as its content changes. The norm detail is always 70% of the screen, on every tab, so switching tabs does not make the sheet jump.
- The sheet does not avoid the keyboard. The content that owns an input must handle it.

## Don't
- Don't add a shadow; the dim backdrop and the large radius provide the lift.
- Don't blur the backdrop. It is a flat dim.
- Don't stack sheets on sheets.
- Don't make dismiss-by-backdrop unavailable without a visible close affordance.

## Implementation notes (React Native)
- Production renders in a transparent `Modal`. Open and close are Reanimated timing animations of 300ms (`bottom-sheet.duration`); the spring (damping 25, stiffness 100) is only used when a drag is released without dismissing.
- The pan gesture is attached to the handle region. Dismiss when dragged past 100pt or released faster than 500pt/s.
- Backdrop: the contract uses `bg.overlay`. Production currently uses the foreground color at 0.5 opacity, which turns cream in dark mode (see `code_gaps`).
- Honor Reduce Motion (`AccessibilityInfo.isReduceMotionEnabled`) with a fade instead of a slide.

## Brand notes
Colors come from `bg.canvas` (sheet), `text.secondary` (handle) and `bg.overlay` (backdrop). Brands can change them without code changes.

## Contract example
```tsx
<BottomSheet isOpen={open} onClose={() => setOpen(false)} accessibilityLabel={habit.title}>
  <HabitDetail habit={habit} />
</BottomSheet>
```
