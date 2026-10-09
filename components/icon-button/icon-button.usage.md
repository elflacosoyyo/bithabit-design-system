# IconButton

> Spec: [`icon-button.spec.yaml`](./icon-button.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
A bare icon that triggers one action. It has no container, so the glyph sits directly on the screen and the touch target is invisible: a 40pt box plus a 4pt hit slop (48pt).

## When to use
- Navigation-header actions: open the menu, add a norm, edit a list.
- Any single, well-known action where an icon is enough and space is tight.

## When not to use
- Actions that need a visible label or are destructive: use [Button](../button/button.usage.md).
- A toggle with a persistent state (use a switch or a segmented control).
- Rows that navigate somewhere: those are list items with a chevron.

## Do
- Always pass `accessibilityLabel` with the action ("New norm").
- Use Feather-style stroke glyphs at 24pt in the foreground color.
- Use `loading` when the action starts something slow, so the user does not tap twice.

## Don't
- Don't tint the icon with the accent or fill it.
- Don't add a background, border or shadow.
- Don't put two icon actions closer than 8pt apart.
- Don't use it without a label "because the icon is obvious".

## Implementation notes (React Native)
- Production uses `TouchableOpacity` with `hitSlop={8}` and `className='mr-4 p-2'` in `headerRight`. The contract moves the 16pt trailing margin into the NavHeader's padding.
- The reference uses glyphs drawn with views so the catalog needs no icon package.

## Brand notes
The icon takes `text.primary`, so it adapts to every brand and to dark mode.

## Contract example
```tsx
<IconButton
  icon={<Feather name="plus" size={24} />}
  accessibilityLabel={t('nav.newHabit')}
  onPress={handleNewHabit}
  loading={isLoading}
/>
```
