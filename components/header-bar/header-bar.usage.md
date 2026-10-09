# HeaderBar

> Spec: [`header-bar.spec.yaml`](./header-bar.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
The screen title. A serif heading on the left and, optionally, a small line on the right (on Home, today's date). It sits right under the [NavHeader](../nav-header/nav-header.usage.md).

## When to use
- At the top of top-level screens (Home, Norms, Stats, Settings, My Account).

## When not to use
- Inside sheets or dialogs: use the sheet's own content.
- For section titles inside a screen: those are small caps labels, not a HeaderBar.

## Do
- Use a single noun in sentence case.
- Use the subtitle for a short, factual line (the date).

## Don't
- Don't put actions in it; they belong in the NavHeader.
- Don't change its weight or size per screen.
- Don't use the accent color for the title.

## Content
- Titles are bare nouns. On Home the title is the app name.

## Implementation notes (React Native)
- Production: `View` with `min-h-11 flex-row flex-wrap items-end justify-between bg-background px-lg`, title `font-serif text-3xl font-medium`, subtitle `font-sans text-xs`.
- The date comes from `formatHeaderDate`, which capitalizes each word.

## Brand notes
The title uses the brand's display font (Yrsa in Plan de Vida) through `typography.screen-title`.

## Contract example
```tsx
<HeaderBar title={t('appName')} subtitle={formatHeaderDate(new Date(), getLocale())} />
```
