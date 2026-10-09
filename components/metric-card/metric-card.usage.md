# MetricCard

> Spec: [`metric-card.spec.yaml`](./metric-card.spec.yaml) · v0.2.1 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A fixed-width tile (172pt) that shows one metric: an icon and a title, one large light-weight number, a one-line
subtitle and an optional footer. It lives in a horizontal rail on the Stats screen.

The comparison with the previous period is **not** part of the card. It is a `ChangeIndicator`
(arrow + "+6% vs. last month") that the screen passes through the `footer` slot, next to or instead of a `SegmentBar`.

## When to use
- The Stats screen: overall compliance this month, most-completed habit, totals.
- Anywhere one number needs to be readable at a glance.

## When not to use
- Per-habit completion: that is a [HabitCard](../habit-card/habit-card.usage.md).
- Long-term trends: use a chart (WeeklyBarChart or a future component).
- Anything interactive: MetricCard is read-only.

## Do
- Preformat the value (`"87%"`, `28`) before passing it in; the component does not format.
- Always qualify the number in the subtitle ("this month", "times · Minuto heroico").
- Use `valueTone="muted"` and a `0` for an empty state instead of hiding the tile.
- Give the tile an `accessibilityLabel` that reads title, value, subtitle and the change as one sentence.

## Don't
- Don't celebrate or scold ("Great job!", "You're falling behind").
- Don't show more than one number per tile.
- Don't recolor the title; only the value uses the accent tone.
- Don't pair color with meaning alone: the ChangeIndicator always includes an arrow and a sign.

## Content
- Title: sentence case, 1–3 words ("Overall compliance").
- Change text: `-9% vs. last month`, `+6% vs. last month`.

## Implementation notes (React Native)
- Production: `w-43 flex-shrink-0 rounded-lg bg-surface p-md`, header `mb-md` with a 16pt icon and `text-xs font-medium text-foreground`, value via `StatNumber` (34pt, light, tracking -1.5, sans), subtitle `mt-xs text-xs text-muted` on one line, footer `mt-sm`.
- The 34pt (and 32/54pt) value sizes are literals today, not type-scale tokens (decision D-18).
- The rail animates in unless Reduce Motion is on; keep that behavior.

## Brand notes
The value color for `valueTone="accent"` is `text.accent`. In Plan de Vida that is tan on cream, below 4.5:1 (waiver PDV-W1). The positive ChangeIndicator uses the brand orange (waiver PDV-W7).

## Contract example
```tsx
<MetricCard
  icon={<Feather name="trending-up" size={16} />}
  title="Overall compliance"
  value="87%"
  valueTone="accent"
  subtitle="this month"
  footer={<ChangeIndicator changeVsLastMonth={6} />}
  accessibilityLabel="Overall compliance, 87 percent this month, up 6 percent versus last month"
/>
```
