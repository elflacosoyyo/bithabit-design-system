# SegmentedControl

> Spec: [`segmented-control.spec.yaml`](./segmented-control.spec.yaml) · v0.2.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A pill-shaped control that switches between two or three views of the same content. The selected segment gets a canvas-colored pill; the swap is instant (no sliding).

## When to use
- Switching content inside the same entity (Notes / History in the habit detail).
- Choosing one value from a small, fixed set when all options should stay visible.

## When not to use
- More than four options or long labels: use a list or a menu.
- Primary navigation between app areas: use the drawer.
- Binary on/off: use a Switch.

## Do
- Use single-noun, sentence-case labels.
- Pass the labels and the selected index; `onSelect` returns the pressed index.
- Keep the control full-width inside its container.

## Don't
- Don't wrap labels onto two lines.
- Don't mix it with the chip-style selector in Settings. That duplicate pattern is flagged in the audit (D-08).
- Don't change the height of the content area when switching if it can be avoided.

## Implementation notes (React Native)
- Production: a 36pt-high row (`h-9`), `rounded-pill`, `bg-input-bg`, 2pt padding; each segment is a `TouchableOpacity` whose inner view gets `bg-background` when active.
- Selected label is semibold, unselected medium, both `text-sm text-foreground`.
- Add `accessibilityRole="tab"` and `accessibilityState={{ selected }}` to each segment and a `tablist` role to the track (missing today).

## Brand notes
Track uses `bg.input` and thumb uses `bg.canvas`; both flip automatically in dark mode.

## Contract example
```tsx
<SegmentedControl
  labels={[t('habitDetail.notes'), t('habitDetail.history')]}
  selectedIndex={tabIndex}
  onSelect={setTabIndex}
/>
```
