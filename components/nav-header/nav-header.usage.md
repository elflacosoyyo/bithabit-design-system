# NavHeader

> Spec: [`nav-header.spec.yaml`](./nav-header.spec.yaml) · v0.1.0 · **draft** (verified against `Bakia/plan-de-vida` @ cdfea70)

## What it is
The thin bar at the top of a screen, under the status bar. It holds the menu or back button on the left and at most one action on the right. The screen's title is not here: it lives in a [HeaderBar](../header-bar/header-bar.usage.md) below.

## When to use
- At the top of every screen that has navigation or a header action.

## When not to use
- To show the screen title in large type: use HeaderBar.
- Inside bottom sheets: the sheet has its own handle and content.

## Do
- Put [IconButton](../icon-button/icon-button.usage.md)s in the slots.
- Keep it to one action on the right.

## Don't
- Don't add a border or a shadow under it.
- Don't put text buttons in the slots; use "Done" style text only where a screen already does.
- Don't change its height per screen.

## Implementation notes (React Native)
- In the app this is the navigator's header (`screenOptions` in `src/navigation/(drawer)/_layout.tsx`), with `headerTitle: () => null` and `headerShadowVisible: false`. Extracting a component means replacing the library header with `headerShown: false` and rendering this bar, which is a decision for the app team.
- Actions are passed through `Stack.Screen options={{ headerRight }}` today.

## Brand notes
Reads `color.bg.canvas`, so it follows every brand and dark mode.

## Contract example
```tsx
<NavHeader
  left={<IconButton icon={<Feather name="menu" size={24} />} accessibilityLabel={t('nav.menu')} onPress={openDrawer} />}
  right={<IconButton icon={<Feather name="plus" size={24} />} accessibilityLabel={t('nav.newHabit')} onPress={addHabit} />}
/>
```
