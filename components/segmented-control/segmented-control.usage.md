# SegmentedControl

> Spec: [`segmented-control.spec.yaml`](./segmented-control.spec.yaml) · v0.1.0 · **draft**

## What it is
A pill-shaped control with a sliding thumb that switches between two to four views or values.

## When to use
- Switching content inside the same entity (Notes / History in the habit detail).
- Choosing one value from a small, fixed set when all options should stay visible.

## When not to use
- More than four options or long labels: use a list or a menu.
- Primary navigation between app areas: use the drawer.
- Binary on/off: use a Switch.

## Do
- Use single-noun, sentence-case labels.
- Set `semantics="radio"` when it chooses a setting; keep the default `tabs` when it switches views.
- Keep the control full-width inside its container.

## Don't
- Don't wrap labels onto two lines.
- Don't mix it with the chip-style selector in Settings. That duplicate pattern is flagged in the audit (D-08).
- Don't change the height of the content area when switching if it can be avoided.

## Implementation notes (React Native)
- Track is a `View` with `borderRadius: theme.segmentedControl.trackRadius` and `padding: theme.segmentedControl.trackPadding`.
- The thumb is an absolutely positioned animated `View`; measure segments once with `onLayout`.
- Selected label uses `fontWeight: theme.segmentedControl.fontWeightActive`.

## Brand notes
Track uses `bg.surface-alt` and thumb uses `bg.canvas`; both flip automatically in dark mode.

## Contract example
```tsx
<SegmentedControl
  accessibilityLabel="Habit detail view"
  options={[{ value: 'notes', label: 'Notes' }, { value: 'history', label: 'History' }]}
  value={tab}
  onChange={setTab}
/>
```
