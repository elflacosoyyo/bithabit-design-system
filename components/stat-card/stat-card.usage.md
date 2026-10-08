# StatCard

> Spec: [`stat-card.spec.yaml`](./stat-card.spec.yaml) · v0.1.0 · **draft**

## What it is
A small tile that shows one metric: a label, a large light-weight value, a qualifying caption and, optionally,
the change versus the previous period.

## When to use
- The Stats screen: overall compliance, most-completed habit, totals.
- Anywhere one number needs to be readable at a glance.

## When not to use
- Per-habit completion: that is a HabitCard.
- Long-term trends: use a chart (separate component).
- Anything interactive: StatCard is read-only in v1.

## Do
- Preformat the value (`"87%"`, `"243"`) before passing it in; the component does not format.
- Always include the period in the caption ("this month").
- Show an empty state with `0` and an honest caption instead of hiding the tile.
- Pair every color change with an arrow and a sign.

## Don't
- Don't celebrate or scold ("Great job!", "You're falling behind").
- Don't show more than one number per tile.
- Don't use the accent for the label; only the value is accent-colored.

## Content
- Labels: sentence case, 1–3 words ("Overall compliance").
- Delta: `-9% vs. last month`. Use the same wording for increases (`+6% vs. last month`).

## Implementation notes (React Native)
- Single `View` accessible as one element; compose the accessibility label from label, value, caption and delta.
- Two tiles per row with `flex: 1` and `theme.statCard.gap` between them.

## Brand notes
The value color is `text.accent`. In Plan de Vida this is tan on cream, below 4.5:1 (waiver PDV-W1, needs a design decision).

## Contract example
```tsx
<StatCard
  label="Overall compliance"
  value="87%"
  caption="this month"
  delta={{ value: 6, label: 'vs. last month' }}
/>
```
